<template>
	<div
		:class="{
			hasCw: !!cw,
			cwHighlight,
			isRenoteCw,
		}"
	>
		<p v-if="cw" class="cw">
			<MkA
				v-if="!detailed && appearNote.replyId"
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

			<span v-if="isRenoteCw" class="note-warning boost-warning"
				><i class="bw-icon ph-fill ph-cloud-warning ph-lg"></i
				><span class="moniker">{{ i18n.ts.boostWarningShort }}:</span>
			</span>

			<span v-else-if="cw" class="note-warning content-warning"
				><i class="cw-icon ph-fill ph-shield-warning ph-lg"></i
				><span class="moniker">{{ i18n.ts.contentWarningShort }}:</span>
			</span>

			<Mfm
				v-if="cw"
				class="text"
				:text="cw"
				:author="appearNote.user"
				:i="$i"
				:custom-emojis="appearNote.emojis"
			/>
		</p>
		<div class="wrmlmaau">
			<div
				class="content"
				:class="{
					collapsed,
					isLong,
					showContent: cw && !showContent,
				}"
			>
				<div class="body">
					<span v-if="appearNote.deletedAt" style="opacity: 0.5"
						>({{ i18n.ts.deleted }})</span
					>
					<template v-if="!cw">
						<MkA
							v-if="!detailed && appearNote.replyId"
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
					</template>
					<Mfm
						v-if="appearNote.text"
						:text="appearNote.text"
						:author="appearNote.user"
						:i="$i"
						:custom-emojis="appearNote.emojis"
					/>
					<MkA
						v-if="!detailed && appearNote.renoteId"
						class="rp"
						:to="`/notes/${appearNote.renoteId}`"
						>{{ i18n.ts.quoteAttached }}: ...</MkA
					>
					<div
						v-if="appearNote.files.length > 0 && displayMedia"
						class="files"
					>
						<XMediaList :media-list="appearNote.files" />
					</div>
					<XPoll
						v-if="appearNote.poll"
						:note="appearNote"
						class="poll"
					/>
					<template v-if="detailed && displayPreviews">
						<MkUrlPreview
							v-for="url in urls"
							:key="url"
							:url="url"
							:compact="true"
							:detail="false"
							class="url-preview"
						/>
						<div
							v-if="appearNote.renote"
							class="renote"
							@click.stop="emit('push', appearNote.renote)"
						>
							<XNoteSimple :note="appearNote.renote" />
						</div>
					</template>
				</div>
				<button
					v-if="isLong && collapsed"
					class="fade _button"
					@click.stop="collapsed = false"
					v-on:keydown="focusFooter"
				>
					<span>{{ i18n.ts.showMore }}</span>
				</button>
				<button
					v-if="isLong && !collapsed"
					class="showLess _button"
					@click.stop="collapsed = true"
					v-on:keydown="focusFooter"
				>
					<span>{{ i18n.ts.showLess }}</span>
				</button>
				<XCwButton v-if="cw" v-model="showContent" :note="appearNote" />
			</div>
		</div>
		<MkButton
			v-if="hasMfm && defaultStore.state.animatedMfm"
			@click.stop="toggleMfm"
			:mini="true"
		>
			<template v-if="disableMfm">
				<i class="ph-play ph-bold"></i> {{ i18n.ts._mfm.play }}
			</template>
			<template v-else>
				<i class="ph-stop ph-bold"></i> {{ i18n.ts._mfm.stop }}
			</template>
		</MkButton>
	</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import * as misskey from "calckey-js";
import * as mfm from "mfm-js";
import * as os from "@/os";
import XNoteSimple from "@/components/MkNoteSimple.vue";
import XMediaList from "@/components/MkMediaList.vue";
import XPoll from "@/components/MkPoll.vue";
import MkUrlPreview from "@/components/MkUrlPreview.vue";
import XCwButton from "@/components/MkCwButton.vue";
import MkButton from "@/components/MkButton.vue";
import { extractUrlFromMfm } from "@/scripts/extract-url-from-mfm";
import { extractMfmWithAnimation } from "@/scripts/extract-mfm";
import { i18n } from "@/i18n";
import { deviceKind } from "@/scripts/device-kind";
import { defaultStore } from "@/store";

const props = defineProps<{
	note: misskey.entities.Note;
	parentId?;
	conversation?;
	detailed?: boolean;
	detailedView?: boolean;
}>();

