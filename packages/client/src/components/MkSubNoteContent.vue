<template>
	<div class="wrmlmaau" :class="{ collapsed, isLong }">
		<div class="body">
			<span v-if="note.deletedAt" style="opacity: 0.5"
				>({{ i18n.ts.deleted }})</span
			>
			<template v-if="!note.cw">
				<MkA
					v-if="note.replyId"
					:to="`/notes/${note.replyId}`"
					class="reply-icon"
					@click.stop
				>
					<i class="ph-arrow-bend-left-up ph-bold ph-lg"></i>
				</MkA>
				<MkA
					v-if="
						conversation &&
						note.renoteId &&
						note.renoteId != parentId &&
						!note.replyId
					"
					:to="`/notes/${note.renoteId}`"
					class="reply-icon"
					@click.stop
				>
					<i class="ph-quotes ph-bold ph-lg"></i>
				</MkA>
			</template>
			<Mfm
				v-if="note.text"
				:text="note.text"
				:author="note.user"
				:i="$i"
				:custom-emojis="note.emojis"
			/>
			<MkA v-if="note.renoteId" class="rp" :to="`/notes/${note.renoteId}`"
				>{{ i18n.ts.quoteAttached }}: ...</MkA
			>
		</div>
		<div v-if="note.files.length > 0">
			<XMediaList :media-list="note.files" />
		</div>
		<div v-if="note.poll">
			<summary>{{ i18n.ts.poll }}</summary>
			<XPoll :note="note" />
		</div>
		<template v-if="detailed">
			<!-- <div v-if="note.renoteId" class="renote">
			<XNoteSimple :note="note.renote"/>
		</div> -->
			<MkUrlPreview
				v-for="url in urls"
				:key="url"
				:url="url"
				:compact="true"
				:detail="false"
				class="url-preview"
			/>
		</template>
		<button
			v-if="isLong && collapsed"
			class="fade _button"
			@click.stop="collapsed = false"
		>
			<span>{{ i18n.ts.showMore }}</span>
		</button>
		<button
			v-if="isLong && !collapsed"
			class="showLess _button"
			@click.stop="collapsed = true"
		>
			<span>{{ i18n.ts.showLess }}</span>
		</button>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import * as misskey from "calckey-js";
import * as mfm from "mfm-js";
import XNoteSimple from "@/components/MkNoteSimple.vue";
import XMediaList from "@/components/MkMediaList.vue";
import XPoll from "@/components/MkPoll.vue";
import MkUrlPreview from "@/components/MkUrlPreview.vue";
import { extractUrlFromMfm } from "@/scripts/extract-url-from-mfm";
import { i18n } from "@/i18n";
import { deviceKind } from "@/scripts/device-kind";
import { defaultStore } from "@/store";

const props = defineProps<{
	note: misskey.entities.Note;
	parentId?;
	conversation?;
	detailed?: boolean;
}>();

const note = props.note;

const isRenote =
	note.renote != null &&
	note.text == null &&
	note.fileIds.length === 0 &&
	note.poll == null;

let appearNote = $computed(() =>
	isRenote ? (note.renote as misskey.entities.Note) : note
);

const MOBILE_THRESHOLD = 500;
const isMobile = ref(
	deviceKind === "smartphone" || window.innerWidth <= MOBILE_THRESHOLD
);
const exceedsCharacterLimit =
	defaultStore.state.expandPostMaxCharacters > 0 &&
	appearNote.text != null &&
	appearNote.text.length > defaultStore.state.expandPostMaxCharacters;
const estimatedLines =
	appearNote.text != null
		? appearNote.text
				.split("\n")
				.map((line) =>
					Math.ceil(line.length / (isMobile.value ? 40 : 90))
				)
				.reduce((a, b) => a + b, 0)
		: 1;
const exceedsLinesLimit =
	defaultStore.state.expandPostMaxLines > 0 &&
	estimatedLines > defaultStore.state.expandPostMaxLines;

const isLong =
	appearNote.cw == null &&
	appearNote.text != null &&
	(exceedsCharacterLimit || exceedsLinesLimit);
const collapsed = ref(
	appearNote.cw == null && isLong && !defaultStore.state.expandPostAlways
);
const urls = props.note.text
	? extractUrlFromMfm(mfm.parse(props.note.text))
	: null;
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
			padding: 0.2em 0.2em;
			margin-right: 0.2em;
			color: var(--accent);
			transition: background 0.2s;
			&:hover,
			&:focus {
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
			bottom: var(--stickyBottom);

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
