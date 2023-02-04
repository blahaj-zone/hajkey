import type { User, UserDetailedNotMeOnly } from "@/models/entities/user.js";
import { Users } from "@/models/index.js";
import { resolveUser } from "@/remote/resolve-user.js";
import acceptAllFollowRequests from "@/services/following/requests/accept-all.js";
import { publishToFollowers } from "@/services/i/update.js";
import { publishMainStream } from "@/services/stream.js";
import { DAY } from "@/const.js";
import { apiLogger } from "../../logger.js";
import { UserProfiles } from "@/models/index.js";
import config from "@/config/index.js";
import define from "../../define.js";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["users"],

	secure: true,
	requireCredential: true,

	limit: {
		duration: DAY,
		max: 30,
	},

	errors: {
		noSuchUser: {
			message: "No such user.",
			code: "NO_SUCH_USER",
			id: "fcd2eef9-a9b2-4c4f-8624-038099e90aa5",
		},
		notRemote: {
			message: "User is not remote. You can only migrate to other instances.",
			code: "NOT_REMOTE",
			id: "4362f8dc-731f-4ad8-a694-be2a88922a24",
		},
		uriNull: {
			message: "User ActivityPup URI is null.",
			code: "URI_NULL",
			id: "bf326f31-d430-4f97-9933-5d61e4d48a23",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		alsoKnownAs: { type: "string" },
	},
	required: ["alsoKnownAs"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	if (!ps.alsoKnownAs) throw new ApiError(meta.errors.noSuchUser);

	let unfiltered: string = ps.alsoKnownAs;
	const updates = {} as Partial<User>;

	if (!unfiltered) {
		updates.alsoKnownAs = null;
	} else {
		if (unfiltered.startsWith("acct:")) unfiltered = unfiltered.substring(5);
		if (unfiltered.startsWith("@")) unfiltered = unfiltered.substring(1);
		if (!unfiltered.includes("@")) throw new ApiError(meta.errors.notRemote);

		const userAddress: string[] = unfiltered.split("@");
		const knownAs = await resolveUser(userAddress[0], userAddress[1]).catch(
			(e) => {
				apiLogger.warn(`failed to resolve remote user: ${e}`);
				throw new ApiError(meta.errors.noSuchUser);
			},
		);

		const toUrl: string | null = knownAs.uri;
		if (!toUrl) {
			throw new ApiError(meta.errors.uriNull);
		}
		if (updates.alsoKnownAs == null || updates.alsoKnownAs.length === 0) {
			updates.alsoKnownAs = [toUrl];
		} else {
			updates.alsoKnownAs.push(toUrl);
		}
	}

	await Users.update(user.id, updates);

	const iObj = await Users.pack<true, true>(user.id, user, {
		detail: true,
		includeSecrets: true,
	});

	// Publish meUpdated event
	publishMainStream(user.id, "meUpdated", iObj);

	if (user.isLocked === false) {
		acceptAllFollowRequests(user);
	}

	publishToFollowers(user.id);

	return iObj;
});
