<template>
	<div
		ref="el"
		v-size="{ max: [450, 500] }"
		class="wrpstxzv"
		:class="{
			children: depth > 1,
			singleStart: replies.length == 1,
			firstColumn: depth == 1 && conversation,
			[`level${colorOffset}`]: true,
		}"
	>
		<div v-if="conversation && depth > 1" class="line"></div>
		<div class="main" @click="noteClick">
			<div class="avatar-container">
				<MkAvatar class="avatar" :user="appearNote.user" />
				<div
					v-if="!conversation || replies.length > 0"
					class="line"
				></div>
			</div>
			<div class="body">
				<XNoteHeader class="header" :note="note" :mini="true" />
				<div class="body">
					<p v-if="appearNote.cw != null" class="cw">
						<MkA
							v-if="appearNote.replyId"
							:to="`/notes/${appearNote.replyId}`"
							class="reply-icon"
							@click.stop
						>
							<i class="ph-arrow-bend-left-up ph-bold ph-lg"></i>
						</MkA>
						<MkA
							v-if="
								conversation &&
								appearNote.renoteId &&
								appearNote.renoteId != parentId &&
								!appearNote.replyId
							"
							:to="`/notes/${appearNote.renoteId}`"
							class="reply-icon"
							@click.stop
						>
							<i class="ph-quotes ph-bold ph-lg"></i>
						</MkA>
						<Mfm
							v-if="appearNote.cw != ''"
							class="text"
							:text="appearNote.cw"
							:author="appearNote.user"
							:i="$i"
							:custom-emojis="appearNote.emojis"
						/>
						<br />
						<XCwButton v-model="showContent" :note="note" />
					</p>
					<div
						v-show="appearNote.cw == null || showContent"
						class="content"
					>
						<MkSubNoteContent
							class="text"
							:note="note"
							:detailed="true"
							:parentId="appearNote.parentId"
							:conversation="conversation"
						/>
					</div>
					<div v-if="translating || translation" class="translation">
						<MkLoading v-if="translating" mini />
						<div v-else class="translated">
							<b
								>{{
									i18n.t("translatedFrom", {
										x: translation.sourceLang,
									})
								}}:
							</b>
							<Mfm
								:text="translation.text"
								:author="appearNote.user"
								:i="$i"
								:custom-emojis="appearNote.emojis"
							/>
						</div>
					</div>
				</div>
				<footer class="footer" @click.stop>
					<XReactionsViewer
						ref="reactionsViewer"
						:note="appearNote"
					/>
					<button
						v-tooltip.noDelay.bottom="i18n.ts.reply"
						class="button _button"
						@click="reply()"
					>
						<i class="ph-arrow-u-up-left ph-bold ph-lg"></i>
						<template v-if="appearNote.repliesCount > 0">
							<p class="count">{{ appearNote.repliesCount }}</p>
						</template>
					</button>
					<XRenoteButton
						ref="renoteButton"
						class="button"
						:note="appearNote"
						:count="appearNote.renoteCount"
					/>
					<XStarButton
						v-if="appearNote.myReaction == null"
						ref="starButton"
						class="button"
						:note="appearNote"
					/>
					<button
						v-if="appearNote.myReaction == null"
						ref="reactButton"
						v-tooltip.noDelay.bottom="i18n.ts.reaction"
						class="button _button"
						@click="react()"
					>
						<i class="ph-smiley ph-bold ph-lg"></i>
					</button>
					<button
						v-if="appearNote.myReaction != null"
						ref="reactButton"
						class="button _button reacted"
						@click="undoReact(appearNote)"
					>
						<i class="ph-minus ph-bold ph-lg"></i>
					</button>
					<XQuoteButton class="button" :note="appearNote" />
					<button
						ref="menuButton"
						v-tooltip.noDelay.bottom="i18n.ts.more"
						class="button _button"
						@click="menu()"
					>
						<i class="ph-dots-three-outline ph-bold ph-lg"></i>
					</button>
				</footer>
			</div>
		</div>
		<template v-if="conversation">
			<template
				v-if="
					replies.length == 1 &&
					depth < repliesDepth &&
					collapseSingles
				"
			>
				<MkNoteSub
					v-for="reply in replies"
					:key="reply.id"
					:note="reply"
					class="reply single"
					:conversation="conversation"
					:depth="depth"
					:offset="offset"
					:colorizer="colorizer"
					:parentId="appearNote.replyId"
				/>
			</template>
			<template v-else-if="depth < repliesDepth">
				<MkNoteSub
					v-for="reply in replies"
					:key="reply.id"
					:note="reply"
					class="reply"
					:conversation="conversation"
					:depth="depth + 1"
					:offset="offset + index"
					:colorizer="colorizer.advance()"
					:parentId="appearNote.replyId"
				/>
			</template>
			<div v-else-if="replies.length > 0" class="more">
				<div class="line"></div>
				<MkA class="text _link" :to="notePage(note)"
					>{{ i18n.ts.continueThread }}
					<i class="ph-caret-double-right ph-bold ph-lg"></i
				></MkA>
			</div>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { inject, ref } from "vue";
