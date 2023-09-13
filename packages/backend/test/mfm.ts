import * as assert from "assert";
import * as mfm from "mfm-js";

import { toHtml } from "../src/mfm/to-html.js";
import { fromHtml } from "../src/mfm/from-html.js";

describe("toHtml", () => {
	it("br", () => {
		const input = "foo\nbar\nbaz";
		const output = "<p><span>foo<br>bar<br>baz</span></p>";
		assert.equal(toHtml(mfm.parse(input)), output);
	});

	it("br alt", () => {
		const input = "foo\r\nbar\rbaz";
		const output = "<p><span>foo<br>bar<br>baz</span></p>";
		assert.equal(toHtml(mfm.parse(input)), output);
	});
});

describe("fromHtml", () => {
	it("p", async () => {
		assert.deepStrictEqual(await fromHtml("<p>a</p><p>b</p>"), "a\n\nb");
	});

	it("block element", async () => {
		assert.deepStrictEqual(await fromHtml("<div>a</div><div>b</div>"), "a\nb");
	});

	it("inline element", async () => {
		assert.deepStrictEqual(await fromHtml("<ul><li>a</li><li>b</li></ul>"), "a\nb");
	});

	it("block code", async () => {
		assert.deepStrictEqual(
			await fromHtml("<pre><code>a\nb</code></pre>"),
			"```\na\nb\n```",
		);
	});

	it("inline code", async () => {
		assert.deepStrictEqual(await fromHtml("<code>a</code>"), "`a`");
	});

	it("quote", async () => {
		assert.deepStrictEqual(
			await fromHtml("<blockquote>a\nb</blockquote>"),
			"> a\n> b",
		);
	});

	it("br", async () => {
		assert.deepStrictEqual(await fromHtml("<p>abc<br><br/>d</p>"), "abc\n\nd");
	});

	it("link with different text", async () => {
		assert.deepStrictEqual(
			await fromHtml('<p>a <a href="https://iceshrimp.dev/b">c</a> d</p>'),
			"a [c](https://iceshrimp.dev/b) d",
		);
	});

	it("link with different text, but not encoded", async () => {
		assert.deepStrictEqual(
			await fromHtml('<p>a <a href="https://iceshrimp.dev/ä">c</a> d</p>'),
			"a [c](<https://iceshrimp.dev/ä>) d",
		);
	});

	it("link with same text", async () => {
		assert.deepStrictEqual(
			await fromHtml(
				'<p>a <a href="https://joiniceshrimp.org/b">https://joiniceshrimp.org/b</a> d</p>',
			),
			"a https://joiniceshrimp.org/b d",
		);
	});

	it("link with same text, but not encoded", async () => {
		assert.deepStrictEqual(
			await fromHtml(
				'<p>a <a href="https://joiniceshrimp.org/ä">https://joiniceshrimp.org/ä</a> d</p>',
			),
			"a <https://joiniceshrimp.org/ä> d",
		);
	});

	it("link with no url", async () => {
		assert.deepStrictEqual(
			await fromHtml('<p>a <a href="b">c</a> d</p>'),
			"a [c](b) d",
		);
	});

	it("link without href", async () => {
		assert.deepStrictEqual(await fromHtml("<p>a <a>c</a> d</p>"), "a c d");
	});

	it("link without text", async () => {
		assert.deepStrictEqual(
			await fromHtml('<p>a <a href="https://joiniceshrimp.org/b"></a> d</p>'),
			"a https://joiniceshrimp.org/b d",
		);
	});

	it("link without both", async () => {
		assert.deepStrictEqual(await fromHtml("<p>a <a></a> d</p>"), "a  d");
	});

	it("mention", async () => {
		assert.deepStrictEqual(
			await fromHtml(
				'<p>a <a href="https://joiniceshrimp.org/@user" class="u-url mention">@user</a> d</p>',
				undefined,
				false
			),
			"a @user@joiniceshrimp.org d",
		);
	});

	it("hashtag", async () => {
		assert.deepStrictEqual(
			await fromHtml('<p>a <a href="https://joiniceshrimp.org/tags/a">#a</a> d</p>', [
				"#a",
			]),
			"a #a d",
		);
	});
});
