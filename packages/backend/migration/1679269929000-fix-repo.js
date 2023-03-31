export class FixRepo1679269929000 {
	name = 'FixRepo1679269929000'

	async up(queryRunner) {
		await queryRunner.query(`UPDATE meta SET "repositoryUrl" = 'https://codeberg.org/calckey/calckey'`);
		await queryRunner.query(`UPDATE meta SET "feedbackUrl" = 'https://codeberg.org/calckey/calckey/issues'`);
	}

	async down(queryRunner) {
		await queryRunner.query(`UPDATE meta SET "repositoryUrl" = 'https://codeberg.org/calckey/calckey'`);
		await queryRunner.query(`UPDATE meta SET "feedbackUrl" = 'https://codeberg.org/calckey/calckey/issues'`);
	}
}
