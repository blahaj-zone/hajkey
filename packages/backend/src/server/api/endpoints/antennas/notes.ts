import define from "../../define.js";
import readNote from "@/services/note/read.js";
import { Antennas, Notes } from "@/models/index.js";
import { redisClient } from "@/db/redis.js";
import { makePaginationQuery } from "../../common/make-pagination-query.js";
import { generateVisibilityQuery } from "../../common/generate-visibility-query.js";
import { generateMutedUserQuery } from "../../common/generate-muted-user-query.js";
import { ApiError } from "../../error.js";
import { generateBlockedUserQuery } from "../../common/generate-block-query.js";
import { Note } from "@/models/entities/note.js";

export const meta = {
	tags: ["antennas", "account", "notes"],

	requireCredential: true,

	kind: "read:account",

	errors: {
		noSuchAntenna: {
			message: "No such antenna.",
			code: "NO_SUCH_ANTENNA",
			id: "850926e0-fd3b-49b6-b69a-b28a5dbd82fe",
		},
	},

	res: {
		type: "object",
		optional: false,
		nullable: false,
		properties: {
			pagination: {
				type: "string",
				nullable: false,
				optional: false,
			},
			notes: {
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
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		antennaId: { type: "string", format: "misskey:id" },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		pagination: { type: "string", default: "+" },
	},
	required: ["antennaId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const antenna = await Antennas.findOneBy({
		id: ps.antennaId,
		userId: user.id,
	});

	let pagination = ps.pagination || "+";

	if (antenna == null) {
		throw new ApiError(meta.errors.noSuchAntenna);
	}

	let notes: Note[] = [];
	let paginationMap: string[][] = [];

	while (notes.length < ps.limit && pagination !== "-1") {
		// exclusive range
		if (pagination != "+" && !pagination.startsWith("("))
			pagination = `(${pagination}`;

		const noteIdsRes = await redisClient.xrevrange(
			`antennaTimeline:${antenna.id}`,
			pagination,
			"-",
			"COUNT",
			ps.limit - notes.length,
		);

		const noteIds = noteIdsRes.map((x) => x[1][1]);

		if (noteIds.length === 0) {
			pagination = "-1";
			break;
		}

		const query = makePaginationQuery(Notes.createQueryBuilder("note"))
			.where("note.id IN (:...noteIds)", { noteIds: noteIds })
			.innerJoinAndSelect("note.user", "user")
			.leftJoinAndSelect("user.avatar", "avatar")
			.leftJoinAndSelect("user.banner", "banner")
			.leftJoinAndSelect("note.reply", "reply")
			.leftJoinAndSelect("note.renote", "renote")
			.leftJoinAndSelect("reply.user", "replyUser")
			.leftJoinAndSelect("replyUser.avatar", "replyUserAvatar")
			.leftJoinAndSelect("replyUser.banner", "replyUserBanner")
			.leftJoinAndSelect("renote.user", "renoteUser")
			.leftJoinAndSelect("renoteUser.avatar", "renoteUserAvatar")
			.leftJoinAndSelect("renoteUser.banner", "renoteUserBanner")
			.andWhere("note.visibility != 'home'");

		generateVisibilityQuery(query, user);
		generateMutedUserQuery(query, user);
		generateBlockedUserQuery(query, user);

		pagination = noteIdsRes[noteIdsRes.length - 1][0];
		paginationMap = paginationMap.concat(
			noteIdsRes.map((x) => [x[1][1], x[0]]),
		);
		notes = notes.concat(await query.take(ps.limit - notes.length).getMany());
	}

	if (notes.length === 0) {
		return { pagination: "-1", notes: [] };
	} else {
		readNote(user.id, notes);
	}

	if (notes.length < ps.limit) {
		pagination = "-1";
	} else {
		// I'm so sorry, FIXME: rewrite pagination system
		pagination = paginationMap.find(
			(p) => p[0] == notes[notes.length - (notes.length > 1 ? 2 : 1)].id,
		)[1];
	}

	return {
		pagination: pagination,
		notes: await Notes.packMany(notes, user),
	};
});
