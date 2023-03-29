<template>
<div ref="el" 
	v-size="{ max: [450, 500] }"
	class="wrpstxzv"
	:class="{ children: depth > 1, singleStart: replies.length == 1, firstColumn: depth == 1 && conversation }"
>
	<div v-if="conversation && depth > 1" class="line"></div>
	<div class="main" @click="noteClick">
		<div class="avatar-container">
			<MkAvatar class="avatar" :user="note.user"/>
			<div v-if="(!conversation) || replies.length > 0" class="line"></div>
		</div>
		<div class="body">
			<XNoteHeader class="header" :note="note" :mini="true"/>
			<div class="body">
				<p v-if="note.cw != null" class="cw">
					<MkA v-if="note.replyId"  :to="`/notes/${note.replyId}`" class="reply-icon" @click.stop>
						<i class="ph-arrow-bend-left-up ph-bold ph-lg"></i>
					</MkA>
					<MkA v-if="conversation && note.renoteId && note.renoteId != parentId" :to="`/notes/${note.renoteId}`" class="reply-icon" @click.stop>
						<i class="ph-quotes ph-bold ph-lg"></i>
					</MkA>
					<Mfm v-if="note.cw != ''" class="text" :text="note.cw" :author="note.user" :i="$i" :custom-emojis="note.emojis"/>
					<br/>
					<XCwButton v-model="showContent" :note="note"/>
				</p>
				<div v-show="note.cw == null || showContent" class="content">
					<MkSubNoteContent class="text" :note="note" :detailed="true" :parentId="note.parentId" :conversation="conversation"/>
				</div>
				<div v-if="translating || translation" class="translation">
					<MkLoading v-if="translating" mini/>
					<div v-else class="translated">
						<b>{{ i18n.t('translatedFrom', { x: translation.sourceLang }) }}: </b>
						<Mfm :text="translation.text" :author="appearNote.user" :i="$i" :custom-emojis="appearNote.emojis"/>
					</div>
				</div>
			</div>
			<footer class="footer" @click.stop>
				<XReactionsViewer ref="reactionsViewer" :note="appearNote"/>
				<button v-tooltip.noDelay.bottom="i18n.ts.reply" class="button _button" @click="reply()">
					<i class="ph-arrow-u-up-left ph-bold ph-lg"></i>
					<template v-if="appearNote.repliesCount > 0">
						<p class="count">{{ appearNote.repliesCount }}</p>
					</template>
				</button>
				<XRenoteButton ref="renoteButton" class="button" :note="appearNote" :count="appearNote.renoteCount"/>
				<XStarButton v-if="appearNote.myReaction == null" ref="starButton" class="button" :note="appearNote"/>
				<button v-if="appearNote.myReaction == null" ref="reactButton" v-tooltip.noDelay.bottom="i18n.ts.reaction" class="button _button" @click="react()">
					<i class="ph-smiley ph-bold ph-lg"></i>
				</button>
				<button v-if="appearNote.myReaction != null" ref="reactButton" class="button _button reacted" @click="undoReact(appearNote)">
					<i class="ph-minus ph-bold ph-lg"></i>
				</button>
				<XQuoteButton class="button" :note="appearNote"/>
				<button ref="menuButton" v-tooltip.noDelay.bottom="i18n.ts.more" class="button _button" @click="menu()">
					<i class="ph-dots-three-outline ph-bold ph-lg"></i>
				</button>
			</footer>
			<!-- <MkNoteFooter :note="note" :directReplies="replies.length"></MkNoteFooter> -->
		</div>
	</div>
	<template v-if="conversation">
		<template v-if="replies.length == 1">
			<MkNoteSub v-for="reply in replies" :key="reply.id" :note="reply" class="reply single" :conversation="conversation" :depth="depth" :parentId="note.replyId"/>
		</template>
		<template v-else-if="depth < 5">
			<MkNoteSub v-for="reply in replies" :key="reply.id" :note="reply" class="reply" :conversation="conversation" :depth="depth + 1" :parentId="note.replyId"/>
		</template>
		<div v-else-if="replies.length > 0" class="more">
			<div class="line"></div>
			<MkA class="text _link" :to="notePage(note)">{{ i18n.ts.continueThread }} <i class="ph-caret-double-right ph-bold ph-lg"></i></MkA>
		</div>
	</template>
</div>
</template>

