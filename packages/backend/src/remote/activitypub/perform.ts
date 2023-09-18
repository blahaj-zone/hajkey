import type { IObject } from "./type.js";
import type { CacheableRemoteUser } from "@/models/entities/user.js";
import { performActivity } from "./kernel/index.js";
import { updatePerson } from "./models/person.js";
import { PerformanceTimer } from "@/queue/processors/inbox.js";

export default async (
	actor: CacheableRemoteUser,
	activity: IObject,
	timer?: PerformanceTimer,
): Promise<boolean> => {
	timer?.log("performActivity");
	const results = await performActivity(actor, activity, timer);

	// Update the remote user information if it is out of date
	if (actor.uri) {
		if (
			actor.lastFetchedAt == null ||
			Date.now() - actor.lastFetchedAt.getTime() > 1000 * 60 * 60 * 24
		) {
			timer?.log("performActivity: updatePerson");
			if (actor.uri) {
				const uri = actor.uri;
				setImmediate(() => {
					updatePerson(uri);
				});
			}
		}
	}

	return results.every((result) => result === "success")
};
