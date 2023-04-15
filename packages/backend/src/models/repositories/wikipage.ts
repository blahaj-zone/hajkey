import { db } from "@/db/postgre.js";
import type { Packed } from "@/misc/schema.js";
import type { Promiseable } from "@/prelude/await-all.js";
import { Users } from "@/models/index.js";
import { awaitAll } from "@/prelude/await-all.js";
import { WikiPage } from "@/models/entities/wikipage.js";

export const WikiPageRepository = db.getRepository(WikiPage).extend({
	async pack(src: WikiPage["id"] | WikiPage): Promise<Packed<"WikiPage">> {
		const wikiPage =
			typeof src === "object" ? src : await this.findOneByOrFail({ id: src });

		const packed = {
			id: wikiPage.id,
			revisionId: wikiPage.revisionId,
			createdAt: wikiPage.createdAt.toISOString(),
			updatedAt: wikiPage.revision?.createdAt.toISOString(),
			locked: wikiPage.locked,
			editorIds: wikiPage.editorIds,
			ownerId: wikiPage.ownerId,
			owner: wikiPage.ownerId ? await Users.pack(wikiPage.owner!) : null,
			editorId: wikiPage.revision?.editorId,
			editor: wikiPage.revision?.editorId
				? await Users.pack(wikiPage.revision.editor!)
				: null,
			slug: wikiPage.slug,
			title: wikiPage.revision?.title,
			body: wikiPage.revision?.body,
		} as Promiseable<Packed<"WikiPage">>;

		return await awaitAll(packed);
	},

	packMany(
		wikiPages: (WikiPage["id"] | WikiPage)[],
	): Promise<Packed<"WikiPage">[]> {
		return Promise.all(wikiPages.map((p) => this.pack(p)));
	},
});
