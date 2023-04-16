import define from "../../define.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { makePaginationQuery } from "../../common/make-pagination-query";
import { Brackets } from "typeorm";
import { Followings, Notes, UserLists } from "@/models/index.js";
import { generateVisibilityQuery } from "../../common/generate-visibility-query";
import { generateMutedUserQuery } from "../../common/generate-muted-user-query";
import { generateBlockedUserQuery } from "../../common/generate-block-query";

export const meta = {
	tags: ["notes"],

	requireCredential: false,
	requireCredentialPrivateMode: true,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "Note",
		},
	},
};

export const paramDef = {
	type: "object",
	properties: {
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },

		// Previously seen parent post ids
		seen: {
			type: "array",
			nullable: true,
			items: {
				type: "string",
				format: "misskey:id",
			},
		},

		// The types of posts to return
		include: {
			type: "array",
			nullable: true,
			items: {
				type: "string",
				enum: ["followers", "following", "recommended", "global", "home"],
			},
		},

		// User lists to include in the results
		lists: {
			type: "array",
			nullable: true,
			items: {
				type: "string",
				format: "misskey:id",
			},
		},

		// Channels to include in the results
		channels: {
			type: "array",
			nullable: true,
			items: {
				type: "string",
				format: "misskey:id",
			},
		},
	},
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const query = makePaginationQuery(
		Notes.createQueryBuilder("note"),
		ps.sinceId,
		ps.untilId,
	);

	const includeRecommended = ps.include?.includes("recommended");
	const m = includeRecommended ? await fetchMeta() : null;

	const brackets = new Brackets((qb) => {
		if (user && ps.include?.includes("followers")) {
			const followersQuery = Followings.createQueryBuilder("followers")
				.select("followers.followerId")
				.where("followers.followingId = :followingId", {
					followingId: user.id,
				});
			qb.orWhere(`note.userId IN (${followersQuery.getQuery()})`);
		}

		if (user && ps.include?.includes("following")) {
			const followingQuery = Followings.createQueryBuilder("following")
				.select("following.followeeId")
				.where("following.followerId = :followerId", {
					followerId: user.id,
				});
			qb.orWhere(`note.userId IN (${followingQuery.getQuery()})`);
		}

		if (includeRecommended) {
			qb.orWhere(
				`note.userHost = ANY ('{"${m?.recommendedInstances.join('","')}"}')`,
			);
		}

		if (ps.include?.includes("global")) {
			qb.orWhere("note.visibility = 'public'");
		}

		if (ps.include?.includes("home")) {
			qb.orWhere(
				"note.visibility IN ('home', 'public') AND note.userHost IS NULL",
			);
		}

		if (ps.lists?.length) {
			const lists = UserLists.createQueryBuilder("list")
				.select("list.userId")
				.where("list.id IN (:...ids)", { ids: ps.lists });
			qb.orWhere(`note.userId IN (${lists.getQuery()})`);
		}

		if (ps.channels?.length) {
			qb.orWhere("note.channelId IN (:...ids)", { ids: ps.channels });
		}
	});

	query
		.andWhere(brackets)
		.innerJoinAndSelect("note.user", "user")
		.leftJoinAndSelect("user.avatar", "avatar")
		.leftJoinAndSelect("user.banner", "banner")
		.leftJoinAndSelect("note.reply", "reply")
		.leftJoinAndSelect("note.renote", "renote")
		.leftJoinAndSelect("note.thread", "thread")

	generateVisibilityQuery(query, user);
	if (user) {
		generateMutedUserQuery(query, user);
		generateBlockedUserQuery(query, user);
	}

	let included: Record<string, boolean> = {};
	if (ps.seen?.length) {
		included = ps.seen.reduce((acc: Record<string, boolean>, id: string) => {
			acc[id] = true;
			return acc;
		}, included);
	}

	// We fetch more than requested because some may be filtered out, and if there's less than
	// requested, the pagination stops.
	const found = [];
	const take = Math.floor(ps.limit * 1.5);
	let skip = 0;
	while (found.length < ps.limit) {
		const notes = await query.take(take).skip(skip).getMany();
		const dedup = notes.filter((note) => {
			if (included[note.threadId ?? note.id]) return false;
			included[note.threadId ?? note.id] = true;
			return true;
		});
		found.push(...(await Notes.packMany(dedup, user)));
		skip += take;
		if (notes.length < take) break;
	}

	if (found.length > ps.limit) {
		found.length = ps.limit;
	}

	return found;
});
