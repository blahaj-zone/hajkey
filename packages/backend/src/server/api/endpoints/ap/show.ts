import define from "../../define.js";
import config from "@/config/index.js";
import { createPerson } from "@/remote/activitypub/models/person.js";
import { createNote } from "@/remote/activitypub/models/note.js";
import DbResolver from "@/remote/activitypub/db-resolver.js";
import Resolver from "@/remote/activitypub/resolver.js";
import { ApiError } from "../../error.js";
import { extractDbHost } from "@/misc/convert-host.js";
import { Users, Notes } from "@/models/index.js";
import type { Note } from "@/models/entities/note.js";
import type { CacheableLocalUser, User } from "@/models/entities/user.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { isActor, isPost, getApId } from "@/remote/activitypub/type.js";
import type { SchemaType } from "@/misc/schema.js";
import { HOUR } from "@/const.js";
import { shouldBlockInstance } from "@/misc/should-block-instance.js";

export const meta = {
	tags: ["federation"],

	requireCredential: true,

	limit: {
		duration: HOUR,
		max: 30,
	},

	errors: {
		noSuchObject: {
			message: "No such object.",
			code: "NO_SUCH_OBJECT",
			id: "dc94d745-1262-4e63-a17d-fecaa57efc82",
		},
	},

	res: {
		optional: false,
		nullable: false,
		oneOf: [
			{
				type: "object",
				properties: {
					type: {
						type: "string",
						optional: false,
						nullable: false,
						enum: ["User"],
					},
					object: {
						type: "object",
						optional: false,
						nullable: false,
						ref: "UserDetailedNotMe",
					},
				},
			},
			{
				type: "object",
				properties: {
					type: {
						type: "string",
						optional: false,
						nullable: false,
						enum: ["Note"],
					},
					object: {
						type: "object",
						optional: false,
						nullable: false,
						ref: "Note",
					},
				},
			},
		],
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		uri: { type: "string" },
	},
	required: ["uri"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const object = await fetchAny(ps.uri, me);
	if (object) {
		return object;
	} else {
		throw new ApiError(meta.errors.noSuchObject);
	}
});

/***
 * Resolve User or Note from URI
 */
async function fetchAny(
	uri: string,
	me: CacheableLocalUser | null | undefined,
): Promise<SchemaType<typeof meta["res"]> | null> {
	// Wait if blocked.
	if (await shouldBlockInstance(extractDbHost(uri))) return null;

	const dbResolver = new DbResolver();

	let local = await mergePack(
		me,
		...(await Promise.all([
			dbResolver.getUserFromApId(uri),
			dbResolver.getNoteFromApId(uri),
		])),
	);
	if (local != null) return local;

	// fetching Object once from remote
	const resolver = new Resolver();
	const object = (await resolver.resolve(uri)) as any;

	// /@user If a URI other than the id is specified,
	// the URI is determined here
	if (uri !== object.id) {
		local = await mergePack(
			me,
			...(await Promise.all([
				dbResolver.getUserFromApId(object.id),
				dbResolver.getNoteFromApId(object.id),
			])),
		);
		if (local != null) return local;
	}

	return await mergePack(
		me,
		isActor(object) ? await createPerson(getApId(object)) : null,
		isPost(object) ? await createNote(getApId(object), undefined, true) : null,
	);
}

async function mergePack(
	me: CacheableLocalUser | null | undefined,
	user: User | null | undefined,
	note: Note | null | undefined,
): Promise<SchemaType<typeof meta.res> | null> {
	if (user != null) {
		return {
			type: "User",
			object: await Users.pack(user, me, { detail: true }),
		};
	} else if (note != null) {
		try {
			const object = await Notes.pack(note, me, { detail: true });

			return {
				type: "Note",
				object,
			};
		} catch (e) {
			return null;
		}
	}

	return null;
}
