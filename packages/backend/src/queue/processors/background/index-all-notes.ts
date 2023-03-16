import type Bull from "bull";

import { queueLogger } from "../../logger.js";
import { Notes } from "@/models/index.js";
import { MoreThan, LessThan, Not, IsNull } from "typeorm";
import { index } from "@/services/note/create.js"
import { Note } from "@/models/entities/note.js";

const logger = queueLogger.createSubLogger("index-all-notes");

export default async function indexAllNotes(
	job: Bull.Job<Record<string, unknown>>,
	done: ()=>void,
): Promise<void> {
	logger.info("Indexing all notes...");

	let indexedCount = 0;
	let cursor: string|null = null;
	let total = 0;

	const take = 50000;
	const batch = 100;
	while (true) {
		logger.info(`Querying for ${take} notes ${indexedCount}/${total ? total : '?'} at ${cursor}`);

		let notes: Note[] = [];
		try {
			notes = await Notes.find({
				where: {
					...(cursor ? { id: MoreThan(cursor) } : {}),
				},
				take: take,
				order: {
					id: 1,
				},
			});
		} catch (e) {
			logger.error(`Failed to query notes ${e}`);
			continue;
		}

		if (notes.length === 0) {
			job.progress(100);
			break;
		}

		try {
			const count = await Notes.count();
			total = count;
		} catch (e) {
		}

		for (let i = 0; i < notes.length; i += batch) {
			const chunk = notes.slice(i, i + batch);
			await Promise.all(chunk.map(note => index(note)));

			indexedCount += chunk.length;
			const pct = (indexedCount / total);
			job.progress(+(pct.toFixed(2)));
			logger.info(`Indexed notes ${indexedCount}/${total ? total : '?'}`);
		}
		cursor = notes[notes.length - 1].id;
	}

	logger.succ("All notes have been indexed.");
	done();
}
