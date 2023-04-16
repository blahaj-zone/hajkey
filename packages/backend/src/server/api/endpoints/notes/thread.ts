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
			console.log('added', item.id, 'to', parent.id);
		} else {
			console.log('no parent', item);
			thread = item;
		}
	}

	// Roll up the items with only one child
	for (const id in lookup) {
		const item = lookup[id];
		const parent = lookup[item.parent ?? ''];

		if (item.children?.length === 1) {
			if (parent) {
				parent.children?.push(item.children[0]);
				item.children = undefined;
				console.log('rolled up', item.id, 'to', parent.id);
			} else {
				console.log('no parent', item.id);
			}
		}
	}

	for (const id in lookup) {
		const item = lookup[id];
		item.parent = undefined;
	}

	dump(thread, 0);

	for (const id in lookup) {
		const item = lookup[id];
		if (!item.found) {
			console.log('not found', item.id);
		}
	}

	return thread;
});

function dump(item: ThreadItem, depth: number) {
	console.log(`${'|'.repeat(depth)}-> ${item.id} (${item.score})`);
	if (item.children) {
		for (const child of item.children) {
			dump(child, depth + 1);
		}
	}
	item.found = true;
}
