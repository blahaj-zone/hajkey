export class IceshrimpRepo1689965609061 {
	name = "IceshrimpRepo1689965609061";

	async up(queryRunner) {
		await queryRunner.query(
			`UPDATE meta SET "repositoryUrl" = 'https://git.hajkey.org/hajkey/hajkey'`,
		);
		await queryRunner.query(
			`UPDATE meta SET "feedbackUrl" = 'https://git.hajkey.org/hajkey/hajkey/issues'`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`UPDATE meta SET "repositoryUrl" = 'https://codeberg.org/firefish/firefish'`,
		);
		await queryRunner.query(
			`UPDATE meta SET "feedbackUrl" = 'https://codeberg.org/firefish/firefish/issues'`,
		);
	}
}
