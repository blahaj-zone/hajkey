/* "CalckeyRepoMove1671388343000" is a class that updates the "useStarForReactionFallback" column in
the "meta" table to TRUE */
export class CalckeyRepoMove1671388343000 {
	name = "CalckeyRepoMove1671388343000";

	async up(queryRunner) {
		await queryRunner.query(
			`UPDATE meta SET "repositoryUrl" = 'https://codeberg/calckey/calckey'`,
		);
		await queryRunner.query(
			`UPDATE meta SET "feedbackUrl" = 'https://codeberg/calckey/calckey/issues'`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`UPDATE meta SET "repositoryUrl" = 'https://codeberg/calckey/calckey'`,
		);
		await queryRunner.query(
			`UPDATE meta SET "feedbackUrl" = 'https://codeberg/calckey/calckey/issues'`,
		);
	}
}
