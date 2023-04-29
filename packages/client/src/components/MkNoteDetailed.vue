<template>
	<div
		v-if="!muted.muted"
		v-show="!isDeleted"
		ref="el"
		v-hotkey="keymap"
		v-size="{ max: [500, 450, 350, 300] }"
		class="lxwezrsl _block"
		:tabindex="!isDeleted ? '-1' : null"
		:class="{
			renote: isRenote,
			colorize,
			colorgrad,
			colorbg,
			colorborder,
			compact,
		}"
	>
		<MkNoteSub
			v-for="note in conversation"
			:key="note.id"
			class="reply-to-more"
			:note="note"
		/>
		<MkNoteSub
			v-if="appearNote.reply"
			:note="appearNote.reply"
			class="reply-to"
		/>

		<div ref="noteEl" class="article" tabindex="-1">
			<MkNote
				@contextmenu.stop="onContextmenu"
				tabindex="-1"
				:note="appearNote"
				:detailedView="true"
			></MkNote>
		</div>

		<MkNoteSub
			v-for="note in directReplies"
			:key="note.id"
			:note="note"
			class="reply"
			:conversation="replies"
		/>
	</div>
	<div v-else class="_panel muted" @click="muted.muted = false">
		<I18n :src="i18n.ts.userSaysSomethingReason" tag="small">
			<template #name>
				<MkA
					v-user-preview="appearNote.userId"
					class="name"
					:to="userPage(appearNote.user)"
				>
					<MkUserName :user="appearNote.user" />
				</MkA>
			</template>
			<template #reason>
				<b class="_blur_text">{{ muted.matched.join(", ") }}</b>
			</template>
		</I18n>
	</div>
</template>

<script lang="ts" setup>
import {
	computed,
	inject,
	onMounted,
	onUnmounted,
	onUpdated,
	reactive,
	ref,
} from "vue";
import * as mfm from "mfm-js";
import type * as misskey from "calckey-js";
import MkNote from "@/components/MkNote.vue";
import MkNoteSub from "@/components/MkNoteSub.vue";
import XNoteSimple from "@/components/MkNoteSimple.vue";
import XReactionsViewer from "@/components/MkReactionsViewer.vue";
import XMediaList from "@/components/MkMediaList.vue";
import XCwButton from "@/components/MkCwButton.vue";
import XPoll from "@/components/MkPoll.vue";
import XStarButton from "@/components/MkStarButton.vue";
import XStarButtonNoEmoji from "@/components/MkStarButtonNoEmoji.vue";
import XRenoteButton from "@/components/MkRenoteButton.vue";
import XQuoteButton from "@/components/MkQuoteButton.vue";
import MkUrlPreview from "@/components/MkUrlPreview.vue";
import MkInstanceTicker from "@/components/MkInstanceTicker.vue";
import MkVisibility from "@/components/MkVisibility.vue";
import { pleaseLogin } from "@/scripts/please-login";
import { getWordMute } from "@/scripts/check-word-mute";
import { userPage } from "@/filters/user";
import { notePage } from "@/filters/note";
import { useRouter } from "@/router";
import * as os from "@/os";
import { defaultStore, noteViewInterruptors } from "@/store";
import { reactionPicker } from "@/scripts/reaction-picker";
import { extractUrlFromMfm } from "@/scripts/extract-url-from-mfm";
import { $i } from "@/account";
import { i18n } from "@/i18n";
import { getNoteMenu } from "@/scripts/get-note-menu";
import { useNoteCapture } from "@/scripts/use-note-capture";
import { deepClone } from "@/scripts/clone";
import { stream } from "@/stream";
import { NoteUpdatedEvent } from "calckey-js/built/streaming.types";

const router = useRouter();

const props = defineProps<{
	note: misskey.entities.Note;
	pinned?: boolean;
}>();

const inChannel = inject("inChannel", null);
const colorize = defaultStore.state.replyDividerColorize;
const colorbg = defaultStore.state.replyDividerColorBg;
const colorgrad = defaultStore.state.replyDividerColorGrad && !colorbg;
const colorborder = defaultStore.state.replyDividerColorBorder;
const compact = defaultStore.state.replyIndentCompact;

let note = $ref(deepClone(props.note));

const enableEmojiReactions = defaultStore.state.enableEmojiReactions;

// plugin
if (noteViewInterruptors.length > 0) {
	onMounted(async () => {
		let result = deepClone(note);
		for (const interruptor of noteViewInterruptors) {
			result = await interruptor.handler(result);
		}
		note = result;
	});
}

const isRenote =
	note.renote != null &&
	note.text == null &&
	note.fileIds.length === 0 &&
	note.poll == null;

const el = ref<HTMLElement>();
const noteEl = $ref();
const menuButton = ref<HTMLElement>();
const starButton = ref<InstanceType<typeof XStarButton>>();
const renoteButton = ref<InstanceType<typeof XRenoteButton>>();
const renoteTime = ref<HTMLElement>();
const reactButton = ref<HTMLElement>();
let appearNote = $computed(() =>
	isRenote ? (note.renote as misskey.entities.Note) : note
);
const isMyRenote = $i && $i.id === note.userId;
const showContent = ref(defaultStore.state.autoShowCw);
const isDeleted = ref(false);
const muted = ref(getWordMute(appearNote, $i, defaultStore.state.mutedWords));
const translation = ref(null);
const translating = ref(false);
const urls = appearNote.text
	? extractUrlFromMfm(mfm.parse(appearNote.text)).slice(0, 5)
	: null;
