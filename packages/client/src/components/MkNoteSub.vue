<template>
<div v-size="{ max: [450] }" class="wrpstxzv" :class="{ children: depth > 1 }">
	<div class="main" :class="`header-${replies.length === 0 ? 'solo' : ((depth + offset) % 8)}`" @click="$log('router pushing from sub main'); router.push(notePage(note))">
		<div class="avatar-container">
			<MkAvatar class="avatar" :user="note.user"/>
			<div class="line"></div>
		</div>
		<div class="body">
			<XNoteHeader class="header" :note="note" :mini="true"/>
			<div class="body">
				<p v-if="note.cw != null" class="cw">
					<Mfm v-if="note.cw != ''" class="text" :text="note.cw" :author="note.user" :i="$i" :custom-emojis="note.emojis"/>
					<XCwButton v-model="showContent" :note="note"/>
				</p>
				<div v-show="note.cw == null || showContent" class="content" @click="$log('router pushing from sub content'); router.push(notePage(note))">
					<MkSubNoteContent class="text" :note="note"/>
				</div>
			</div>
		</div>
	</div>
	<template v-if="conversation">
		<template v-if="depth < repliesDepth">
			<div v-for="(reply, index) in replies" :key="reply.id" :class="`divider divider-${((depth + offset + index) % 8)} x-child-${child} x-index-${index} ${index > 0?'divider-next': ''}`">
				<div :class="`divider-over`">
					<MkNoteSub :note="reply" :class="`reply`" :conversation="conversation" :depth="depth + 1" :offset="offset + index" :child="index"/>
				</div>
			</div>
		</template>
		<div v-else-if="replies.length > 0" :class="more">
			<MkA class="text _link" :to="notePage(note)">{{ i18n.ts.continueThread }} <i class="ph-caret-double-right-bold ph-lg"></i></MkA>
		</div>
	</template>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as misskey from 'calckey-js';
import XNoteHeader from '@/components/MkNoteHeader.vue';
import MkSubNoteContent from '@/components/MkSubNoteContent.vue';
import XCwButton from '@/components/MkCwButton.vue';
import { notePage } from '@/filters/note';
import { useRouter } from '@/router';
import * as os from '@/os';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';

const router = useRouter();

const props = withDefaults(defineProps<{
	note: misskey.entities.Note;
	conversation?: misskey.entities.Note[];

	// how many notes are in between this one and the note being viewed in detail
	depth?: number;
	offset?: number;
	child?: number;
}>(), {
	depth: 1,
	offset: 0,
	child: 0,
});

let showContent = $ref(defaultStore.state.autoShowCw);
const repliesDepth = defaultStore.state.repliesDepth;
const replies: misskey.entities.Note[] = props.conversation?.filter(item => item.replyId === props.note.id || item.renoteId === props.note.id) ?? [];
</script>

