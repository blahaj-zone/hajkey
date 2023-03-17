import megalodon, { MegalodonInterface } from '@cutls/megalodon';
import Router from "@koa/router";
import { koaBody } from 'koa-body';
import { getClient } from '../ApiMastodonCompatibleService.js';

const readScope = [
	'read:account',
	'read:drive',
	'read:blocks',
	'read:favorites',
	'read:following',
	'read:messaging',
	'read:mutes',
	'read:notifications',
	'read:reactions',
	'read:pages',
	'read:page-likes',
	'read:user-groups',
	'read:channels',
	'read:gallery',
	'read:gallery-likes'
]
const writeScope = [
	'write:account',
	'write:drive',
	'write:blocks',
	'write:favorites',
	'write:following',
	'write:messaging',
	'write:mutes',
	'write:notes',
	'write:notifications',
	'write:reactions',
	'write:votes',
	'write:pages',
	'write:page-likes',
	'write:user-groups',
	'write:channels',
	'write:gallery',
	'write:gallery-likes'
]

export function apiAuthMastodon(router: Router): void {

	router.post('/v1/apps',  async (ctx) => {
		const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
		const accessTokens = ctx.request.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		const body: any = ctx.request.body;
		try {
			let scope = body.scopes
			console.log(body)
			if (typeof scope === 'string') scope = scope.split(' ')
			const pushScope = new Set<string>()
			for (const s of scope) {
				if (s.match(/^read/)) for (const r of readScope) pushScope.add(r)
				if (s.match(/^write/)) for (const r of writeScope) pushScope.add(r)
			}
			const scopeArr = Array.from(pushScope)

			let red = body.redirect_uris
			if (red === 'urn:ietf:wg:oauth:2.0:oob') {
				red = 'https://thedesk.top/hello.html'
			}
			const appData = await client.registerApp(body.client_name, { scopes: scopeArr, redirect_uris: red, website: body.website });
			ctx.body = {
				id: appData.id,
				name: appData.name,
				website: appData.website,
				redirect_uri: red,
				client_id: Buffer.from(appData.url || '').toString('base64'),
				client_secret: appData.clientSecret,
			}
		} catch (e: any) {
			console.error(e)
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});

}