const showTicker =
	defaultStore.state.instanceTicker === "always" ||
	(defaultStore.state.instanceTicker === "remote" &&
		appearNote.user.instance);
const conversation = ref<misskey.entities.Note[]>([]);
const replies = ref<misskey.entities.Note[]>([]);
const directReplies = ref<misskey.entities.Note[]>([]);
const repliesDepth = defaultStore.state.repliesDepth;
let isScrolling;

const keymap = {
	r: () => reply(true),
	"e|a|plus": () => react(true),
	q: () => renoteButton.value.renote(true),
	esc: blur,
	"m|o": () => menu(true),
	s: () => showContent.value !== showContent.value,
};

useNoteCapture({
	rootEl: el,
	note: $$(appearNote),
	isDeletedRef: isDeleted,
});

function reply(viaKeyboard = false): void {
	pleaseLogin();
	os.post(
		{
			reply: appearNote,
			animation: !viaKeyboard,
		},
		() => {
			focus();
		}
	);
}

function react(viaKeyboard = false): void {
	pleaseLogin();
	blur();
	reactionPicker.show(
		reactButton.value,
		(reaction) => {
			os.api("notes/reactions/create", {
				noteId: appearNote.id,
				reaction: reaction,
			});
		},
		() => {
			focus();
		}
	);
}

function undoReact(note): void {
	const oldReaction = note.myReaction;
	if (!oldReaction) return;
	os.api("notes/reactions/delete", {
		noteId: note.id,
	});
}

function onContextmenu(ev: MouseEvent): void {
	const isLink = (el: HTMLElement) => {
		if (el.tagName === "A") return true;
		if (el.parentElement) {
			return isLink(el.parentElement);
		}
	};
	if (isLink(ev.target)) return;
	if (window.getSelection().toString() !== "") return;

	if (defaultStore.state.useReactionPickerForContextMenu) {
		ev.preventDefault();
		react();
	} else {
		os.contextMenu(
			getNoteMenu({
				note: note,
				translating,
				translation,
				menuButton,
				isDeleted,
			}),
			ev
		).then(focus);
	}
}

function menu(viaKeyboard = false): void {
	os.popupMenu(
		getNoteMenu({
			note: note,
			translating,
			translation,
			menuButton,
			isDeleted,
		}),
		menuButton.value,
		{
			viaKeyboard,
		}
	).then(focus);
}

function showRenoteMenu(viaKeyboard = false): void {
	if (!isMyRenote) return;
	os.popupMenu(
		[
			{
				text: i18n.ts.unrenote,
				icon: "ph-trash ph-bold ph-lg",
				danger: true,
				action: () => {
					os.api("notes/delete", {
						noteId: note.id,
					});
					isDeleted.value = true;
				},
			},
		],
		renoteTime.value,
		{
			viaKeyboard: viaKeyboard,
		}
	);
}

function focus() {
	noteEl.focus();
}

function blur() {
	noteEl.blur();
}

os.api("notes/children", {
	noteId: appearNote.id,
	limit: 30,
	depth: repliesDepth + 1,
}).then((res) => {
	replies.value = res;
	directReplies.value = res
		.filter(
			(note) =>
				note.replyId === appearNote.id ||
				note.renoteId === appearNote.id
		)
		.reverse();
});

if (appearNote.replyId) {
	os.api("notes/conversation", {
		noteId: appearNote.replyId,
		limit: 30,
	}).then((res) => {
		conversation.value = res.reverse();
		focus();
	});
}

async function onNoteUpdated(noteData: NoteUpdatedEvent): void {
	const { type, id, body } = noteData;

	let found = -1;
	if (id === appearNote.id) {
		found = 0;
	} else {
		for (let i = 0; i < replies.value.length; i++) {
			const reply = replies.value[i];
			if (reply.id === id) {
				found = i + 1;
				break;
			}
		}
	}

	if (found === -1) {
		return;
	}

	switch (type) {
		case "replied":
			const { id: createdId } = body;
			const replyNote = await os.api("notes/show", {
				noteId: createdId,
			});

			replies.value.splice(found, 0, replyNote);
			if (found === 0) {
				directReplies.value.unshift(replyNote);
			}
			break;

		case "updated":
			const { text, cw, tags, fileIds, attachedFileTypes, updatedAt } =
				body;

			let updatedNote = appearNote;
			if (found > 0) {
				updatedNote = replies.value[found - 1];
			}
			if (text) updatedNote.text = text;
			if (cw) updatedNote.cw = cw;
			if (tags) updatedNote.tags = tags;
			if (fileIds) {
				updatedNote.fileIds = fileIds;
				updatedNote.attachedFileTypes = attachedFileTypes;
			}
			updatedNote.updatedAt = updatedAt;
			break;

		case "deleted":
			if (found === 0) {
				isDeleted.value = true;
			} else {
				replies.value.splice(found - 1, 1);
			}
			break;
	}
}