import type { Ref } from "vue";
import * as misskey from "calckey-js";
import XNoteHeader from "@/components/MkNoteHeader.vue";
import MkSubNoteContent from "@/components/MkSubNoteContent.vue";
import XReactionsViewer from "@/components/MkReactionsViewer.vue";
import XStarButton from "@/components/MkStarButton.vue";
import XRenoteButton from "@/components/MkRenoteButton.vue";
import XQuoteButton from "@/components/MkQuoteButton.vue";
import XCwButton from "@/components/MkCwButton.vue";
import { pleaseLogin } from "@/scripts/please-login";
import { getNoteMenu } from "@/scripts/get-note-menu";
import { notePage } from "@/filters/note";
import { useRouter } from "@/router";
import * as os from "@/os";
import { reactionPicker } from "@/scripts/reaction-picker";
import { i18n } from "@/i18n";
import { deepClone } from "@/scripts/clone";
import { useNoteCapture } from "@/scripts/use-note-capture";
import { defaultStore } from "@/store";

const router = useRouter();

class Colorizer {
	public offset: number;
	constructor() {
		this.offset = 0;
	}
	advance(): Colorizer {
		this.offset++;
		return this;
	}
	current(): number {
		return this.offset % 8;
	}
}

const props = withDefaults(
	defineProps<{
		note: misskey.entities.Note;
		conversation?: misskey.entities.Note[];
		parentId?: misskey.entities.Note['id'];

		// how many notes are in between this one and the note being viewed in detail
		depth?: number;
		offset?: number;
		child?: number;

		colorizer?: Colorizer;
	}>(),
	{
		depth: 1,
		offset: 0,
		child: 0,
	}
);

const colorizer: Colorizer = $ref(props.colorizer ?? new Colorizer())
const colorOffset = colorizer.current();

let note = $ref(deepClone(props.note));

const isRenote =
	note.renote != null &&
	note.text == null &&
	note.fileIds.length === 0 &&
	note.poll == null;

const el = ref<HTMLElement>();
const menuButton = ref<HTMLElement>();
const starButton = ref<InstanceType<typeof XStarButton>>();
const renoteButton = ref<InstanceType<typeof XRenoteButton>>();
const reactButton = ref<HTMLElement>();
let appearNote = $computed(() =>
	isRenote ? (note.renote as misskey.entities.Note) : note
);
const isDeleted = ref(false);
const translation = ref(null);
const translating = ref(false);
let showContent = $ref(defaultStore.state.autoShowCw);
const repliesDepth = defaultStore.state.repliesDepth;
const replies: misskey.entities.Note[] =
	props.conversation
		?.filter(
			(item) =>
				item.replyId === props.note.id ||
				item.renoteId === props.note.id
		)
		.reverse() ?? [];
let collapseSingles = $ref(defaultStore.state.replyCollapseSingles);

