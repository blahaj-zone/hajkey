import define from "../../define.js";
import { createImportPostsJob } from "@/queue/index.js";
import { ApiError } from "../../error.js";
import { DriveFiles } from "@/models/index.js";
import { DAY } from "@/const.js";

export const meta = {
	secure: true,
	requireCredential: true,
	limit: {
		duration: DAY,
		max: 1,
	},
	errors: {
		noSuchFile: {
			message: "No such file.",
			code: "NO_SUCH_FILE",
			id: "e674141e-bd2a-ba85-e616-aefb187c9c2a",
		},

		emptyFile: {
			message: "That file is empty.",
			code: "EMPTY_FILE",
			id: "d2f12af1-e7b4-feac-86a3-519548f2728e",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		fileId: { type: "string", format: "misskey:id" },
		signatureCheck: { type: "boolean" },
	},
	required: ["fileId"],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const file = await DriveFiles.findOneBy({ id: ps.fileId });

	if (file == null) throw new ApiError(meta.errors.noSuchFile);
	if (file.size === 0) throw new ApiError(meta.errors.emptyFile);
	createImportPostsJob(user, file.id, ps.signatureCheck);
});
