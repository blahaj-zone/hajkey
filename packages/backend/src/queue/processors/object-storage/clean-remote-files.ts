import type Bull from "bull";

import { queueLogger } from "../../logger.js";
import { deleteFileSync } from "@/services/drive/delete-file.js";
import { DriveFiles } from "@/models/index.js";
import { MoreThan, LessThan, Not, IsNull } from "typeorm";
import { fail } from "node:assert";

const logger = queueLogger.createSubLogger("clean-remote-files");

export default async function cleanRemoteFiles(
	job: Bull.Job<Record<string, unknown>>,
	done: any,
): Promise<void> {
	logger.info("Deleting cached remote files...");
	job.log("Beginning");

	let deletedCount = 0;
	let failedCount = 0;
	let cursor: any = null;

	const total = await DriveFiles.countBy({
		userHost: Not(IsNull()),
		isLink: false,
	});

	job.log(`Total: ${total}`);

	const batch = 1000;
	let loop = 0;
	while (true) {
		loop++;
		const files = await DriveFiles.find({
			where: {
				userHost: Not(IsNull()),
				isLink: false,
				createdAt: LessThan(new Date(Date.now() - 1000 * 60 * 60 * 12)),
				...(cursor ? { id: MoreThan(cursor) } : {}),
			},
			take: batch,
			order: {
				id: 1,
			},
		});

		if (files.length === 0) {
			job.log("No more files to delete.");
			job.progress(100);
			break;
		}

		cursor = files[files.length - 1].id;

		job.log(`Deleting ${files.length} files...`);
		for (const file of files) {
			try {
				await deleteFileSync(file, true);
				logger.info(`Deleted cached remote file ${file.id}`);
				deletedCount++;
			} catch (e) {
				logger.error(`Failed to delete cached remote file ${file.id}: ${e}`);
				job.log(`Failed to delete cached remote file ${file.id}: ${e}`);
				failedCount++;
			}
		}

		job.progress(~~(100 * deletedCount / total));
		job.log(`Progress ${loop}: ${deletedCount}/${total} (${failedCount} failed) [id=${cursor}]`);
	}

	logger.succ("All cached remote files has been deleted.");
	job.log("Completed");
	done();
}
