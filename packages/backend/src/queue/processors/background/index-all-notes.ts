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

	const size = 100;
	while (true) {
		logger.info(`Indexing notes ${indexedCount}/${total ? total : '?'} at ${cursor}`);

		const notes: Note[] = await Notes.find({
			where: {
				...(cursor ? { id: MoreThan(cursor) } : {}),
			},
			take: size,
			order: {
				id: 1,
			},
		});

		if (notes.length === 0) {
			job.progress(100);
			break;
		}

		cursor = notes[notes.length - 1].id;
		
		await Promise.all(notes.map(note => index(note)));

		total = await Notes.count();
		indexedCount += notes.length;
		const pct = (indexedCount / total);
		job.progress(+(pct.toFixed(2)));
	}

	logger.succ("All notes have been indexed.");
	done();
}
