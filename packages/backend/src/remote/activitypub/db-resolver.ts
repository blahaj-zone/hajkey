import escapeRegexp from "escape-regexp";
import config from "@/config/index.js";
import type { Note } from "@/models/entities/note.js";
import type {
	CacheableRemoteUser,
	CacheableUser,
} from "@/models/entities/user.js";
import type { UserPublickey } from "@/models/entities/user-publickey.js";
import type { MessagingMessage } from "@/models/entities/messaging-message.js";
import {
	Notes,
	Users,
	UserPublickeys,
	MessagingMessages,
} from "@/models/index.js";
import { Cache } from "@/misc/cache.js";
import { uriPersonCache, userByIdCache } from "@/services/user-cache.js";
import type { IObject } from "./type.js";
import { getApId } from "./type.js";
import { resolvePerson } from "./models/person.js";
import { redisClient, subscriber } from "@/db/redis.js";

export const publicKeyCache = new Cache<UserPublickey | null>(
	"publicKey",
	60 * 60 * 3,
);
export const publicKeyByUserIdCache = new Cache<UserPublickey | null>(
	"publicKeyByUserId",
	60 * 60 * 3,
);

export type UriParseResult =
	| {
			/** wether the URI was generated by us */
			local: true;
			/** id in DB */
			id: string;
			/** hint of type, e.g. "notes", "users" */
			type: string;
			/** any remaining text after type and id, not including the slash after id. undefined if empty */
			rest?: string;
	  }
	| {
			/** wether the URI was generated by us */
			local: false;
			/** uri in DB */
			uri: string;
	  };

export function parseUri(value: string | IObject): UriParseResult {
	const uri = getApId(value);

	// the host part of a URL is case insensitive, so use the 'i' flag.
	const localRegex = new RegExp(
		`^${escapeRegexp(config.url)}/(\\w+)/(\\w+)(?:/(.+))?`,
		"i",
	);
	const matchLocal = uri.match(localRegex);

	if (matchLocal) {
		return {
			local: true,
			type: matchLocal[1],
			id: matchLocal[2],
			rest: matchLocal[3],
		};
	} else {
		return {
			local: false,
			uri,
		};
	}
}

export default class DbResolver {
	/**
	 * AP Note => Misskey Note in DB
	 */
	public async getNoteFromApId(value: string | IObject): Promise<Note | null> {
		const parsed = parseUri(value);

		if (parsed.local) {
			if (parsed.type !== "notes") return null;

			return await Notes.findOneBy({
				id: parsed.id,
			});
		} else {
			return await Notes.findOne({
				where: [
					{
						uri: parsed.uri,
					},
					{
						url: parsed.uri,
					},
				],
			});
		}
	}

	public async getMessageFromApId(
		value: string | IObject,
	): Promise<MessagingMessage | null> {
		const parsed = parseUri(value);

		if (parsed.local) {
			if (parsed.type !== "notes") return null;

			return await MessagingMessages.findOneBy({
				id: parsed.id,
			});
		} else {
			return await MessagingMessages.findOneBy({
				uri: parsed.uri,
			});
		}
	}

	/**
	 * AP Person => Misskey User in DB
	 */
	public async getUserFromApId(
		value: string | IObject,
	): Promise<CacheableUser | null> {
		const parsed = parseUri(value);

		if (parsed.local) {
			if (parsed.type !== "users") return null;

			return (
				(await userByIdCache.fetchMaybe(
					parsed.id,
					() =>
						Users.findOneBy({
							id: parsed.id,
						}).then((x) => x ?? undefined),
					true,
				)) ?? null
			);
		} else {
			return await uriPersonCache.fetch(
				parsed.uri,
				() =>
					Users.findOneBy({
						uri: parsed.uri,
					}),
				true,
			);
		}
	}

	/**
	 * AP KeyId => Misskey User and Key
	 */
	public async getAuthUserFromKeyId(keyId: string): Promise<{
		user: CacheableRemoteUser;
		key: UserPublickey;
	} | null> {
		const key = await publicKeyCache.fetch(
			keyId,
			async () => {
				const key = await UserPublickeys.findOneBy({
					keyId,
				});

				if (key == null) return null;

				return key;
			},
			true,
			(key) => key != null,
		);

		if (key == null) return null;

		return {
			user: (await userByIdCache.fetch(
				key.userId,
				() => Users.findOneByOrFail({ id: key.userId }),
				true,
			)) as CacheableRemoteUser,
			key,
		};
	}

	/**
	 * AP Actor id => Misskey User and Key
	 */
	public async getAuthUserFromApId(uri: string): Promise<{
		user: CacheableRemoteUser;
		key: UserPublickey | null;
	} | null> {
		const user = (await resolvePerson(uri)) as CacheableRemoteUser;

		if (user == null) return null;

		const key = await publicKeyByUserIdCache.fetch(
			user.id,
			() => UserPublickeys.findOneBy({ userId: user.id }),
			true,
			(v) => v != null,
		);

		return {
			user,
			key,
		};
	}
}

subscriber.on("message", async (_, data) => {
	const obj = JSON.parse(data);

	if (obj.channel === "internal") {
		const { type, body } = obj.message;
		switch (type) {
			case "remoteUserDeleted":
			case "localUserDeleted": {
				const toDelete = Array.from(await publicKeyByUserIdCache.getAll())
					.filter((v) => v[1]?.userId === body.id)
					.map((v) => v[0]);
				const toDeleteKey = Array.from(await publicKeyCache.getAll())
					.filter((v) => v[1]?.userId === body.id)
					.map((v) => v[0]);
				await publicKeyByUserIdCache.delete(...toDelete);
				await publicKeyCache.delete(...toDeleteKey);
				break;
			}
			default:
				break;
		}
	}
});
