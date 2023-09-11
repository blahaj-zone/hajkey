import { URL } from "node:url";
import * as parse5 from "parse5";
import { defaultTreeAdapter as treeAdapter } from "parse5";
import { getSubjectHostFromUriAndUsernameCached } from "@/remote/resolve-user.js";

const urlRegex = /^https?:\/\/[\w\/:%#@$&?!()\[\]~.,=+\-]+/;
const urlRegexFull = /^https?:\/\/[\w\/:%#@$&?!()\[\]~.,=+\-]+$/;

export async function fromHtml(html: string, hashtagNames?: string[], basicMentionResolve: boolean = false): Promise<string> {
	// some AP servers like Pixelfed use br tags as well as newlines
	html = html.replace(/<br\s?\/?>\r?\n/gi, "\n");

	const dom = parse5.parseFragment(html);

	let text = "";

	for (const n of dom.childNodes) {
		await analyze(n);
	}

	return text.trim();

	function getText(node: TreeAdapter.Node): string {
		if (treeAdapter.isTextNode(node)) return node.value;
		if (!treeAdapter.isElementNode(node)) return "";
		if (node.nodeName === "br") return "\n";

		if (node.childNodes) {
			return node.childNodes.map((n) => getText(n)).join("");
		}

		return "";
	}

	async function appendChildren(childNodes: TreeAdapter.ChildNode[]): Promise<void> {
		if (childNodes) {
			for (const n of childNodes) {
				await analyze(n);
			}
		}
	}

	async function analyze(node: TreeAdapter.Node) {
		if (treeAdapter.isTextNode(node)) {
			text += node.value;
			return;
		}

		// Skip comment or document type node
		if (!treeAdapter.isElementNode(node)) return;

		switch (node.nodeName) {
			case "br": {
				text += "\n";
				break;
			}

			case "a": {
				const txt = getText(node);
				const rel = node.attrs.find((x) => x.name === "rel");
				const href = node.attrs.find((x) => x.name === "href");

				// ハッシュタグ
				if (
					hashtagNames &&
					href &&
					hashtagNames.map((x) => x.toLowerCase()).includes(txt.toLowerCase())
				) {
					text += txt;
					// メンション
				} else if (txt.startsWith("@") && !rel?.value.match(/^me /)) {
					const part = txt.split("@");

					if (part.length === 2 && href) {
						//#region ホスト名部分が省略されているので復元する
						const acct = basicMentionResolve
							? `${txt}@${new URL(href.value).hostname}`
							: `${txt}@${await getSubjectHostFromUriAndUsernameCached(href.value, txt)}`;
						text += acct;
						//#endregion
					} else if (part.length === 3) {
						text += txt;
					}
					// その他
				} else {
					const generateLink = () => {
						if (!(href || txt)) {
							return "";
						}
						if (!href) {
							return txt;
						}
						if (!txt || txt === href.value) {
							// #6383: Missing text node
							if (href.value.match(urlRegexFull)) {
								return href.value;
							} else {
								return `<${href.value}>`;
							}
						}
						if (href.value.match(urlRegex) && !href.value.match(urlRegexFull)) {
							return `[${txt}](<${href.value}>)`; // #6846
						} else {
							return `[${txt}](${href.value})`;
						}
					};

					text += generateLink();
				}
				break;
			}

			case "h1": {
				text += "【";
				await appendChildren(node.childNodes);
				text += "】\n";
				break;
			}

			case "b":
			case "strong": {
				text += "**";
				await appendChildren(node.childNodes);
				text += "**";
				break;
			}

			case "small": {
				text += "<small>";
				await appendChildren(node.childNodes);
				text += "</small>";
				break;
			}

			case "s":
			case "del": {
				text += "~~";
				await appendChildren(node.childNodes);
				text += "~~";
				break;
			}

			case "i":
			case "em": {
				text += "<i>";
				await appendChildren(node.childNodes);
				text += "</i>";
				break;
			}

			// block code (<pre><code>)
			case "pre": {
				if (
					node.childNodes.length === 1 &&
					node.childNodes[0].nodeName === "code"
				) {
					text += "\n```\n";
					text += getText(node.childNodes[0]);
					text += "\n```\n";
				} else {
					await appendChildren(node.childNodes);
				}
				break;
			}

			// inline code (<code>)
			case "code": {
				text += "`";
				await appendChildren(node.childNodes);
				text += "`";
				break;
			}

			case "blockquote": {
				const t = getText(node);
				if (t) {
					text += "\n> ";
					text += t.split("\n").join("\n> ");
				}
				break;
			}

			case "p":
			case "h2":
			case "h3":
			case "h4":
			case "h5":
			case "h6": {
				text += "\n\n";
				await appendChildren(node.childNodes);
				break;
			}

			// other block elements
			case "div":
			case "header":
			case "footer":
			case "article":
			case "li":
			case "dt":
			case "dd": {
				text += "\n";
				await appendChildren(node.childNodes);
				break;
			}

			default: {
				// includes inline elements
				await appendChildren(node.childNodes);
				break;
			}
		}
	}
}
