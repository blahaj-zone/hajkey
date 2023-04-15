export class CreateWiki1677475294292 {
	name = "CreateWiki1677475294292";

	async up(queryRunner) {
		await queryRunner.query(`
					CREATE TABLE "wiki_page" (
						"id" character varying(32) NOT NULL,
						"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
						"slug" character varying(64) NOT NULL,
						"ownerId" character varying(32),
						"locked" boolean NOT NULL DEFAULT false,
						"editorIds" character varying(32) array NOT NULL,
						"revisionId" character varying(32) NOT NULL,
						CONSTRAINT "REL_2210a1bc502cf3af2534efb062" UNIQUE ("ownerId"),
						CONSTRAINT "REL_8d70ec19c7ce97bb4d1bed6f17" UNIQUE ("revisionId"),
						CONSTRAINT "PK_7b75399a325fe565b68275aadda" PRIMARY KEY ("id")
					);
					COMMENT ON COLUMN "wiki_page"."createdAt" IS 'The created date of the WikiPage.';
					COMMENT ON COLUMN "wiki_page"."slug" IS 'The slug of the WikiPage.';
					COMMENT ON COLUMN "wiki_page"."ownerId" IS 'The owner of the WikiPage.';
					COMMENT ON COLUMN "wiki_page"."locked" IS 'Whether the WikiPage is locked to the owner, or open to editors / everyone.';
					COMMENT ON COLUMN "wiki_page"."editorIds" IS 'The allowed editors of the WikiPage.';
					COMMENT ON COLUMN "wiki_page"."revisionId" IS 'The currently live version of the WikiPage.'
				`);

		await queryRunner.query(
			`CREATE INDEX "IDX_3dd8b12ca26cd294c9359abd89" ON "wiki_page" ("createdAt") `,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_3c3b622e53ab2a3ce49c28fc74" ON "wiki_page" ("slug") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_2210a1bc502cf3af2534efb062" ON "wiki_page" ("ownerId") `,
		);

		await queryRunner.query(`
					CREATE TABLE "wiki_page_revision" ("id" character varying(32) NOT NULL,
						"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
						"wikiPageId" character varying(32) NOT NULL,
						"editorId" character varying(32) NOT NULL,
						"title" character varying(128) NOT NULL,
						"body" character varying NOT NULL,
						CONSTRAINT "REL_cac83c5e3ac2794b5ec68e5177" UNIQUE ("editorId"),
						CONSTRAINT "PK_a395487d582f699756ae4416bbd" PRIMARY KEY ("id")
					);
					COMMENT ON COLUMN "wiki_page_revision"."createdAt" IS 'The created date of the WikiPageRevision.';
					COMMENT ON COLUMN "wiki_page_revision"."title" IS 'The title of the WikiPage.';
					COMMENT ON COLUMN "wiki_page_revision"."body" IS 'The body of the WikiPage.'
				`);

		await queryRunner.query(
			`CREATE INDEX "IDX_cb3055b88d0232a1ab3a461408" ON "wiki_page_revision" ("createdAt") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_db07d5fb1e3772865b7748616d" ON "wiki_page_revision" ("wikiPageId") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_cac83c5e3ac2794b5ec68e5177" ON "wiki_page_revision" ("editorId") `,
		);

		await queryRunner.query(
			`ALTER TABLE "wiki_page" ADD CONSTRAINT "FK_2210a1bc502cf3af2534efb0621" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "wiki_page" ADD CONSTRAINT "FK_8d70ec19c7ce97bb4d1bed6f174" FOREIGN KEY ("revisionId") REFERENCES "wiki_page_revision"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "wiki_page_revision" ADD CONSTRAINT "FK_cac83c5e3ac2794b5ec68e5177d" FOREIGN KEY ("editorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "wiki_page_revision" DROP CONSTRAINT "FK_cac83c5e3ac2794b5ec68e5177d"`,
		);
		await queryRunner.query(
			`ALTER TABLE "wiki_page" DROP CONSTRAINT "FK_8d70ec19c7ce97bb4d1bed6f174"`,
		);
		await queryRunner.query(
			`ALTER TABLE "wiki_page" DROP CONSTRAINT "FK_2210a1bc502cf3af2534efb0621"`,
		);

		await queryRunner.query(
			`DROP INDEX "public"."IDX_cac83c5e3ac2794b5ec68e5177"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_db07d5fb1e3772865b7748616d"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_cb3055b88d0232a1ab3a461408"`,
		);
		await queryRunner.query(`DROP TABLE "wiki_page_revision"`);

		await queryRunner.query(
			`DROP INDEX "public"."IDX_2210a1bc502cf3af2534efb062"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_3c3b622e53ab2a3ce49c28fc74"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_3dd8b12ca26cd294c9359abd89"`,
		);
		await queryRunner.query(`DROP TABLE "wiki_page"`);
	}
}
