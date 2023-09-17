import type { IObject } from "./type.js";
import type { CacheableRemoteUser } from "@/models/entities/user.js";
import { performActivity } from "./kernel/index.js";
import { updatePerson } from "./models/person.js";
import { PerformanceTimer } from "@/queue/processors/inbox.js";

export default async (
	actor: CacheableRemoteUser,
	activity: IObject,
	timer?: PerformanceTimer,
): Promise<void> => {
	timer?.log("performActivity");
	await performActivity(actor, activity, timer);

	// Update the remote user information if it is out of date
	if (actor.uri) {
		if (
			actor.lastFetchedAt == null ||
			Date.now() - actor.lastFetchedAt.getTime() > 1000 * 60 * 60 * 24
		) {
			timer?.log("performActivity: updatePerson");
			setImmediate(() => {
				updatePerson(actor.uri!);
			});
		}
	}
};
