import { leveldb } from "cbor";
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
	const ids: string[] = [];

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
				ids.push(rec.id);
			}
		})
		.catch((err) => {
			console.log(err);
		});

	// Thread the items into a tree
	for (const id of ids) {
		const item = lookup[id];
		const parent = lookup[item.parent ?? ''];

		if (parent) {
			if (!parent.children) parent.children = [];
			parent.children.push(item);
			console.log('added', item.id, 'to', parent.id);
			console.log('  ->', parent);
		} else {
			console.log('no parent', item);
			thread = item;
		}
	}

	dump(thread, 0);

	console.log('relevel');
	relevel(thread, null, 0, {id: 0});
	dump(thread, 0);

	for (const id of ids) {
		const item = lookup[id];
		item.parent = undefined;
	}

	dump(thread, 0);

	for (const id of ids) {
		const item = lookup[id];
		if (!item.found) {
			console.log('not found', item.id);
		}
	}

	return thread;
});

function relevel(item: ThreadItem, parent: ThreadItem|null, level: number, sequence: {id: number}) {
	if (item.children) {
		const seq = sequence.id++;

		// copy children to a new array so modifications won't affect the loop
		const children = [...item.children];

		for (const child of children) {
			child.seq = seq % 8;
			child.level = level;
			if (item.children.length === 1) {
				child.single = true;
			}

			// recurse into child
			relevel(child, item, level + 1, sequence);

			// if single, move child up to parent below item
			if (parent && child.single) {
				const index = parent.children?.indexOf(item) ?? parent.children?.length ?? 0;
				parent.children?.splice(index + 1, 0, child);
				console.log('rolled into', index+1, child.id, 'from', item.id, 'to', parent.id);
			}
		}
	}
}

function dump(item: ThreadItem, depth: number) {
	console.log(`${'|'.repeat(depth)}-> ${item.id} (${item.score})`);
	if (item.children) {
		for (const child of item.children) {
			dump(child, depth + 1);
		}
	}
	item.found = true;
}
