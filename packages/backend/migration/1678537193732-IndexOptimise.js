export class IndexOptimise1678537193732 {
	async up(queryRunner) {
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_1dc6e9f6f42fcc2bcdd03b3b5b4db759" ON public."__chart__hashtag" USING btree ("group")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_3e9edab3abe89798a5b1588929bfc602" ON public."__chart__instance" USING btree ("group", date)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_1e4375d5aac136ac0f480196990a00a1" ON public."__chart__instance" USING btree ("group")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_d9fd2cf8350e283694021e39a3bdb5f1" ON public."__chart__per_user_drive" USING btree ("group")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_6472fb70c7b0136417de13b048cf7611" ON public."__chart__per_user_following" USING btree ("group", date)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_b0876ca01d702d467bf9267fedc50132" ON public."__chart__per_user_notes" USING btree ("group")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_7b68cd0c39dbd8b20921801ea620b394" ON public."__chart__per_user_reaction" USING btree ("group", date)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_d498b96be88d7c5c0b0cf102ba2b081b" ON public."__chart_day__hashtag" USING btree ("group")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_33479fbcfa0f39211cc29b50de8f3b4f" ON public."__chart_day__instance" USING btree ("group")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_0eebcf53bb02393b1f830113a5cbf102" ON public."__chart_day__per_user_drive" USING btree ("group", date)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_ab6187444614a544b675dbbe01e3eaf4" ON public."__chart_day__per_user_drive" USING btree ("group")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_7f340660485e031dead35bda40b2cc31" ON public."__chart_day__per_user_following" USING btree ("group", date)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_e75578e4509536074e42eff117a3d1a0" ON public."__chart_day__per_user_notes" USING btree ("group", date)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_9185c158ad813eebb64ed293c733089d" ON public."__chart_day__per_user_notes" USING btree ("group")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_4459a4bb0de0d3ff1b26b7f0a0865ac7" ON public."__chart_day__per_user_reaction" USING btree ("group")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_b9917a60f543f8741c5b9ca50ce23173" ON public."antenna_note" USING btree ("antennaId", read)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_bf11e0447522f4f649322d2290037915" ON public."drive_file" USING btree ("userId", "isLink")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_09874c86c7f37714bcb0696f9bce9d06" ON public."drive_file" USING btree ("userId", md5)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_e3bd0e25f3f8669093054681271693da" ON public."emoji" USING btree (type) WHERE (host IS NULL)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_b8cfd48e1e0b93e5982d09233064eb64" ON public."following" USING btree ("followeeId", id)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_b2c0347b9f7a7e5e00235842d93e2b4e" ON public."following" USING btree ("followeeId") WHERE ("followerHost" IS NULL)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_2279f91885c51d50270245397cada238" ON public."following" USING btree ("followerId", id)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_7b73e06d08350fd6502cf5e7432502da" ON public."following" USING btree ("followerId") WHERE ("followeeHost" IS NULL)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_6d1a25fc690c8e9d0faa5e70fdb518bd" ON public."messaging_message" USING btree ("groupId", "createdAt")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_42c1178dd2f1eecb2584dc19d700160c" ON public."messaging_message" USING btree (uri)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_3d15f88edd99e484581bf6d8c2ac0e68" ON public."note_reaction" USING btree ("noteId", reaction)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_a16d7f8dea147686c6a3d285e4bec8de" ON public."note_watching" USING btree ("noteUserId", "userId")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_0db27ee72b3d9a88a755aed60cc21ed6" ON public."note" USING btree ("channelId", "userId", id)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_4e05b2eb7cd3fdffe6f8bc077dbbd26e" ON public."note" USING btree ("renoteId", "userId")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_062bc03be67ac94a962ba957dab3ec8e" ON public."note" USING btree ("renoteUserId")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_c8162c63b0b89958021c2f91cbd5527c" ON public."note" USING btree ("replyUserId")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_af9030f1f6fbd3a88671e2532e4b2133" ON public."note" USING btree ("userId", id) WHERE ("replyId" IS NULL)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_40da16732311a07f927513637c89b199" ON public."note" USING btree ("userId", id)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_32ff2b5d1833e853beaf2e6f7fc8aab8" ON public."note" USING btree ("userId") WHERE (cw IS NULL)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_f47523a7befe9a1322373c0b94611fee" ON public."notification" USING btree ("notifieeId", "isRead")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_cabae82a781475a4714b1dd6da54e5da" ON public."notification" USING btree ("notifieeId", "noteId")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_e9d3477bba1ab8d8aaeace4cfcfcb36f" ON public."user" USING btree ("isBot", "isAdmin", "isDeleted") WHERE (host IS NULL)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_9d6d2dc700ae2dd749d6009ad83167aa" ON public."user" USING btree ("isExplorable", "updatedAt") WHERE (host IS NULL)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_f2f144778575581259bb179a82dcfeaf" ON public."user" USING btree ("lastActiveDate") WHERE (host IS NULL)`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_9027540a0629e7868e203a4bb507100e" ON public."user" USING btree (username) WHERE (host IS NULL)`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_1dc6e9f6f42fcc2bcdd03b3b5b4db759"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_3e9edab3abe89798a5b1588929bfc602"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_1e4375d5aac136ac0f480196990a00a1"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_d9fd2cf8350e283694021e39a3bdb5f1"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_6472fb70c7b0136417de13b048cf7611"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_b0876ca01d702d467bf9267fedc50132"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_7b68cd0c39dbd8b20921801ea620b394"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_d498b96be88d7c5c0b0cf102ba2b081b"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_33479fbcfa0f39211cc29b50de8f3b4f"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_0eebcf53bb02393b1f830113a5cbf102"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_ab6187444614a544b675dbbe01e3eaf4"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_7f340660485e031dead35bda40b2cc31"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_e75578e4509536074e42eff117a3d1a0"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_9185c158ad813eebb64ed293c733089d"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_4459a4bb0de0d3ff1b26b7f0a0865ac7"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_b9917a60f543f8741c5b9ca50ce23173"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_bf11e0447522f4f649322d2290037915"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_09874c86c7f37714bcb0696f9bce9d06"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_e3bd0e25f3f8669093054681271693da"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_b8cfd48e1e0b93e5982d09233064eb64"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_b2c0347b9f7a7e5e00235842d93e2b4e"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_2279f91885c51d50270245397cada238"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_7b73e06d08350fd6502cf5e7432502da"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_6d1a25fc690c8e9d0faa5e70fdb518bd"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_42c1178dd2f1eecb2584dc19d700160c"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_3d15f88edd99e484581bf6d8c2ac0e68"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_a16d7f8dea147686c6a3d285e4bec8de"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_0db27ee72b3d9a88a755aed60cc21ed6"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_4e05b2eb7cd3fdffe6f8bc077dbbd26e"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_062bc03be67ac94a962ba957dab3ec8e"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_c8162c63b0b89958021c2f91cbd5527c"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_af9030f1f6fbd3a88671e2532e4b2133"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_40da16732311a07f927513637c89b199"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_32ff2b5d1833e853beaf2e6f7fc8aab8"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_f47523a7befe9a1322373c0b94611fee"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_cabae82a781475a4714b1dd6da54e5da"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_e9d3477bba1ab8d8aaeace4cfcfcb36f"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_9d6d2dc700ae2dd749d6009ad83167aa"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_f2f144778575581259bb179a82dcfeaf"`,
		);
		await queryRunner.query(
			`DROP INDEX IF EXISTS "IDX_9027540a0629e7868e203a4bb507100e"`,
		);
	}
}