const emit = defineEmits<{
	(ev: "push", v): void;
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
let cw = $computed(() => appearNote.cw || note.cw);
const cwHighlight = defaultStore.state.highlightCw;
const isRenoteCw = $computed(() => isRenote && !appearNote.cw && note.cw);

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
	!props.detailedView &&
	!cw &&
	appearNote.text != null &&
	(exceedsCharacterLimit || exceedsLinesLimit);
const collapsed = ref(!cw && isLong && !defaultStore.state.expandPostAlways);
const urls = props.note.text
	? extractUrlFromMfm(mfm.parse(props.note.text)).slice(0, 5)
	: null;

const showContent = ref(defaultStore.state.autoShowCw);

const displayPreviews = props.detailedView
	? true
	: defaultStore.reactiveState.filterDisplayPreviews;
const displayMedia = props.detailedView
	? true
	: defaultStore.reactiveState.filterDisplayMedia;

const mfms = props.note.text
	? extractMfmWithAnimation(mfm.parse(props.note.text))
	: null;

const hasMfm = $ref(mfms && mfms.length > 0);

let disableMfm = $ref(hasMfm && defaultStore.state.animatedMfm);

async function toggleMfm() {
	if (disableMfm) {
		if (!defaultStore.state.animatedMfmWarnShown) {
			const { canceled } = await os.confirm({
				type: "warning",
				text: i18n.ts._mfm.warn,
			});
			if (canceled) return;

			defaultStore.set("animatedMfmWarnShown", true);
		}

		disableMfm = false;
	} else {
		disableMfm = true;
	}
}

function focusFooter(ev) {
	if (ev.key == "Tab" && !ev.getModifierState("Shift")) {
		emit("focusfooter", null);
	}
}
</script>

<style lang="scss" scoped>
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
.cw {
	cursor: default;
	display: block;
	margin: 0;
	padding: 0;
	margin-bottom: 10px;
	overflow-wrap: break-word;

	> .text {
		margin-right: 8px;
		padding-inline-start: 0.25em;
		font-weight: 900;
	}

	.note-warning {
		> .moniker {
			font-weight: 900;
		}
	}
}

.cwHighlight.hasCw {
	outline: 1px dotted var(--fg);
	border-radius: 5px;

	> .wrmlmaau {
		padding-inline-start: 0.25em;
	}

	> .cw {
		background-color: var(--fg);
		color: var(--bg);
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;

		> .reply-icon,
		> .cw-icon {
			padding-inline-start: 0.25em;
			color: var(--bg);
		}
	}

	&.isRenoteCw {
		outline-color: var(--accent);
		> .cw {
			background-color: var(--accent);
		}
	}
}

.wrmlmaau {
	.content {
		overflow-wrap: break-word;
		> .body {
			transition: filter 0.1s;
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
			> .files {
				margin-top: 0.4em;
				margin-bottom: 0.4em;
			}
			> .url-preview {
				margin-top: 8px;
			}

			> .poll {
				font-size: 80%;
			}

			> .renote {
				padding-top: 8px;
				> * {
					padding: 16px;
					border: solid 1px var(--renote);
					border-radius: 8px;
					transition: background 0.2s;
					&:hover,
					&:focus-within {
						background-color: var(--panelHighlight);
					}
				}
			}
		}

		&.collapsed,
		&.showContent {
			position: relative;
			max-height: calc(9em + 50px);
			> .body {
				max-height: inherit;
				mask: linear-gradient(black calc(100% - 64px), transparent);
				-webkit-mask: linear-gradient(
					black calc(100% - 64px),
					transparent
				);
				padding-inline: 50px;
				margin-inline: -50px;
				margin-top: -50px;
				padding-top: 50px;
				overflow: hidden;
			}
			&.collapsed > .body {
				box-sizing: border-box;
			}
			&.showContent {
				> .body {
					min-height: 2em;
					max-height: 5em;
					filter: blur(4px);
					:deep(span) {
						animation: none !important;
						transform: none !important;
					}
					:deep(img) {
						filter: blur(12px);
					}
				}
				:deep(.fade) {
					inset: 0;
					top: 40px;
				}
			}

			:deep(.fade) {
				display: block;
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				> span {
					display: inline-block;
					background: var(--panel);
					padding: 0.4em 1em;
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

		:deep(.showLess) {
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

		&.disableAnim :deep(span) {
			animation: none !important;
		}
	}
	> :deep(button) {
		margin-top: 10px;
		margin-left: 0;
		margin-right: 0.4rem;
	}
}
</style>
