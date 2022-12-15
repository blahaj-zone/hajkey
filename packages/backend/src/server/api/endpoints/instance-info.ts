import * as os from 'node:os';
import si from 'systeminformation';
import config from '@/config/index.js';
import { fetchMeta } from '@/misc/fetch-meta.js';
import { Users, Notes, Instances, UserProfiles, Emojis } from '@/models/index.js';
import { Emoji } from '@/models/entities/emoji.js';
import { IsNull, In } from 'typeorm';
import { MAX_NOTE_TEXT_LENGTH, FILE_TYPE_BROWSERSAFE } from '@/const.js';
import define from '../define.js';

export const meta = {
	requireCredential: false,
	requireCredentialPrivateMode: true,
	allowGet: true,

	tags: ['meta'],
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async () => {
	const now = Date.now();
	const [
		meta,
		total,
		//activeHalfyear,
		//activeMonth,
		localPosts,
		instanceCount,
		firstAdmin,
		emojiList,
	] = await Promise.all([
		fetchMeta(true),
		Users.count({ where: { host: IsNull() } }),
		//Users.count({ where: { host: IsNull(), lastActiveDate: MoreThan(new Date(now - 15552000000)) } }),
		//Users.count({ where: { host: IsNull(), lastActiveDate: MoreThan(new Date(now - 2592000000)) } }),
		Notes.count({ where: { userHost: IsNull(), replyId: IsNull() } }),
		Instances.count(),
		Users.findOne({
			where: { host: IsNull(), isAdmin: true, isDeleted: false, isBot: false },
			order: { id: 'ASC' },
		}),
		Emojis.find({
			where: { host: IsNull(), type: In(FILE_TYPE_BROWSERSAFE) },
			select: ['id', 'name', 'originalUrl', 'publicUrl'],
		}),
	]);

	let firstProfile = firstAdmin ? await UserProfiles.findOne({ where: { userId: firstAdmin.id }}) : null;
	let descs = meta.description ? splitN(meta.description, '\n', 2) : [];

	const emojis = emojiList.reduce((a, e) => {
		a[e.name] = e
		return a
	}, {} as Record<string, Emoji>);

	return {
			"uri": config.hostname,
			"title": meta.name,
			"short_description": descs[0],
			"description": meta.description,
			"email": meta.maintainerEmail,
			"version": config.version,
			"urls": {
				"streaming_api": `wss://${config.host}`
			},
			"stats": {
				"user_count": total,
				"status_count": localPosts,
				"domain_count": instanceCount
			},
			"thumbnail": meta.logoImageUrl,
			"languages": meta.langs,
			"registrations": !meta.disableRegistration,
			"approval_required": false,
			"invites_enabled": false,
			"configuration": {
				"accounts": {
					"max_featured_tags": 16
				},
				"statuses": {
					"max_characters": MAX_NOTE_TEXT_LENGTH,
					"max_media_attachments": 16,
					"characters_reserved_per_url": 0
				},
				"media_attachments": {
					"supported_mime_types": FILE_TYPE_BROWSERSAFE,
					"image_size_limit": 10485760,
					"image_matrix_limit": 16777216,
					"video_size_limit": 41943040,
					"video_frame_rate_limit": 60,
					"video_matrix_limit": 2304000
				},
				"polls": {
					"max_options": 10,
					"max_characters_per_option": 50,
					"min_expiration": 15,
					"max_expiration": -1
				}
			},
			"contact_account": firstAdmin && firstProfile ? {
				id: firstAdmin.id,
				username: firstAdmin.username,
				acct: firstAdmin.username,
				display_name: firstAdmin.name,
				locked: firstAdmin.isLocked,
				bot: firstAdmin.isBot,
				created_at: firstAdmin.createdAt.toISOString(),
				note: firstProfile.description,
				url: `${config.url}/@${firstAdmin.username}`,
				avatar: firstAdmin.avatarId ? `${config.url}/files/${firstAdmin.avatarId}` : null,
				header: firstAdmin.bannerId ? `${config.url}/files/${firstAdmin.bannerId}` : null,
				avatar_static: firstAdmin.avatarId ? `${config.url}/files/${firstAdmin.avatarId}` : null,
				header_static: firstAdmin.bannerId ? `${config.url}/files/${firstAdmin.bannerId}` : null,
				followers_count: firstAdmin.followersCount,
				following_count: firstAdmin.followingCount,
				statuses_count: firstAdmin.notesCount,
				last_status_at: firstAdmin.lastActiveDate ? firstAdmin.lastActiveDate.toISOString() : null,
				noindex: firstProfile.noCrawle,
				emojis: firstAdmin.emojis ? firstAdmin.emojis.map(e => ({
					shortcode: e,
					static_url: `${config.url}/files/${emojis[e].publicUrl}`,
					url: `${config.url}/files/${emojis[e].originalUrl}`,
					visible_in_picker: true,
				})) : [],
				fields: firstProfile.fields ? firstProfile.fields.map(f => ({
					name: f.name,
					value: f.value,
					verified_at: null,
				})) : [],
			} : null,
			"rules": []
	};
});

const splitN = (s: string, split: string, n: number) => {
	const ret = [];

	let start = 0;
	let pos = s.indexOf(split);
	for (let i = 0; i < n - 1; i++) {
		ret.push(s.substring(start, pos));
		start = pos + split.length;
		pos = s.indexOf(split, start);
		if (pos === -1) break;
	}
	ret.push(s.substring(start));

	return ret;
};
