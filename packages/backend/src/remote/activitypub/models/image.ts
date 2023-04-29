import { uploadFromUrl } from "@/services/drive/upload-from-url.js";
import type { CacheableRemoteUser } from "@/models/entities/user.js";
import { IRemoteUser } from "@/models/entities/user.js";
import Resolver from "../resolver.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { apLogger } from "../logger.js";
import type { DriveFile } from "@/models/entities/drive-file.js";
import { DriveFiles, Users } from "@/models/index.js";
import { truncate } from "@/misc/truncate.js";
import { DB_MAX_IMAGE_COMMENT_LENGTH } from "@/misc/hard-limits.js";

const logger = apLogger;

/**
 * create an Image.
 */
export async function createImage(
	actor: CacheableRemoteUser,
	value: any,
): Promise<DriveFile> {
	// Skip if author is frozen.
	if (actor.isSuspended) {
		throw new Error("actor has been suspended");
	}

	const image = (await new Resolver().resolve(value)) as any;

	if (image.url == null) {
		throw new Error("invalid image: url not privided");
	}

	if (!image.url.startsWith("https://") && !image.url.startsWith("http://")) {
		throw new Error("invalid image: unexpected shcema of url: " + image.url);
	}

	logger.info(`Creating the Image: ${image.url}`);

	const instance = await fetchMeta();

	let file = await uploadFromUrl({
		url: image.url,
		user: actor,
		uri: image.url,
		sensitive: image.sensitive,
		isLink: !instance.cacheRemoteFiles,
		comment: truncate(image.name, DB_MAX_IMAGE_COMMENT_LENGTH),
	});

	if (file.isLink) {
		// If the URL is different, it means that the same image was previously
		// registered with a different URL, so update the URL
		if (file.url !== image.url) {
			await DriveFiles.update(
				{ id: file.id },
				{
					url: image.url,
					uri: image.url,
				},
			);

			file = await DriveFiles.findOneByOrFail({ id: file.id });
		}
	}

	return file;
}

/**
 * Resolve Image.
 *
 * If the target Image is registered in Calckey, return it, otherwise
 * Fetch from remote server, register with Calckey and return it.
 */
export async function resolveImage(
	actor: CacheableRemoteUser,
	value: any,
): Promise<DriveFile> {
	// TODO

	// Fetch from remote server and register
	return await createImage(actor, value);
}
