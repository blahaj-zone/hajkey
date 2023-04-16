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
			console.log('  ->', parent);
		} else {
			console.log('no parent', item);
			thread = item;
		}
	}

	relevel(thread, 0, {id: 0});

	// Roll up the items with only one child
	for (const id in lookup) {
		const item = lookup[id];
		const parent = lookup[item.parent ?? ''];

		if (item.children?.length === 1) {
			const child = item.children[0];
			if (parent) {
				console.log('')
				console.log('  <-', parent);
				// insert child into parent after item
				const index = parent.children?.indexOf(item) ?? -1;
				if (index >= 0) {
					parent.children?.splice(index + 1, 0, child);
				}
				else {
					parent.children?.push(child);
				}
				item.children = undefined;
				console.log('rolled up', child.id, 'from', item.id, 'to', parent.id);
				console.log('  ->', parent);
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

function relevel(item: ThreadItem, level: number, sequence: {id: number}) {
	if (item.children) {
		const seq = sequence.id++;
		for (const child of item.children) {
			child.sequence = seq;
			child.level = level;
			relevel(child, level + 1, sequence);
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
