import define from "../../define.js";
import { db } from "@/db/postgre.js";

export const meta = {
	tags: ["notes"],

	requireCredential: false,
	requireCredentialPrivateMode: true,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "Note",
		},
	},
};

export const paramDef = {
	type: "object",
	properties: {
		note: { type: "string", format: "misskey:id" },
	}
} as const;

type ThreadItem = {
	id?: string,
	parent?: string,
	score?: number,
	children?: ThreadItem[],
}

export default define(meta, paramDef, async (ps, user) => {
	let thread: ThreadItem = {};
	const lookup: Record<string, ThreadItem> = {};

	await db
		.query(`
			SELECT
			  parent, id, type, renotes, replies, reacts
			FROM thread_notes('${ps.note}')
		`)
		.then((recs) => {
			for (const rec of recs) {
				const reacts = Object
					.values(rec.reacts as Record<string, number>)
					.reduce((acc: number, val: number) => acc + val, 0);
				const item: ThreadItem = {
					id: rec.id,
					parent: rec.parent,
					score: rec.renotes + rec.replies + reacts,
				};
				lookup[rec.id] = item
			}
		})
		.catch((err) => {
			console.log(err);
		});

	for (const id in lookup) {
		const item = lookup[id];
		const parent = lookup[item.parent ?? ''];

		if (parent) {
			if (!parent.children) parent.children = [];
			parent.children.push(item);
		} else {
			console.log('no parent', item);
			thread = item;
		}
	}

	// Roll up the items with only one child
	for (const id in lookup) {
		const item = lookup[id];
		const parent = lookup[item.parent ?? ''];
		item.parent = undefined

		if (item.children?.length === 1) {
			if (parent) {
				parent.children?.push(item.children[0]);
				item.children = undefined;
				console.log('rolled up', item, 'to', parent);
			} else {
				console.log('no parent', item);
			}
		}
	}

	return thread;
});
