import define from "../define.js";

export const meta = {
	tags: ["meta"],
	description: "Get list of Calckey patrons from Codeberg",

	requireCredential: false,
	requireCredentialPrivateMode: false,
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async () => {
	let patrons;
	await fetch(
		"https://codeberg.org/calckey/calckey/raw/branch/develop/patrons.json",
	)
		.then((response) => response.json())
		.then((data) => {
			patrons = data["patrons"];
		});

	return patrons;
});
