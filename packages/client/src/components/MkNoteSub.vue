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
			<div v-for="(reply, index) in replies" :key="reply.id" :class="`divider divider-${((depth + offset) % 8)} x-child-${child} x-index-${index} ${index > 0?'divider-next': ''}`">
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

	--swatch-color: 128, 128, 128;
	--swatch-0: 64, 121, 140;  // # 40798c
	--swatch-1: 255, 191, 183; // # ffbfb7
	--swatch-2: 151, 200, 235; // # 97c8eb
	--swatch-3: 255, 214, 102; // # ffd666
	--swatch-4: 155, 119, 158; // # 9b779e
	--swatch-5: 226, 112, 132; // # e27084
	--swatch-6: 194, 234, 189; // # c2eabd
	--swatch-7: 240, 182, 127; // # f0b67f

	.divider-0, .header-0 {
		--swatch-color: var(--swatch-0);
	}
	.divider-1, .header-1 {
		--swatch-color: var(--swatch-1);
	}
	.divider-2, .header-2 {
		--swatch-color: var(--swatch-2);
	}
	.divider-3, .header-3 {
		--swatch-color: var(--swatch-3);
	}
	.divider-4, .header-4 {
		--swatch-color: var(--swatch-4);
	}
	.divider-5, .header-5 {
		--swatch-color: var(--swatch-5);
	}
	.divider-6, .header-6 {
		--swatch-color: var(--swatch-6);
	}
	.divider-7, .header-7 {
		--swatch-color: var(--swatch-7);
	}

	.colorize & .main {

		> .avatar-container {
			border-left: 3px solid var(--swatch-color);
			border-top-left-radius: 5px;
		}
		&.header-solo > .avatar-container {
			border-left-color: transparent;
			border-top-left-radius: 0;
		}
	}

	.colorize & .divider {
		border-bottom-left-radius: 10px;
		&.divider-next {
			border-top-left-radius: 0px;
		}

		.reply, .more {
			border-left-width: 0;
		}
		.divider-over {
				border-left: 3px solid var(--swatch-color);
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
		.divider {
			background-color: var(--panel);

			&:hover {
				background-color: var(--panelHighlight);
			}

			> .divider-over {
				background-image:
				linear-gradient(85deg, rgba(var(--swatch-color), 0.09), transparent 30px),
				linear-gradient(50deg, rgba(var(--swatch-color), 0.18), transparent 150px),
				linear-gradient(1deg, rgba(var(--swatch-color), 0.14), transparent 15px);
			}
		}
	}

	.colorbg & {
		.divider {
			background-color: var(--panel);
			&:hover {
				background-color: var(--panelHighlight);
			}
			> .divider-over {
				background-color: color(var(--swatch-color), 0.18);
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
