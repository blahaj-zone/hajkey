export class IceshrimpRepo1689965609061 {
	name = "IceshrimpRepo1689965609061";

	async up(queryRunner) {
		await queryRunner.query(
			`UPDATE meta SET "repositoryUrl" = 'https://iceshrimp.dev/iceshrimp/iceshrimp'`,
		);
		await queryRunner.query(
			`UPDATE meta SET "feedbackUrl" = 'https://iceshrimp.dev/iceshrimp/iceshrimp/issues'`,
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
