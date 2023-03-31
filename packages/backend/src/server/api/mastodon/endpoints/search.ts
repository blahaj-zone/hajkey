import megalodon, { MegalodonInterface } from "@calckey/megalodon";
import Router from "@koa/router";
import { getClient } from "../ApiMastodonCompatibleService.js";
import axios from "axios";
import { Converter } from "@calckey/megalodon";
import { limitToInt } from "./timeline.js";

export function apiSearchMastodon(router: Router): void {
	router.get("/v1/search", async (ctx) => {
		const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
		const accessTokens = ctx.request.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		const body: any = ctx.request.body;
		try {
			const query: any = limitToInt(ctx.query);
			const type = query.type || "";
			const data = await client.search(query.q, type, query);
			ctx.body = data.data;
		} catch (e: any) {
			console.error(e);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v2/search", async (ctx) => {
		const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const query: any = limitToInt(ctx.query);
			const type = query.type;
			if (type) {
				const data = await client.search(query.q, type, query);
				ctx.body = data.data;
			} else {
				const acct = await client.search(query.q, "accounts", query);
				const stat = await client.search(query.q, "statuses", query);
				const tags = await client.search(query.q, "hashtags", query);
				ctx.body = {
					accounts: acct.data.accounts,
					statuses: stat.data.statuses,
					hashtags: tags.data.hashtags,
				};
			}
		} catch (e: any) {
			console.error(e);
			ctx.status = (401);
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/trends/statuses", async (ctx) => {
		const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
		const accessTokens = ctx.headers.authorization;
		try {
			const data = await getHighlight(BASE_URL, ctx.request.hostname, accessTokens);
			ctx.body = data;
		} catch (e: any) {
			console.error(e);
			ctx.status = (401);
			ctx.body = e.response.data;
		}
	});
	router.get("/v2/suggestions", async (ctx) => {
		const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
		const accessTokens = ctx.headers.authorization;
		try {
			const query: any = ctx.query;
			const data = await getFeaturedUser(
				BASE_URL,
				ctx.request.hostname,
				accessTokens,
				query.limit || 20,
			);
			console.log(data);
			ctx.body = data;
		} catch (e: any) {
			console.error(e);
			ctx.status = (401);
			ctx.body = e.response.data;
		}
	});
}
async function getHighlight(
	BASE_URL: string,
	domain: string,
	accessTokens: string | undefined,
) {
	const accessTokenArr = accessTokens?.split(" ") ?? [null];
	const accessToken = accessTokenArr[accessTokenArr.length - 1];
	try {
		const api = await axios.post(`${BASE_URL}/api/notes/featured`, {
			i: accessToken,
		});
		const data: MisskeyEntity.Note[] = api.data;
		return data.map((note) => Converter.note(note, domain));
	} catch (e: any) {
		console.log(e);
		console.log(e.response.data);
		return [];
	}
}
async function getFeaturedUser(
	BASE_URL: string,
	host: string,
	accessTokens: string | undefined,
	limit: number,
) {
	const accessTokenArr = accessTokens?.split(" ") ?? [null];
	const accessToken = accessTokenArr[accessTokenArr.length - 1];
	try {
		const api = await axios.post(`${BASE_URL}/api/users`, {
			i: accessToken,
			limit,
			origin: "local",
			sort: "+follower",
			state: "alive",
		});
		const data: MisskeyEntity.UserDetail[] = api.data;
		console.log(data);
		return data.map((u) => {
			return {
				source: "past_interactions",
				account: Converter.userDetail(u, host),
			};
		});
	} catch (e: any) {
		console.log(e);
		console.log(e.response.data);
		return [];
	}
}
