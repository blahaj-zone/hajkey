import { WikiPages } from "@/models/index.js";
import define from "../../define.js";

export const meta = {
	tags: ["wiki-pages"],

	requireCredential: false,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "WikiPage",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async (_ps) => {
	const pages = await WikiPages.find({
		order: {
			createdAt: "DESC",
		},
	});

	return await WikiPages.packMany(pages);
});
