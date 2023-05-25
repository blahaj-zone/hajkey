import probeImageSize from "probe-image-size";
import { Mutex, withTimeout } from "async-mutex";

import { FILE_TYPE_BROWSERSAFE } from "@/const.js";
import Logger from "@/services/logger.js";
import { Cache } from "./cache.js";

export type Size = {
	width: number;
	height: number;
};

const cache = new Cache<boolean>(1000 * 60 * 10); // once every 10 minutes for the same url
const mutex = withTimeout(new Mutex(), 1000);

export async function getEmojiSize(url: string): Promise<Size> {
	const logger = new Logger("emoji");

	await mutex.runExclusive(() => {
		const attempted = cache.get(url);
		if (!attempted) {
			cache.set(url, true);
		} else {
			logger.warn(`Attempt limit exceeded: ${url}`);
			throw new Error("Too many attempts");
		}
	});

	try {
		logger.info(`Retrieving emoji size from ${url}`);
		const { width, height, mime } = await probeImageSize(url, {
			timeout: 5000,
		});
		if (!(mime.startsWith("image/") && FILE_TYPE_BROWSERSAFE.includes(mime))) {
			throw new Error("Unsupported image type");
		}
		return { width, height };
	} catch (e) {
		throw new Error(`Unable to retrieve metadata: ${e}`);
	}
}

export function getNormalSize(
	{ width, height }: Size,
	orientation?: number,
): Size {
	return (orientation || 0) >= 5
		? { width: height, height: width }
		: { width, height };
}