<style lang="scss" scoped>
.wrpstxzv {
	padding: 16px 32px;


	&.children {
		padding: 10px 0 0 16px;
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
			@media (pointer: coarse) {
				cursor: default;
			}
			
			> .header {
				margin-bottom: 2px;
				cursor: auto;
			}

			> .body {
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
			}
		}
	}

	> .reply, > .more {
		border-left: solid 0.5px var(--divider);
		margin-top: 10px;
	}

	.compact & {
		.reply, .more {
			padding-left: 3px;
			&.max-width_450px {
				padding-left: 2px;
			}
		}
	}

	.colorize & .main {
		> .avatar-container {
			border-left: 3px solid red;
			border-top-left-radius: 5px;
		}
		&.header-solo > .avatar-container {
			border-left-color: transparent;
			border-top-left-radius: 0;
		}
		&.header-0 > .avatar-container {
			border-left-color: #40798c;
		}
		&.header-1 > .avatar-container {
			border-left-color: #ffbfb7;
		}
		&.header-2 > .avatar-container {
			border-left-color: #97c8eb;
		}
		&.header-3 > .avatar-container {
			border-left-color: #ffd666;
		}
		&.header-4 > .avatar-container {
			border-left-color: #9b779e;
		}
		&.header-5 > .avatar-container {
			border-left-color: #e27084;
		}
		&.header-6 > .avatar-container {
			border-left-color: #c2eabd;
		}
		&.header-7 > .avatar-container {
			border-left-color: #f0b67f;
		}
	}

	.colorize & .divider {

		border-bottom-left-radius: 10px;
		&.divider-next {
			border-top-left-radius: 10px;
		}

		.reply, .more {
			border-left-width: 0;
		}
		.divider-over {
				border-left: 3px solid var(--divider);
				border-top: 0.5px solid var(--divider);
				border-bottom-left-radius: 10px;
		}
		&.divider-next {
			> .divider-over {
				border-top-left-radius: 10px;
			}
		}

		&.divider-0 > .divider-over {
				border-left-color: #40798c;
		}
		&.divider-1 > .divider-over {
				border-left-color: #ffbfb7;
		}
		&.divider-2 > .divider-over {
				border-left-color: #97c8eb;
		}
		&.divider-3 > .divider-over{
				border-left-color: #ffd666;
		}
		&.divider-4 > .divider-over {
				border-left-color: #9b779e;
		}
		&.divider-5 > .divider-over {
				border-left-color: #e27084;
		}
		&.divider-6 > .divider-over {
				border-left-color: #c2eabd;
		}
		&.divider-7 > .divider-over {
				border-left-color: #f0b67f;
		}
	}

	.colorgrad & {
		.divider {
			background-color: var(--panel);
			&:hover {
				background-color: var(--panelHighlight);
			}
			&.divider-0 > .divider-over {
				background-image: linear-gradient(to right, #40798c30, transparent 5%);
			}
			&.divider-1 > .divider-over {
				background-image: linear-gradient(to right, #ffbfb730, transparent 5%);
			}
			&.divider-2 > .divider-over {
				background-image: linear-gradient(to right, #97c8eb30, transparent 5%);
			}
			&.divider-3 > .divider-over{
				background-image: linear-gradient(to right, #ffd66630, transparent 5%);
			}
			&.divider-4 > .divider-over {
				background-image: linear-gradient(to right, #9b779e30, transparent 5%);
			}
			&.divider-5 > .divider-over {
				background-image: linear-gradient(to right, #e2708430, transparent 5%);
			}
			&.divider-6 > .divider-over {
				background-image: linear-gradient(to right, #c2eabd30, transparent 5%);
			}
			&.divider-7 > .divider-over {
				background-image: linear-gradient(to right, #f0b67f30, transparent 5%);
			}
		}
	}

	.colorbg & {
		.divider {
			background-color: var(--panel);
			&:hover {
				background-color: var(--panelHighlight);
			}
			&.divider-0 > .divider-over {
				background-color: #40798c30;
			}
			&.divider-1 > .divider-over {
				background-color: #ffbfb730;
			}
			&.divider-2 > .divider-over {
				background-color: #97c8eb30;
			}
			&.divider-3 > .divider-over{
				background-color: #ffd66630;
			}
			&.divider-4 > .divider-over {
				background-color: #9b779e30;
			}
			&.divider-5 > .divider-over {
				background-color: #e2708430;
			}
			&.divider-6 > .divider-over {
				background-color: #c2eabd30;
			}
			&.divider-7 > .divider-over {
				background-color: #f0b67f30;
			}
		}
	}

	> .more {
		padding: 10px 0 0 16px;
	}

	&.reply-to, &.reply-to-more {
		padding-bottom: 0;
		&:first-child {
			padding-top: 30px;
		}
		.avatar-container {
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
			> .line {
				width: var(--avatarSize);
				display: flex;
				flex-grow: 1;
				&::before {
					content: "";
					display: block;
					width: 2px;
					background-color: var(--divider);
					margin-inline: auto;
					.note > & {
						margin-bottom: -16px;
					}
				}
			}
		}
		> .main > .body {
			padding-bottom: 16px;
		}
	}

	&.max-width_450px {
		padding: 14px 16px;
		&.reply-to, &.reply-to-more {
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
