import { fetchMeta } from "@/misc/fetch-meta.js";
import type { Instance } from "@/models/entities/instance.js";
import type { Meta } from "@/models/entities/meta.js";

/**
 * Returns whether a specific host (punycoded) should be blocked.
 *
 * @param host punycoded instance host
 * @param meta a resolved Meta table
 * @returns whether the given host should be blocked
 */
export async function shouldBlockInstance(
	host: Instance["host"],
	meta?: Meta,
): Promise<boolean> {
	const { blockedHosts } = meta ?? (await fetchMeta());
	return blockedHosts.some(
		(blockedHost) => host === blockedHost || host.endsWith(`.${blockedHost}`),
	);
}
