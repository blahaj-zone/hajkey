import megalodon, { MegalodonInterface } from '@cutls/megalodon';
import Router from "@koa/router";
import { koaBody } from 'koa-body';
import { getClient } from '../ApiMastodonCompatibleService.js';

export function apiSearchMastodon(router: Router): void {

	router.get('/v1/search',  async (ctx) => {
		const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
		const accessTokens = ctx.request.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		const body: any = ctx.request.body;
		try {
			const query: any = ctx.query
			const type = query.type || ''
			const data = await client.search(query.q, type, query);
			ctx.body = data.data;
		} catch (e: any) {
			console.error(e)
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});

}
