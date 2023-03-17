import megalodon, { MegalodonInterface } from '@cutls/megalodon';
import Router from "@koa/router";
import { koaBody } from 'koa-body';
import { getClient } from '../ApiMastodonCompatibleService.js';
import { toLimitToInt } from './timeline.js';

export function apiAccountMastodon(router: Router): void {

    router.get('/v1/accounts/verify_credentials', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.verifyAccountCredentials();
            const acct = data.data;
            acct.url = `${BASE_URL}/@${acct.url}`
            acct.note = ''
            acct.avatar_static = acct.avatar
            acct.header = acct.header || ''
            acct.header_static = acct.header || ''
            acct.source = {
                note: acct.note,
                fields: acct.fields,
                privacy: 'public',
                sensitive: false,
                language: ''
            }
            ctx.body = acct
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.patch('/v1/accounts/update_credentials', async (ctx) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.updateCredentials((ctx.request as any).body as any);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.get<{ Params: { id: string } }>('/v1/accounts/:id', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getAccount(ctx.params.id);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.get<{ Params: { id: string } }>('/v1/accounts/:id/statuses', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getAccountStatuses(ctx.params.id, toLimitToInt(ctx.query as any));
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.get<{ Params: { id: string } }>('/v1/accounts/:id/followers', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getAccountFollowers(ctx.params.id, ctx.query as any);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.get<{ Params: { id: string } }>('/v1/accounts/:id/following', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getAccountFollowing(ctx.params.id, ctx.query as any);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.get<{ Params: { id: string } }>('/v1/accounts/:id/lists', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getAccountLists(ctx.params.id);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.post<{ Params: { id: string } }>('/v1/accounts/:id/follow', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.followAccount(ctx.params.id);
            const acct = data.data;
            acct.following = true;
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.post<{ Params: { id: string } }>('/v1/accounts/:id/unfollow', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.unfollowAccount(ctx.params.id);
            const acct = data.data;
            acct.following = false;
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.post<{ Params: { id: string } }>('/v1/accounts/:id/block', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.blockAccount(ctx.params.id);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.post<{ Params: { id: string } }>('/v1/accounts/:id/unblock', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.unblockAccount(ctx.params.id);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.post<{ Params: { id: string } }>('/v1/accounts/:id/mute',  async (ctx) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.muteAccount(ctx.params.id, (ctx.request as any).body as any);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.post<{ Params: { id: string } }>('/v1/accounts/:id/unmute', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.unmuteAccount(ctx.params.id);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.get('/v1/accounts/relationships', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const idsRaw = (ctx.query as any)['id[]']
            const ids = typeof idsRaw === 'string' ? [idsRaw] : idsRaw
            const data = await client.getRelationships(ids) as any;
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.get('/v1/bookmarks', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getBookmarks(ctx.query as any) as any;
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.get('/v1/favourites', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getFavourites(ctx.query as any);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.get('/v1/mutes', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getMutes(ctx.query as any);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.get('/v1/blocks', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getBlocks(ctx.query as any);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.get('/v1/follow_ctxs', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getFollowRequests((ctx.query as any || { limit: 20 }).limit);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.post<{ Params: { id: string } }>('/v1/follow_ctxs/:id/authorize', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.acceptFollowRequest(ctx.params.id);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });
    router.post<{ Params: { id: string } }>('/v1/follow_ctxs/:id/reject', async (ctx, next) => {
        const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
        const accessTokens = ctx.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.rejectFollowRequest(ctx.params.id);
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e)
            console.error(e.response.data)
            ctx.status =(401);
            ctx.body = e.response.data;
        }
    });

} 
