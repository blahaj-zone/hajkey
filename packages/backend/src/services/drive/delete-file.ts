import type { DriveFile } from "@/models/entities/drive-file.js";
import { InternalStorage } from "./internal-storage.js";
import { DriveFiles, Instances } from "@/models/index.js";
import {
	driveChart,
	perUserDriveChart,
	instanceChart,
} from "@/services/chart/index.js";
import { createDeleteObjectStorageFileJob } from "@/queue/index.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { getS3 } from "./s3.js";
import { v4 as uuid } from "uuid";

export async function deleteFile(file: DriveFile, isExpired = false) {
	if (file.storedInternal) {
		InternalStorage.del(file.accessKey!);

		if (file.thumbnailUrl) {
			InternalStorage.del(file.thumbnailAccessKey!);
		}

		if (file.webpublicUrl) {
			InternalStorage.del(file.webpublicAccessKey!);
		}
	} else if (!file.isLink) {
		createDeleteObjectStorageFileJob(file.accessKey!);

		if (file.thumbnailUrl) {
			createDeleteObjectStorageFileJob(file.thumbnailAccessKey!);
		}

		if (file.webpublicUrl) {
			createDeleteObjectStorageFileJob(file.webpublicAccessKey!);
		}
	}

	postProcess(file, isExpired);
}

export async function deleteFileSync(file: DriveFile, isExpired = false) {
	if (file.storedInternal) {
		InternalStorage.del(file.accessKey!);

		if (file.thumbnailUrl) {
			InternalStorage.del(file.thumbnailAccessKey!);
		}

		if (file.webpublicUrl) {
			InternalStorage.del(file.webpublicAccessKey!);
		}
	} else if (!file.isLink) {
		const promises = [];

		promises.push(deleteObjectStorageFile(file.accessKey!));

		if (file.thumbnailUrl) {
			promises.push(deleteObjectStorageFile(file.thumbnailAccessKey!));
		}

		if (file.webpublicUrl) {
			promises.push(deleteObjectStorageFile(file.webpublicAccessKey!));
		}

		await Promise.all(promises);
	}

	await postProcess(file, isExpired);
}

async function postProcess(file: DriveFile, isExpired = false) {
	const promises = [];
	if (isExpired && file.userHost !== null && file.uri != null) {
		promises.push(DriveFiles.update(file.id, {
			isLink: true,
			url: file.uri,
			thumbnailUrl: null,
			webpublicUrl: null,
			storedInternal: false,
			// ローカルプロキシ用
			accessKey: uuid(),
			thumbnailAccessKey: `thumbnail-${uuid()}`,
			webpublicAccessKey: `webpublic-${uuid()}`,
		}));
	} else {
		promises.push(DriveFiles.delete(file.id));
	}

	// 統計を更新
	promises.push(driveChart.update(file, false));
	promises.push(perUserDriveChart.update(file, false));
	if (file.userHost !== null) {
		promises.push(instanceChart.updateDrive(file, false));
	}

	await Promise.all(promises);
}

export async function deleteObjectStorageFile(key: string) {
	const meta = await fetchMeta();

	const s3 = getS3(meta);

	await s3
		.deleteObject({
			Bucket: meta.objectStorageBucket!,
			Key: key,
		})
		.promise();
}
