export class IndexOptimise21679218344810 {
	async up(queryRunner) {
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_67c389635f70e138f7c542f7eb539740405941d4" ON public."muted_note" USING btree ("userId", "reason")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_716d9f3f2384ee130531933293a918a5b78738a6" ON public."note" USING btree ("userId", "visibility") WHERE ("renoteId" IS NULL)`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_2fd3f6859cfaad6b8778b3046a275e11792df24d" ON public."user_profile" USING btree ("email", "emailVerified")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_9f2c982afa04669c5cf5421f0e86813daa3a2d64" ON public."notification" USING btree ("notifierId", "isRead")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_6851ad1c1137e3894f35fa5dfa52aa12480c9271" ON public."__chart_day__instance" USING btree ("group", "date")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_c027e94c2a39c2525fad971c485013386102b4e3" ON public."__chart__per_user_reaction" USING btree ("group")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bf1907dd7d04a39259c4b98891fe4c1277036262" ON public."note" USING btree ("userId", "localOnly", "id")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_1cfd4a47a207441a5163d2812dc52408681eaf0b" ON public."messaging_message" USING btree ("recipientId", "userId", "isRead")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_e83276623fbec47c256d7d99d294ed9df92c9028" ON public."page" USING btree ("visibility")		`);
	}

	async down(queryRunner) {
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_67c389635f70e138f7c542f7eb539740405941d4"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_716d9f3f2384ee130531933293a918a5b78738a6"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_2fd3f6859cfaad6b8778b3046a275e11792df24d"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_9f2c982afa04669c5cf5421f0e86813daa3a2d64"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_6851ad1c1137e3894f35fa5dfa52aa12480c9271"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_c027e94c2a39c2525fad971c485013386102b4e3"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bf1907dd7d04a39259c4b98891fe4c1277036262"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_1cfd4a47a207441a5163d2812dc52408681eaf0b"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_e83276623fbec47c256d7d99d294ed9df92c9028"`);
	}
}