<script lang="ts" setup>
import { inject, ref } from 'vue';
import type { Ref } from 'vue';
import * as misskey from 'calckey-js';
import XNoteHeader from '@/components/MkNoteHeader.vue';
import MkSubNoteContent from '@/components/MkSubNoteContent.vue';
import XReactionsViewer from '@/components/MkReactionsViewer.vue';
import XStarButton from '@/components/MkStarButton.vue';
import XRenoteButton from '@/components/MkRenoteButton.vue';
import XQuoteButton from '@/components/MkQuoteButton.vue';
import XCwButton from '@/components/MkCwButton.vue';
import { pleaseLogin } from '@/scripts/please-login';
import { getNoteMenu } from '@/scripts/get-note-menu';
import { notePage } from '@/filters/note';
import { useRouter } from '@/router';
import * as os from '@/os';
<<<<<<< HEAD
import { defaultStore } from '@/store';
=======
import { reactionPicker } from '@/scripts/reaction-picker';
>>>>>>> 6e898249ef76a14993d8869e2156f2ab13780f2f
import { i18n } from '@/i18n';
import { deepClone } from '@/scripts/clone';
import { useNoteCapture } from '@/scripts/use-note-capture';


const router = useRouter();

const props = withDefaults(defineProps<{
	note: misskey.entities.Note;
	conversation?: misskey.entities.Note[];
	parentId?;

	// how many notes are in between this one and the note being viewed in detail
	depth?: number;
	offset?: number;
	child?: number;
}>(), {
	depth: 1,
	offset: 0,
	child: 0,
});

<<<<<<< HEAD
let showContent = $ref(defaultStore.state.autoShowCw);
const repliesDepth = defaultStore.state.repliesDepth;
const replies: misskey.entities.Note[] = props.conversation?.filter(item => item.replyId === props.note.id || item.renoteId === props.note.id) ?? [];
=======
let note = $ref(deepClone(props.note));

const isRenote = (
	note.renote != null &&
	note.text == null &&
	note.fileIds.length === 0 &&
	note.poll == null
);

const el = ref<HTMLElement>();
const menuButton = ref<HTMLElement>();
const starButton = ref<InstanceType<typeof XStarButton>>();
const renoteButton = ref<InstanceType<typeof XRenoteButton>>();
const reactButton = ref<HTMLElement>();
let appearNote = $computed(() => isRenote ? note.renote as misskey.entities.Note : note);
const isDeleted = ref(false);
const translation = ref(null);
const translating = ref(false);
let showContent = $ref(false);
const replies: misskey.entities.Note[] = props.conversation?.filter(item => item.replyId === props.note.id || item.renoteId === props.note.id).reverse() ?? [];

useNoteCapture({
	rootEl: el,
	note: $$(appearNote)
});


function reply(viaKeyboard = false): void {
	pleaseLogin();
	os.post({
		reply: appearNote,
		animation: !viaKeyboard,
	}, () => {
		focus();
	});
}

function react(viaKeyboard = false): void {
	pleaseLogin();
	blur();
	reactionPicker.show(reactButton.value, reaction => {
		os.api('notes/reactions/create', {
			noteId: appearNote.id,
			reaction: reaction,
		});
	}, () => {
		focus();
	});
}

function undoReact(note): void {
	const oldReaction = note.myReaction;
	if (!oldReaction) return;
	os.api('notes/reactions/delete', {
		noteId: note.id,
	});
}

const currentClipPage = inject<Ref<misskey.entities.Clip> | null>('currentClipPage', null);


function menu(viaKeyboard = false): void {
	os.popupMenu(getNoteMenu({ note: note, translating, translation, menuButton, isDeleted, currentClipPage }), menuButton.value, {
		viaKeyboard,
	}).then(focus);
}

function focus() {
	el.value.focus();
}

function blur() {
	el.value.blur();
}

function noteClick(e) {
	if (document.getSelection().type === 'Range') {
		e.stopPropagation();
	} else {
		router.push(notePage(props.note))
	}
}
>>>>>>> 6e898249ef76a14993d8869e2156f2ab13780f2f
</script>

