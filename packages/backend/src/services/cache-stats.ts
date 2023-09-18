import Logger from "./logger.js";
import {
	localUserByIdCache,
	localUserByNativeTokenCache,
	uriPersonCache,
	userByIdCache,
} from "./user-cache";
import {
	publicKeyByUserIdCache,
	publicKeyCache,
} from "../remote/activitypub/db-resolver.js";

const logger = new Logger("cache-stats");

export const statsScheduler = () => {
	setInterval(() => {
		const logs = [];
		if (userByIdCache.used)
			logs.push(
				`userById: ${userByIdCache.hitCount}:${userByIdCache.missCount}, ${userByIdCache.notFoundCount} n/f`,
			);
		if (localUserByNativeTokenCache.used)
			logs.push(
				`localUserByNativeToken: ${localUserByNativeTokenCache.hitCount}:${localUserByNativeTokenCache.missCount}, ${localUserByNativeTokenCache.notFoundCount} n/f`,
			);
		if (localUserByIdCache.used)
			logs.push(
				`localUserById: ${localUserByIdCache.hitCount}:${localUserByIdCache.missCount}, ${localUserByIdCache.notFoundCount} n/f`,
			);
		if (uriPersonCache.used)
			logs.push(
				`uriPerson: ${uriPersonCache.hitCount}:${uriPersonCache.missCount}, ${uriPersonCache.notFoundCount} n/f`,
			);
		if (publicKeyCache.used)
			logs.push(
				`publicKey: ${publicKeyCache.hitCount}:${publicKeyCache.missCount}, ${publicKeyCache.notFoundCount} n/f`,
			);
		if (publicKeyByUserIdCache.used)
			logs.push(
				`publicKeyByUserId: ${publicKeyByUserIdCache.hitCount}:${publicKeyByUserIdCache.missCount}, ${publicKeyByUserIdCache.notFoundCount} n/f`,
			);

		if (logs.length > 0) logger.info(logs.join("\n"));
	}, 1000 * 60);
};
