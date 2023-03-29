<template>
<div class="wrmlmaau" :class="{ collapsed, isLong }">
	<div class="body">
		<span v-if="note.deletedAt" style="opacity: 0.5">({{ i18n.ts.deleted }})</span>
		<template v-if="!note.cw">
			<MkA v-if="note.replyId"  :to="`/notes/${note.replyId}`" class="reply-icon" @click.stop>
				<i class="ph-arrow-bend-left-up ph-bold ph-lg"></i>
			</MkA>
			<MkA v-if="conversation && note.renoteId && note.renoteId != parentId" :to="`/notes/${note.renoteId}`" class="reply-icon" @click.stop>
				<i class="ph-quotes ph-bold ph-lg"></i>
			</MkA>
		</template>
		<Mfm v-if="note.text" :text="note.text" :author="note.user" :i="$i" :custom-emojis="note.emojis"/>
		<MkA v-if="note.renoteId" class="rp" :to="`/notes/${note.renoteId}`">{{ i18n.ts.quoteAttached }}: ...</MkA>
	</div>
	<div v-if="note.files.length > 0">
		<XMediaList :media-list="note.files"/>
	</div>
	<div v-if="note.poll">
		<summary>{{ i18n.ts.poll }}</summary>
		<XPoll :note="note"/>
	</div>
	<template v-if="detailed">
		<!-- <div v-if="note.renoteId" class="renote">
			<XNoteSimple :note="note.renote"/>
		</div> -->
		<MkUrlPreview v-for="url in urls" :key="url" :url="url" :compact="true" :detail="false" class="url-preview"/>
	</template>
	<button v-if="isLong && collapsed" class="fade _button" @click.stop="collapsed = false">
		<span>{{ i18n.ts.showMore }}</span>
	</button>
	<button v-if="isLong && !collapsed" class="showLess _button" @click.stop="collapsed = true">
		<span>{{ i18n.ts.showLess }}</span>
	</button>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as misskey from 'calckey-js';
import * as mfm from 'mfm-js';
import XNoteSimple from '@/components/MkNoteSimple.vue';
import XMediaList from '@/components/MkMediaList.vue';
import XPoll from '@/components/MkPoll.vue';
import MkUrlPreview from '@/components/MkUrlPreview.vue';
import { extractUrlFromMfm } from '@/scripts/extract-url-from-mfm';
import { i18n } from '@/i18n';

const props = defineProps<{
	note: misskey.entities.Note;
	parentId?;
	conversation?;
	detailed?: boolean;
}>();

const isLong = (
	props.note.cw == null && props.note.text != null && (
		(props.note.text.split('\n').length > 9) ||
		(props.note.text.length > 500)
	)
);
const collapsed = $ref(props.note.cw == null && isLong);
const urls = props.note.text ? extractUrlFromMfm(mfm.parse(props.note.text)) : null;

</script>

<style lang="scss" scoped>
.wrmlmaau {
	overflow-wrap: break-word;
	
	> .body {
		> .rp {
			margin-left: 4px;
			font-style: oblique;
			color: var(--renote);
		}
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
	}

	> .mk-url-preview {
		margin-top: 8px;
	}

	&.collapsed {
		position: relative;
		max-height: 9em;
		overflow: hidden;
		> .body {
			max-height: 9em;
			mask: linear-gradient(black calc(100% - 64px), transparent);
			-webkit-mask: linear-gradient(black calc(100% - 64px), transparent);
		}
		> .fade {
			display: block;
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 64px;

			> span {
				display: inline-block;
				background: var(--panel);
				padding: 6px 10px;
				font-size: 0.8em;
				border-radius: 999px;
				box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
			}

			&:hover {
				> span {
					background: var(--panelHighlight);
				}
			}
		}
	}

	&.isLong {
		> .showLess {
			width: 100%;
			margin-top: 1em;
			position: sticky;
			bottom: 1em;

			> span {
				display: inline-block;
				background: var(--panel);
				padding: 6px 10px;
				font-size: 0.8em;
				border-radius: 999px;
				box-shadow: 0 0 7px 7px var(--bg);
			}
		}
	}
}
</style>
