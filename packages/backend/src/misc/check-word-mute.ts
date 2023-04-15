import RE2 from "re2";
import type { Note } from "@/models/entities/note.js";
import type { User } from "@/models/entities/user.js";

type NoteLike = {
	userId: Note["userId"];
	text: Note["text"];
	cw?: Note["cw"];
};

type UserLike = {
	id: User["id"];
};

export type Muted = {
	muted: boolean;
	matched: string[];
};

const NotMuted = { muted: false, matched: [] };

function escapeRegExp(x: string) {
	return x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export async function getWordMute(
	note: NoteLike,
	me: UserLike | null | undefined,
	mutedWords: Array<string | string[]>,
): Promise<Muted> {
	// 自分自身
	if (me && note.userId === me.id) {
		return NotMuted;
	}

	if (mutedWords.length > 0) {
		const text = ((note.cw ?? "") + "\n" + (note.text ?? "")).trim();

		if (text === "") {
			return NotMuted;
		}

		for (const mutePattern of mutedWords) {
			let mute: RE2;
			let matched: string[];
			if (Array.isArray(mutePattern)) {
				matched = mutePattern.filter((keyword) => keyword !== "");

				if (matched.length === 0) {
					continue;
				}
				mute = new RE2(
					`\\b${matched.map(escapeRegExp).join("\\b.*\\b")}\\b`,
					"g",
				);
			} else {
				const regexp = mutePattern.match(/^\/(.+)\/(.*)$/);
				// This should never happen due to input sanitisation.
				if (!regexp) {
					console.warn(`Found invalid regex in word mutes: ${mutePattern}`);
					continue;
				}
				mute = new RE2(regexp[1], regexp[2]);
				matched = [mutePattern];
			}

			try {
				if (mute.test(text)) {
					return { muted: true, matched };
				}
			} catch (err) {
				// This should never happen due to input sanitisation.
			}
		}
	}

	return NotMuted;
}
