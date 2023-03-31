import { Users } from "@/models/index.js";
import { resolveUser } from "@/remote/resolve-user.js";
import Router from "@koa/router";
import { FindOptionsWhere, IsNull } from "typeorm";
import { getClient } from "../ApiMastodonCompatibleService.js";
import { argsToBools, limitToInt } from "./timeline.js";
import { convertId, IdType } from "../../index.js";

const relationshipModel = {
	id: "",
	following: false,
	followed_by: false,
	delivery_following: false,
	blocking: false,
	blocked_by: false,
	muting: false,
	muting_notifications: false,
	requested: false,
	domain_blocking: false,
	showing_reblogs: false,
	endorsed: false,
	notifying: false,
	note: "",
};

export function apiAccountMastodon(router: Router): void {
	router.get("/v1/accounts/verify_credentials", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.verifyAccountCredentials();
			let acct = data.data;
			acct.id = convertId(acct.id, IdType.MastodonId);
			acct.display_name = acct.display_name || acct.username;
			acct.url = `${BASE_URL}/@${acct.url}`;
			acct.note = acct.note || "";
			acct.avatar_static = acct.avatar;
			acct.header = acct.header || "https://http.cat/404";
			acct.header_static = acct.header || "https://http.cat/404";
			acct.source = {
				note: acct.note,
				fields: acct.fields,
				privacy: "public",
				sensitive: false,
				language: "",
			};
			console.log(acct);
			ctx.body = acct;
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.patch("/v1/accounts/update_credentials", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.updateCredentials(
				(ctx.request as any).body as any,
			);
			let resp = data.data;
			resp.id = convertId(resp.id, IdType.MastodonId);
			ctx.body = resp;
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/accounts/lookup", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.search((ctx.request.query as any).acct, 'accounts');
			let resp = data.data.accounts[0];
			resp.id = convertId(resp.id, IdType.MastodonId);
			ctx.body = resp;
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get<{ Params: { id: string } }>(
		"/v1/accounts/:id(^.*\\d.*$)",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const calcId = convertId(ctx.params.id, IdType.CalckeyId);
				const data = await client.getAccount(calcId);
				let resp = data.data;
				resp.id = convertId(resp.id, IdType.MastodonId);
				ctx.body = resp;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get<{ Params: { id: string } }>(
		"/v1/accounts/:id/statuses",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getAccountStatuses(
					convertId(ctx.params.id, IdType.CalckeyId),
					argsToBools(limitToInt(ctx.query as any)),
				);
				let resp = data.data;
				for (let statIdx = 0; statIdx < resp.length; statIdx++) {
					resp[statIdx].id = convertId(resp[statIdx].id, IdType.MastodonId);
					resp[statIdx].in_reply_to_account_id = resp[statIdx].in_reply_to_account_id ? convertId(resp[statIdx].in_reply_to_account_id, IdType.MastodonId) : null;
					resp[statIdx].in_reply_to_id = resp[statIdx].in_reply_to_id ? convertId(resp[statIdx].in_reply_to_id, IdType.MastodonId) : null;
					let mentions = resp[statIdx].mentions
					for (let mtnIdx = 0; mtnIdx < mentions.length; mtnIdx++) {
						resp[statIdx].mentions[mtnIdx].id = convertId(mentions[mtnIdx].id, IdType.MastodonId);
					}
				}
				ctx.body = resp;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get<{ Params: { id: string } }>(
		"/v1/accounts/:id/followers",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getAccountFollowers(
					convertId(ctx.params.id, IdType.CalckeyId),
					limitToInt(ctx.query as any),
				);
				let resp = data.data;
				for (let acctIdx = 0; acctIdx < resp.length; acctIdx++) {
					resp[acctIdx].id = convertId(resp[acctIdx].id, IdType.MastodonId);
				}
				ctx.body = resp;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get<{ Params: { id: string } }>(
		"/v1/accounts/:id/following",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getAccountFollowing(
					convertId(ctx.params.id, IdType.CalckeyId),
					limitToInt(ctx.query as any),
				);
				let resp = data.data;
				for (let acctIdx = 0; acctIdx < resp.length; acctIdx++) {
					resp[acctIdx].id = convertId(resp[acctIdx].id, IdType.MastodonId);
				}
				ctx.body = resp;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get<{ Params: { id: string } }>(
		"/v1/accounts/:id/lists",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getAccountLists(ctx.params.id);
				ctx.body = data.data;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/accounts/:id/follow",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.followAccount(convertId(ctx.params.id, IdType.CalckeyId));
				let acct = data.data;
				acct.following = true;
				acct.id = convertId(acct.id, IdType.MastodonId);
				ctx.body = acct;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/accounts/:id/unfollow",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.unfollowAccount(convertId(ctx.params.id, IdType.CalckeyId));
				let acct = data.data;
				acct.id = convertId(acct.id, IdType.MastodonId);
				acct.following = false;
				ctx.body = acct;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/accounts/:id/block",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.blockAccount(convertId(ctx.params.id, IdType.CalckeyId));
				let resp = data.data;
				resp.id = convertId(resp.id, IdType.MastodonId);
				ctx.body = resp;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/accounts/:id/unblock",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.unblockAccount(convertId(ctx.params.id, IdType.MastodonId));
				let resp = data.data;
				resp.id = convertId(resp.id, IdType.MastodonId);
				ctx.body = resp;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/accounts/:id/mute",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.muteAccount(
					convertId(ctx.params.id, IdType.CalckeyId),
					(ctx.request as any).body as any,
				);
				let resp = data.data;
				resp.id = convertId(resp.id, IdType.MastodonId);
				ctx.body = resp;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/accounts/:id/unmute",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.unmuteAccount(convertId(ctx.params.id, IdType.CalckeyId));
				let resp = data.data;
				resp.id = convertId(resp.id, IdType.MastodonId);
				ctx.body = resp;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get("/v1/accounts/relationships", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		let users;
		try {
			// TODO: this should be body
			let ids = ctx.request.query ? ctx.request.query["id[]"] : null;
			if (typeof ids === "string") {
				ids = [ids];
			}
			users = ids;
			relationshipModel.id = ids?.toString() || "1";
			if (!ids) {
				ctx.body = [relationshipModel];
				return;
			}

			let reqIds = [];
			for (let i = 0; i < ids.length; i++) {
				reqIds.push(convertId(ids[i], IdType.CalckeyId));
			}
			
			const data = await client.getRelationships(reqIds);
			let resp = data.data;
			for (let acctIdx = 0; acctIdx < resp.length; acctIdx++) {
				resp[acctIdx].id = convertId(resp[acctIdx].id, IdType.MastodonId);
			}
			ctx.body = resp;
		} catch (e: any) {
			console.error(e);
			let data = e.response.data;
			data.users = users;
			console.error(data);
			ctx.status = 401;
			ctx.body = data;
		}
	});
	router.get("/v1/bookmarks", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = (await client.getBookmarks(limitToInt(ctx.query as any))) as any;
			let resp = data.data;
			for (let statIdx = 0; statIdx < resp.length; statIdx++) {
				resp[statIdx].id = convertId(resp[statIdx].id, IdType.MastodonId);
				resp[statIdx].in_reply_to_account_id = resp[statIdx].in_reply_to_account_id ? convertId(resp[statIdx].in_reply_to_account_id, IdType.MastodonId) : null;
				resp[statIdx].in_reply_to_id = resp[statIdx].in_reply_to_id ? convertId(resp[statIdx].in_reply_to_id, IdType.MastodonId) : null;
				let mentions = resp[statIdx].mentions
				for (let mtnIdx = 0; mtnIdx < mentions.length; mtnIdx++) {
					resp[statIdx].mentions[mtnIdx].id = convertId(mentions[mtnIdx].id, IdType.MastodonId);
				}
			}
			ctx.body = resp;
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/favourites", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getFavourites(limitToInt(ctx.query as any));
			let resp = data.data;
			for (let statIdx = 0; statIdx < resp.length; statIdx++) {
				resp[statIdx].id = convertId(resp[statIdx].id, IdType.MastodonId);
				resp[statIdx].in_reply_to_account_id = resp[statIdx].in_reply_to_account_id ? convertId(resp[statIdx].in_reply_to_account_id, IdType.MastodonId) : null;
				resp[statIdx].in_reply_to_id = resp[statIdx].in_reply_to_id ? convertId(resp[statIdx].in_reply_to_id, IdType.MastodonId) : null;
				let mentions = resp[statIdx].mentions
				for (let mtnIdx = 0; mtnIdx < mentions.length; mtnIdx++) {
					resp[statIdx].mentions[mtnIdx].id = convertId(mentions[mtnIdx].id, IdType.MastodonId);
				}
			}
			ctx.body = resp;
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/mutes", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getMutes(limitToInt(ctx.query as any));
			let resp = data.data;
			for (let acctIdx = 0; acctIdx < resp.length; acctIdx++) {
				resp[acctIdx].id = convertId(resp[acctIdx].id, IdType.MastodonId);
			}
			ctx.body = resp;
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/blocks", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getBlocks(limitToInt(ctx.query as any));
			let resp = data.data;
			for (let acctIdx = 0; acctIdx < resp.length; acctIdx++) {
				resp[acctIdx].id = convertId(resp[acctIdx].id, IdType.MastodonId);
			}
			ctx.body = resp;
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/follow_requests", async (ctx) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getFollowRequests(
				((ctx.query as any) || { limit: 20 }).limit,
			);
			let resp = data.data;
			for (let acctIdx = 0; acctIdx < resp.length; acctIdx++) {
				resp[acctIdx].id = convertId(resp[acctIdx].id, IdType.MastodonId);
			}
			ctx.body = resp;
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.post<{ Params: { id: string } }>(
		"/v1/follow_requests/:id/authorize",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.acceptFollowRequest(convertId(ctx.params.id, IdType.CalckeyId));
				let resp = data.data;
				resp.id = convertId(resp.id, IdType.MastodonId);
				ctx.body = resp;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/follow_requests/:id/reject",
		async (ctx) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.rejectFollowRequest(convertId(ctx.params.id, IdType.CalckeyId));
				let resp = data.data;
				resp.id = convertId(resp.id, IdType.MastodonId);
				ctx.body = resp;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
}