useNoteCapture({
	rootEl: el,
	note: $$(appearNote),
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

const currentClipPage = inject<Ref<misskey.entities.Clip> | null>(
	"currentClipPage",
	null
);

function menu(viaKeyboard = false): void {
	os.popupMenu(
		getNoteMenu({
			note: note,
			translating,
			translation,
			menuButton,
			isDeleted,
			currentClipPage,
		}),
		menuButton.value,
		{
			viaKeyboard,
		}
	).then(focus);
}

function focus() {
	el.value.focus();
}

function blur() {
	el.value.blur();
}

function noteClick(e) {
	if (document.getSelection().type === "Range") {
		e.stopPropagation();
	} else {
		router.push(notePage(props.note));
	}
}
</script>

<style lang="scss" scoped>
.wrpstxzv {
	--colorizeColor: 128, 128, 128;
	--colorize0: 64, 121, 140; // # 40798c
	--colorize1: 255, 191, 183; // # ffbfb7
	--colorize2: 151, 200, 235; // # 97c8eb
	--colorize3: 255, 214, 102; // # ffd666
	--colorize4: 155, 119, 158; // # 9b779e
	--colorize5: 226, 112, 132; // # e27084
	--colorize6: 194, 234, 189; // # c2eabd
	--colorize7: 240, 182, 127; // # f0b67f

	&.level0 {
		> .main,
		> .line,
		> .body {
			--colorizeColor: var(--colorize0);
		}
	}
	&.level1 {
		> .main,
		> .line,
		> .body {
			--colorizeColor: var(--colorize1);
		}
	}
	&.level2 {
		> .main,
		> .line,
		> .body {
			--colorizeColor: var(--colorize2);
		}
	}
	&.level3 {
		> .main,
		> .line,
		> .body {
			--colorizeColor: var(--colorize3);
		}
	}
	&.level4 {
		> .main,
		> .line,
		> .body {
			--colorizeColor: var(--colorize4);
		}
	}
	&.level5 {
		> .main,
		> .line,
		> .body {
			--colorizeColor: var(--colorize5);
		}
	}
	&.level6 {
		> .main,
		> .line,
		> .body {
			--colorizeColor: var(--colorize6);
		}
	}
	&.level7 {
		> .main,
		> .line,
		> .body {
			--colorizeColor: var(--colorize7);
		}
	}

	--subNoteOutdent: 5px;

	.compact & {
		--subNoteOutdent: 24px;
		&.reply {
			--avatarSize: 32px;
		}
	}

	.colorbg &,
	.colorgrad &,
	.colorborder & {
		> .main {
			border-radius: 7px;
			padding-right: 5px;
		}
	}

	.colorbg & {
		> .main {
			background-image: linear-gradient(
				0deg,
				rgba(var(--colorizeColor), 0.18),
				rgba(var(--colorizeColor), 0.18)
			);
		}
	}

	.colorgrad & {
		> .main {
			background-position: bottom left;
			background-image: linear-gradient(
					85deg,
					rgba(var(--colorizeColor), 0.09),
					transparent 30px
				),
				linear-gradient(
					50deg,
					rgba(var(--colorizeColor), 0.18),
					transparent 150px
				),
				linear-gradient(
					1deg,
					rgba(var(--colorizeColor), 0.14),
					transparent 15px
				);
		}
	}

	.colorborder & {
		> .main {
			outline: 0.5px solid rgb(var(--colorizeColor));
		}
	}

	.colorize & {
		&.reply,
		&.reply-to,
		&.reply-to-more,
		> .main > .avatar-container {
			&.children:not(.single),
			& {
				> .line {
					&::before,
					&::after {
						border-left-width: 3px;
						border-left-color: rgb(var(--colorizeColor));
						border-bottom-color: rgb(var(--colorizeColor));
					}
				}
			}
		}
	}

	padding: 16px 32px;
	&.children {
		padding: 10px 0 0 var(--indent);
		padding-left: var(--indent) !important;
		font-size: 1em;
		cursor: auto;

		&.max-width_450px {
			padding: 10px 0 0 8px;
		}
	}

	> .main {
		display: flex;

		> .avatar-container {
			margin-right: 8px;
			> .avatar {
				flex-shrink: 0;
				display: block;
				width: 38px;
				height: 38px;
				border-radius: 8px;
			}
		}

		> .body {
			flex: 1;
			min-width: 0;
			cursor: pointer;
			margin: 0 -200px;
			padding: 0 200px;
			overflow: clip;
			@media (pointer: coarse) {
				cursor: default;
			}

			> .header {
				margin-bottom: 2px;
				cursor: auto;
			}

			> .body {
				.reply-icon {
					display: inline-block;
					border-radius: 6px;
					padding: 0.2em 0.2em;
					margin-right: 0.2em;
					color: var(--accent);
					transition: background 0.2s;
					&:hover,
					&:focus {
						background: var(--buttonHoverBg);
					}
				}
				> .cw {
					cursor: default;
					display: block;
					margin: 0;
					padding: 0;
					overflow-wrap: break-word;

					> .text {
						margin-right: 8px;
					}
				}
				> .content {
					> .text {
						margin: 0;
						padding: 0;
					}
				}
				> .translation {
					border: solid 0.5px var(--divider);
					border-radius: var(--radius);
					padding: 12px;
					margin-top: 8px;
				}
			}
			> .footer {
				position: relative;
				z-index: 2;
				display: flex;
				flex-wrap: wrap;
				pointer-events: none; // Allow clicking anything w/out pointer-events: all; to open post

				> .button {
					margin: 0;
					padding: 8px;
					opacity: 0.7;
					flex-grow: 1;
					max-width: 3.5em;
					width: max-content;
					min-width: max-content;
					pointer-events: all;
					transition: opacity 0.2s;
					&:first-of-type {
						margin-left: -0.5em;
					}
					&:hover {
						color: var(--fgHighlighted);
					}

					> .count {
						display: inline;
						margin: 0 0 0 8px;
						opacity: 0.7;
					}

					&.reacted {
						color: var(--accent);
					}
				}
			}
		}
	}
	&:first-child > .main > .body {
		margin-top: -200px;
		padding-top: 200px;
	}
	&.reply {
		--avatarSize: 38px;
		.avatar-container {
			margin-right: 8px !important;
		}
	}
	> .reply,
	> .more {
		margin-top: 10px;
		&.single {
			padding: 0 !important;
			> .line {
				display: none;
			}
		}
	}

	> .more {
		display: flex;
		padding-block: 10px;
		font-weight: 600;
		> .line {
			flex-grow: 0 !important;
			margin-top: -10px !important;
			margin-bottom: 10px !important;
			margin-right: 10px !important;
			&::before {
				border-left-style: dashed !important;
				border-bottom-left-radius: 100px !important;
			}
		}
		i {
			font-size: 1em !important;
			vertical-align: middle !important;
		}
		a {
			position: static;
			&::before {
				content: "";
				position: absolute;
				inset: 0;
			}
			&::after {
				content: unset;
			}
		}
	}

	&.reply,
	&.reply-to,
	&.reply-to-more {
		> .main:hover,
		> .main:focus-within {
			:deep(.footer .button) {
				opacity: 1;
			}
		}
	}

	&.reply-to,
	&.reply-to-more {
		padding-bottom: 0;
		&:first-child {
			padding-top: 24px;
		}
		.line::before {
			margin-bottom: -16px;
		}
	}

	// Reply Lines
	&.reply,
	&.reply-to,
	&.reply-to-more {
		--indent: calc(var(--avatarSize) - var(--subNoteOutdent));
		> .main {
			> .avatar-container {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-right: 14px;
				width: var(--avatarSize);
				> .avatar {
					width: var(--avatarSize);
					height: var(--avatarSize);
					margin: 0;
				}
			}
		}
		.line {
			position: relative;
			width: var(--avatarSize);
			display: flex;
			flex-grow: 1;
			margin-bottom: -10px;
			&::before {
				content: "";
				position: absolute;
				border-left: 2px solid var(--X13);
				margin-left: calc((var(--avatarSize) / 2) - 1px);
				width: calc(var(--indent) / 2);
				inset-block: 0;
				min-height: 8px;
			}
		}
	}
	&.reply-to,
	&.reply-to-more {
		> .main > .avatar-container > .line {
			margin-bottom: 0px !important;
		}
	}
	&.single,
	&.singleStart {
		> .main > .avatar-container > .line {
			margin-bottom: -10px !important;
		}
	}
	.reply.children:not(:last-child) {
		// Line that goes through multiple replies
		position: relative;
		> .line {
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
		}
	}
	// Reply line connectors
	.reply.children:not(.single) {
		position: relative;
		> .line {
			position: absolute;
			left: 0;
			top: 0;
			&::after {
				content: "";
				position: absolute;
				border-left: 2px solid var(--X13);
				border-bottom: 2px solid var(--X13);
				margin-left: calc((var(--avatarSize) / 2) - 1px);
				width: calc(var(--indent) / 2);
				height: calc((var(--avatarSize) / 2));
				border-bottom-left-radius: calc(var(--indent) / 2);
				top: 8px;
			}
		}
		&:not(:last-child) > .line::after {
			mask: linear-gradient(to right, transparent 2px, black 2px);
			-webkit-mask: linear-gradient(to right, transparent 2px, black 2px);
		}
	}
	// End Reply Divider
	.children > .main:last-child {
		padding-bottom: 1em;
		&::before {
			bottom: 1em;
		}
		// &::after {
		// 	content: "";
		// 	border-top: 1px solid var(--X13);
		// 	position: absolute;
		// 	bottom: 0;
		// 	margin-left: calc(var(--avatarSize) + 12px);
		// 	inset-inline: 0;
		// }
	}
	&.firstColumn > .children:last-child > .main {
		padding-bottom: 0 !important;
		&::before {
			bottom: 0 !important;
		}
		// &::after { content: unset }
	}

	&.max-width_500px {
		:not(.reply) > & {
			.reply {
				--avatarSize: 24px;
				--indent: calc(var(--avatarSize) - 4px);
			}
		}
		&.firstColumn {
			> .main,
			> .line,
			> .children:not(.single) > .line {
				--avatarSize: 35px;
				--indent: 35px;
			}
			> .children:not(.single) {
				padding-left: 28px !important;
			}
		}
	}
	&.max-width_450px {
		padding: 14px 16px;
		&.reply-to,
		&.reply-to-more {
			padding: 14px 16px;
			padding-top: 14px !important;
			padding-bottom: 0 !important;
			margin-bottom: 0 !important;
		}
		> .main > .avatar-container {
			margin-right: 10px;
		}
	}
}
</style>
