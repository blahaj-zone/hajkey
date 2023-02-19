export class AutoWatch1676776453697 {
    name = 'AutoWatch1676776453697'

    async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "user_profile" ADD "autoWatchReplied" boolean NOT NULL DEFAULT false`);
			await queryRunner.query(`ALTER TABLE "user_profile" ADD "autoWatchBoosted" boolean NOT NULL DEFAULT false`);
			await queryRunner.query(`ALTER TABLE "user_profile" ADD "autoWatchQuoted" boolean NOT NULL DEFAULT false`);
			await queryRunner.query(`ALTER TABLE "user_profile" ADD "autoWatchReacted" boolean NOT NULL DEFAULT false`);
			await queryRunner.query(`ALTER TABLE "user_profile" ADD "autoWatchVoted" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "autoWatchReacted"`);
				await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "autoWatchBoosted"`);
				await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "autoWatchQuoted"`);
				await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "autoWatchReplied"`);
				await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "autoWatchVoted"`);
    }
}
