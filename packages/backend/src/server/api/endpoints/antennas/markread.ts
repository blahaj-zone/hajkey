import define from "../../define.js";
import { Antennas, AntennaNotes } from "@/models/index.js";
import { FindOptionsWhere } from "typeorm";
import { AntennaNote } from "@/models/entities/antenna-note.js";

export const meta = {
	tags: ["antennas", "account"],

	requireCredential: true,

	kind: "write:account",
} as const;

export const paramDef = {
	type: "object",
	properties: {
		antennaId: { type: "string", format: "misskey:id" },
	},
	required: ["antennaId"],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const antenna = await Antennas.findOneBy({
		userId: me.id,
		id: ps.antennaId,
	});

	if (!antenna) {
		return null;
	}

	await AntennaNotes.update(
		{
			antennaId: antenna.id,
			read: false,
		},
		{
			read: true,
		},
	);

	return true;
});
