import megalodon, { MegalodonInterface } from '@cutls/megalodon';
import Router from "@koa/router";
import { koaBody } from 'koa-body';
import { getClient } from '../ApiMastodonCompatibleService.js';
import { toTextWithReaction } from './timeline.js';
function toLimitToInt(q: any) {
    if (q.limit) if (typeof q.limit === 'string') q.limit = parseInt(q.limit, 10)
    return q
}

export function apiNotificationsMastodon(router: Router): void {

	router.get('/v1/notifications',  async (ctx) => {
		const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
		const accessTokens = ctx.request.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		const body: any = ctx.request.body;
		try {
			const data = await client.getNotifications(toLimitToInt(ctx.query));
			const notfs = data.data;
			const ret = notfs.map((n) => {
					if(n.type !== 'follow' && n.type !== 'follow_request') {
							if (n.type === 'reaction') n.type = 'favourite'
							n.status = toTextWithReaction(n.status ? [n.status] : [], ctx.hostname)[0]
							return n
					} else {
							return n
					}
			})
			ctx.body = ret;
		} catch (e: any) {
			console.error(e)
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});

	router.get('/v1/notification/:id',  async (ctx) => {
		const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
		const accessTokens = ctx.request.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		const body: any = ctx.request.body;
		try {
			const dataRaw = await client.getNotification(ctx.params.id);
			const data = dataRaw.data;
			if(data.type !== 'follow' && data.type !== 'follow_request') {
					if (data.type === 'reaction') data.type = 'favourite'
					ctx.body = toTextWithReaction([data as any], ctx.request.hostname)[0]
			} else {
					ctx.body = data
			}
		} catch (e: any) {
			console.error(e)
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});

	router.post('/v1/notifications/clear',  async (ctx) => {
		const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
		const accessTokens = ctx.request.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		const body: any = ctx.request.body;
		try {
			const data = await client.dismissNotifications();
			ctx.body = data.data;
		} catch (e: any) {
			console.error(e)
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});

	router.post('/v1/notification/:id/dismiss',  async (ctx) => {
		const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
		const accessTokens = ctx.request.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		const body: any = ctx.request.body;
		try {
			const data = await client.dismissNotification(ctx.params.id);
			ctx.body = data.data;
		} catch (e: any) {
			console.error(e)
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});

}