<style lang="scss" scoped>
.wrpstxzv {
	padding: 16px 32px;
<<<<<<< HEAD

=======
>>>>>>> 6e898249ef76a14993d8869e2156f2ab13780f2f
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
		> .header-over {
			display: flex;

<<<<<<< HEAD
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
				@media (pointer: coarse) {
=======
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
					padding: .2em .2em;
					margin-right: .2em;
					color: var(--accent);
					transition: background .2s;
					&:hover, &:focus {
						background: var(--buttonHoverBg);
					}
				}
				> .cw {
>>>>>>> 6e898249ef76a14993d8869e2156f2ab13780f2f
					cursor: default;
				}
				
				> .header {
					margin-bottom: 2px;
					cursor: auto;
				}
<<<<<<< HEAD

				> .body {
					> .cw {
						cursor: default;
						display: block;
=======
				> .content {
					> .text {
>>>>>>> 6e898249ef76a14993d8869e2156f2ab13780f2f
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
					transition: opacity .2s;
					&:first-of-type {
						margin-left: -.5em;
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
<<<<<<< HEAD

	> .divider > .divider-over {
		> .reply, > .more {
			border-left: solid 2px var(--divider);
			margin-top: 10px;
		}
	}

	.compact & {
		.reply, .more {
			padding-left: 3px;
			&.max-width_450px {
				padding-left: 2px;
			}
		}
	}

	--swatch-color: 128, 128, 128;
	--swatch-0: 64, 121, 140;  // # 40798c
	--swatch-1: 255, 191, 183; // # ffbfb7
	--swatch-2: 151, 200, 235; // # 97c8eb
	--swatch-3: 255, 214, 102; // # ffd666
	--swatch-4: 155, 119, 158; // # 9b779e
	--swatch-5: 226, 112, 132; // # e27084
	--swatch-6: 194, 234, 189; // # c2eabd
	--swatch-7: 240, 182, 127; // # f0b67f

	> .divider-0, > .header-0 {
		--swatch-color: var(--swatch-0);
	}
	> .divider-1, > .header-1 {
		--swatch-color: var(--swatch-1);
	}
	> .divider-2, > .header-2 {
		--swatch-color: var(--swatch-2);
	}
	> .divider-3, > .header-3 {
		--swatch-color: var(--swatch-3);
	}
	> .divider-4, > .header-4 {
		--swatch-color: var(--swatch-4);
	}
	> .divider-5, > .header-5 {
		--swatch-color: var(--swatch-5);
	}
	> .divider-6, > .header-6 {
		--swatch-color: var(--swatch-6);
	}
	> .divider-7, > .header-7 {
		--swatch-color: var(--swatch-7);
	}

	.colorize & .main {

		> .header-over > .avatar-container {
			padding-left: 3px;
			border-left: 3px solid rgb(var(--swatch-color));
			border-top: 0.5px solid rgb(var(--swatch-color));
			border-top-left-radius: 10px;
			border-bottom-left-radius: 10px;
		}
	}

	.colorize & .reply.children > .main.header-solo > .header-over > .avatar-container {
		border-top: none;
		border-left: none;
	}

	.colorize & .divider {
		border-bottom-left-radius: 10px;
		&.divider-next {
			border-top-left-radius: 0px;
		}

		.reply, .more {
			border-left-width: 0;
		}
		> .divider-over {
				padding-left: 3px;
				padding-bottom: 3px;
				border-left: 3px solid rgb(var(--swatch-color));
				border-top: 0.5px solid var(--divider);
				border-bottom-left-radius: 10px;
		}
		&.divider-next {
			> .divider-over {
				border-top-left-radius: 0px;
			}
		}
	}

	.colorgrad & {
		.divider, .main:not(.header-solo) {
			background-color: var(--panel);

			&:hover {
				background-color: var(--panelHighlight);
			}
		}
		.divider > .divider-over, > .main > .header-over {
			background-position: bottom left;
			background-image:
				linear-gradient(85deg, rgba(var(--swatch-color), 0.09), transparent 30px),
				linear-gradient(50deg, rgba(var(--swatch-color), 0.18), transparent 150px),
				linear-gradient(1deg, rgba(var(--swatch-color), 0.14), transparent 15px);
		}
		> .main.header-solo > .header-over  {
			background: transparent;
		}
	}

	.colorbg & {
		.divider, .main:not(.header-solo) {
			background-color: var(--panel);
			&:hover {
				background-color: var(--panelHighlight);
			}
		}
		.divider > .divider-over, > .main > .header-over {
			background-color: rgba(var(--swatch-color), 0.18);
		}

		> .main.header-solo > .header-over  {
			background: transparent;
		}
=======
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
	> .reply, > .more {
		margin-top: 10px;
		&.single {
			padding: 0 !important;
			> .line {
				display: none;
			}
		}
>>>>>>> 6e898249ef76a14993d8869e2156f2ab13780f2f
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

	&.reply, &.reply-to, &.reply-to-more {
		> .main:hover, > .main:focus-within {
			:deep(.footer .button) {
				opacity: 1;
			}
		}
	}

	&.reply-to, &.reply-to-more {
		padding-bottom: 0;
		&:first-child {
			padding-top: 30px;
		}
		.line::before {
			margin-bottom: -16px;
		}
	}
	
	// Reply Lines
	&.reply, &.reply-to, &.reply-to-more {
		--indent: calc(var(--avatarSize) - 5px);
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
	&.reply-to, &.reply-to-more {
		> .main > .avatar-container > .line {
			margin-bottom: 0px !important;
		}
	}
	&.single, &.singleStart {
		> .main > .avatar-container > .line {
			margin-bottom: -10px !important;
		}
	}
	.reply.children:not(:last-child) { // Line that goes through multiple replies
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

	&.max-width_500px {
		:not(.reply) > & {
			.reply {
				--avatarSize: 24px;
				--indent: calc(var(--avatarSize) - 4px);
			}
		}
		&.firstColumn {
			> .main, > .line, > .children:not(.single) > .line {
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
		&.reply-to, &.reply-to-more {
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
