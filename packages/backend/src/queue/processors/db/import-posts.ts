import { IsNull } from "typeorm";
import follow from "@/services/following/create.js";

import * as Post from "@/misc/post.js";
import create from "@/services/note/create.js";
import { downloadTextFile } from "@/misc/download-text-file.js";
import { Users, DriveFiles } from "@/models/index.js";
import type { DbUserImportPostsJobData } from "@/queue/types.js";
import { queueLogger } from "../../logger.js";
import type Bull from "bull";
import { htmlToMfm } from "@/remote/activitypub/misc/html-to-mfm.js";

const logger = queueLogger.createSubLogger("import-posts");

export async function importPosts(
	job: Bull.Job<DbUserImportPostsJobData>,
	done: any,
): Promise<void> {
	logger.info(`Importing posts of ${job.data.user.id} ...`);

	const user = await Users.findOneBy({ id: job.data.user.id });
	if (user == null) {
		done();
		return;
	}

	const file = await DriveFiles.findOneBy({
		id: job.data.fileId,
	});
	if (file == null) {
		done();
		return;
	}

	const json = await downloadTextFile(file.url);

	let linenum = 0;

	try {
		const parsed = JSON.parse(json);
		if (parsed instanceof Array) {
			logger.info("Parsing key style posts");
			for (const post of JSON.parse(json)) {
				try {
					linenum++;
					if (post.replyId != null) {
						continue;
					}
					if (post.renoteId != null) {
						continue;
					}
					if (post.visibility !== "public") {
						continue;
					}
					const { text, cw, localOnly, createdAt } = Post.parse(post);

					logger.info(`Posting[${linenum}] ...`);

					const note = await create(user, {
						createdAt: createdAt,
						files: undefined,
						poll: undefined,
						text: text || undefined,
						reply: null,
						renote: null,
						cw: cw,
						localOnly,
						visibility: "public",
						visibleUsers: [],
						channel: null,
						apMentions: new Array(0),
						apHashtags: undefined,
						apEmojis: undefined,
					});
				} catch (e) {
					logger.warn(`Error in line:${linenum} ${e}`);
				}
			}
		} else if (parsed instanceof Object) {
			logger.info("Parsing animal style posts");
			for (const post of parsed.orderedItems) {
				try {
					linenum++;
					if (post.object.inReplyTo != null) {
						continue;
					}
					if (post.directMessage) {
						continue;
					}
					if (job.data.signatureCheck) {
						if (!post.signature) {
							continue;
						}
					}
					let text;
					try {
						text = htmlToMfm(post.object.content, post.object.tag);
					} catch (e) {
						continue;
					}
					logger.info(`Posting[${linenum}] ...`);

					const note = await create(user, {
						createdAt: new Date(post.object.published),
						files: undefined,
						poll: undefined,
						text: text || undefined,
						reply: null,
						renote: null,
						cw: post.sensitive,
						localOnly: false,
						visibility: "public",
						visibleUsers: [],
						channel: null,
						apMentions: new Array(0),
						apHashtags: undefined,
						apEmojis: undefined,
					});
				} catch (e) {
					logger.warn(`Error in line:${linenum} ${e}`);
				}
			}
		}
	} catch (e) {
		// handle error
		logger.warn(`Error reading: ${e}`);
	}

	logger.succ("Imported");
	done();
}
