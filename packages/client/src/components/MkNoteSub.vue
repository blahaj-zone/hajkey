<template>
<div v-size="{ max: [450] }" class="wrpstxzv" :class="{ children: depth > 1 }">
	<div class="main" @click="router.push(notePage(note))">
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
				<div v-show="note.cw == null || showContent" class="content" @click="router.push(notePage(note))">
					<MkSubNoteContent class="text" :note="note"/>
				</div>
			</div>
		</div>
	</div>
	<template v-if="conversation">
		<template v-if="depth < 5">
			<MkNoteSub v-for="reply in replies" :key="reply.id" :note="reply" class="reply" :conversation="conversation" :depth="depth + 1"/>
		</template>
		<div v-else-if="replies.length > 0" class="more">
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
import { i18n } from '@/i18n';

const router = useRouter();

const props = withDefaults(defineProps<{
	note: misskey.entities.Note;
	conversation?: misskey.entities.Note[];

	// how many notes are in between this one and the note being viewed in detail
	depth?: number;
}>(), {
	depth: 1,
});

let showContent = $ref(false);
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
