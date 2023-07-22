import { Entity } from "megalodon";
import config from "@/config/index.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { Users, Notes } from "@/models/index.js";
import { IsNull } from "typeorm";
import { MAX_NOTE_TEXT_LENGTH, FILE_TYPE_BROWSERSAFE } from "@/const.js";

// TODO: add iceshrimp features
export async function getInstance(response: Entity.Instance, contact: Entity.Account) {
	const [meta, totalUsers, totalStatuses] =
		await Promise.all([
			fetchMeta(true),
			Users.count({ where: { host: IsNull() } }),
			Notes.count({ where: { userHost: IsNull() } }),
		]);

	return {
		uri: response.uri,
		title: response.title || "Iceshrimp",
		short_description:
			response.description?.substring(0, 50) || "See real server website",
		description:
			response.description ||
			"This is a vanilla Iceshrimp Instance. It doesn't seem to have a description.",
		email: response.email || "",
		version: `3.0.0 (compatible; Iceshrimp ${config.version})`,
		urls: response.urls,
		stats: {
			user_count: await totalUsers,
			status_count: await totalStatuses,
			domain_count: response.stats.domain_count,
		},
		thumbnail: response.thumbnail || "/static-assets/transparent.png",
		languages: meta.langs,
		registrations: !meta.disableRegistration || response.registrations,
		approval_required: !response.registrations,
		invites_enabled: response.registrations,
		configuration: {
			accounts: {
				max_featured_tags: 20,
			},
			statuses: {
				max_characters: MAX_NOTE_TEXT_LENGTH,
				max_media_attachments: 16,
				characters_reserved_per_url: response.uri.length,
			},
			media_attachments: {
				supported_mime_types: FILE_TYPE_BROWSERSAFE,
				image_size_limit: 10485760,
				image_matrix_limit: 16777216,
				video_size_limit: 41943040,
				video_frame_rate_limit: 60,
				video_matrix_limit: 2304000,
			},
			polls: {
				max_options: 10,
				max_characters_per_option: 50,
				min_expiration: 50,
				max_expiration: 2629746,
			},
		},
		contact_account: contact,
		rules: [],
	};
}