document.addEventListener("wheel", () => {
	isScrolling = true;
});

onMounted(() => {
	stream.on("noteUpdated", onNoteUpdated);
	isScrolling = false;
	noteEl.scrollIntoView();
});

onUpdated(() => {
	if (!isScrolling) {
		noteEl.scrollIntoView();
	}
});

onUnmounted(() => {
	stream.off("noteUpdated", onNoteUpdated);
});
</script>

<style lang="scss" scoped>
.lxwezrsl {
	font-size: 1.05em;
	position: relative;
	transition: box-shadow 0.1s ease;
	contain: content;

	&:focus-visible {
		outline: none;

		&:after {
			content: "";
			pointer-events: none;
			display: block;
			position: absolute;
			z-index: 10;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			margin: auto;
			width: calc(100% - 8px);
			height: calc(100% - 8px);
			border: solid 1px var(--focus);
			border-radius: var(--radius);
			box-sizing: border-box;
		}
	}

	&:hover > .article > .main > .footer > .button {
		opacity: 1;
	}
	> .reply-to {
		margin-bottom: -16px;
	}

	> .reply-to-more {
		// opacity: 0.7;
		cursor: pointer;

		@media (pointer: coarse) {
			cursor: default;
		}
	}

	> .renote {
		display: flex;
		align-items: center;
		padding: 16px 32px 8px 32px;
		line-height: 28px;
		white-space: pre;
		color: var(--renote);

		> .avatar {
			flex-shrink: 0;
			display: inline-block;
			width: 28px;
			height: 28px;
			margin: 0 8px 0 0;
			border-radius: 6px;
		}

		> i {
			margin-right: 4px;
		}

		> span {
			overflow: hidden;
			flex-shrink: 1;
			text-overflow: ellipsis;
			white-space: nowrap;

			> .name {
				font-weight: bold;
			}
		}

		> .info {
			margin-left: auto;
			font-size: 0.9em;

			> .time {
				flex-shrink: 0;
				color: inherit;

				> .dropdownIcon {
					margin-right: 4px;
				}
			}
		}
	}

	> .renote + .article {
		padding-top: 8px;
	}

	> .article {
		padding-block: 28px 6px;
		&:last-child {
			padding-bottom: 24px;
		}
		font-size: 1.1em;
		overflow: clip;
		outline: none;
		scroll-margin-top: calc(var(--stickyTop) + 20vh);
		:deep(.article) {
			cursor: unset;
		}
	}

	> .reply {
		border-top: solid 0.5px var(--divider);
		cursor: pointer;
		padding-top: 24px;
		padding-bottom: 10px;
		@media (pointer: coarse) {
			cursor: default;
		}
	}

	// Hover
	.reply :deep(.main),
	.reply-to,
	.reply-to-more,
	:deep(.more) {
		position: relative;
		&::before {
			content: "";
			position: absolute;
			inset: -12px -24px;
			bottom: -0px;
			background: var(--panelHighlight);
			border-radius: var(--radius);
			opacity: 0;
			transition: opacity 0.2s;
			z-index: -1;
		}
		&.reply-to,
		&.reply-to-more {
			&::before {
				inset: 0px 8px;
			}
			&:first-of-type::before {
				top: 12px;
			}
		}
		// &::after {
		// 	content: "";
		// 	position: absolute;
		// 	inset: -9999px;
		// 	background: var(--modalBg);
		// 	opacity: 0;
		// 	z-index: -2;
		// 	pointer-events: none;
		// 	transition: opacity .2s;
		// }
		&.more::before {
			inset: 0 !important;
		}
		&:hover,
		&:focus-within {
			&::before {
				opacity: 1;
			}
		}
		// @media (pointer: coarse) {
		// 	&:has(.button:focus-within) {
		// 		z-index: 2;
		// 		--X13: transparent;
		// 		&::after {
		// 			opacity: 1;
		// 			backdrop-filter: var(--modalBgFilter);
		// 		}
		// 	}
		// }
	}

	&.max-width_500px {
		font-size: 0.9em;
	}

	&.max-width_450px {
		> .reply-to-more:first-child {
			padding-top: 14px;
		}
		> .renote {
			padding: 8px 16px 0 16px;
		}

		> .article {
			padding: 6px 0 0 0;
			> .header > .body {
				padding-left: 10px;
			}
		}
	}

	&.max-width_350px {
		> .article {
			> .main {
				> .footer {
					> .button {
						&:not(:last-child) {
							margin-right: 18px;
						}
					}
				}
			}
		}
	}

	&.max-width_300px {
		font-size: 0.825em;

		> .article {
			> .main {
				> .footer {
					> .button {
						&:not(:last-child) {
							margin-right: 12px;
						}
					}
				}
			}
		}
	}
}

.muted {
	padding: 8px;
	text-align: center;
	opacity: 0.7;
}
</style>
