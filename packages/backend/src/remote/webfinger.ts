import { URL } from "node:url";
import {getJson, getResponse} from "@/misc/fetch.js";
import { query as urlQuery } from "@/prelude/url.js";
import config from "@/config/index.js";
import { XMLParser } from "fast-xml-parser";

type ILink = {
	href: string;
	rel?: string;
};

type IWebFinger = {
	links: ILink[];
	subject: string;
};

export default async function (query: string): Promise<IWebFinger> {
	const hostMetaUrl = queryToHostMetaUrl(query);
	const webFingerTemplate = await hostMetaToWebFingerTemplate(hostMetaUrl) ?? queryToWebFingerTemplate(query);
	const url = genWebFingerUrl(query, webFingerTemplate);

	return (await getJson(
		url,
		"application/jrd+json, application/json",
	)) as IWebFinger;
}

async function hostMetaToWebFingerTemplate(url: string) {
	try {
		const res = await getResponse({
			url,
			method: "GET",
			headers: Object.assign(
				{
					"User-Agent": config.userAgent,
					Accept: "application/xrd+xml.",
				},
				{},
			),
			timeout: 10000,
		});
		const options = {
			ignoreAttributes: false,
			isArray: (_name: string, jpath: string) => jpath === 'XRD.Link',
		};
		const parser = new XMLParser(options);
		const hostMeta = parser.parse(await res.text());
		const template = (hostMeta['XRD']['Link'] as Array<any>).filter(p => p['@_rel'] === 'lrdd')[0]['@_template'];
		return template.indexOf('{uri}') < 0 ? null : template;
	}
	catch {
		return null;
	}
}

function queryToWebFingerTemplate(query: string) {
	if (query.match(/^https?:\/\//)) {
		const u = new URL(query);
		return `${u.protocol}//${u.hostname}/.well-known/webfinger?resource={uri}`;
	}

	const m = query.match(/^([^@]+)@(.*)/);
	if (m) {
		const hostname = m[2];
		return `https://${hostname}/.well-known/webfinger?resource={uri}`;
	}

	throw new Error(`Invalid query (${query})`);
}

function queryToHostMetaUrl(query: string) {
	if (query.match(/^https?:\/\//)) {
		const u = new URL(query);
		return `${u.protocol}//${u.hostname}/.well-known/host-meta`;
	}

	const m = query.match(/^([^@]+)@(.*)/);
	if (m) {
		const hostname = m[2];
		return `https://${hostname}/.well-known/host-meta`;
	}

	throw new Error(`Invalid query (${query})`);
}

function genWebFingerUrl(query: string, webFingerTemplate: string) {
	if (webFingerTemplate.indexOf('{uri}') < 0)
		throw new Error(`Invalid webFingerUrl: ${webFingerTemplate}`);

	if (query.match(/^https?:\/\//)) {
		return webFingerTemplate.replace('{uri}', encodeURIComponent(query));
	}

	const m = query.match(/^([^@]+)@(.*)/);
	if (m) {
		return webFingerTemplate.replace('{uri}', encodeURIComponent(`acct:${query}`));
	}

	throw new Error(`Invalid query (${query})`);
}
