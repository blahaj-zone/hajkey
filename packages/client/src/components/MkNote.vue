<template>
<div
	v-if="!muted"
	v-show="!isDeleted"
	ref="el"
	v-hotkey="keymap"
	v-size="{ max: [500, 450, 350, 300] }"
	class="tkcbzcuz"
	:tabindex="!isDeleted ? '-1' : null"
	:class="{ renote: isRenote }"
>
	<MkNoteSub v-if="appearNote.reply" :note="appearNote.reply" class="reply-to"/>
	<div class="note-context">
		<div class="line"></div>
		<div v-if="appearNote._prId_" class="info"><i class="ph-megaphone-simple-bold ph-lg"></i> {{ i18n.ts.promotion }}<button class="_textButton hide" @click="readPromo()">{{ i18n.ts.hideThisNote }} <i class="ph-x ph-bold ph-lg"></i></button></div>
		<div v-if="appearNote._featuredId_" class="info"><i class="ph-lightning ph-bold ph-lg"></i> {{ i18n.ts.featured }}</div>
		<div v-if="pinned" class="info"><i class="ph-push-pin ph-bold ph-lg"></i>{{ i18n.ts.pinnedNote }}</div>
		<div v-if="isRenote" class="renote">
			<i class="ph-repeat ph-bold ph-lg"></i>
			<I18n :src="i18n.ts.renotedBy" tag="span">
				<template #user>
					<MkA v-user-preview="note.userId" class="name" :to="userPage(note.user)">
						<MkUserName :user="note.user"/>
					</MkA>
				</template>
			</I18n>
			<div class="info">
				<button ref="renoteTime" class="_button time" @click.stop="showRenoteMenu()">
					<i v-if="isMyRenote" class="ph-dots-three-outline ph-bold ph-lg dropdownIcon"></i>
					<MkTime :time="note.createdAt"/>
				</button>
				<MkVisibility :note="note"/>
			</div>
		</div>
	</div>
	<article class="article" @contextmenu.stop="onContextmenu" @click="noteClick">
		<div class="main">
			<div class="header-container">
				<MkAvatar class="avatar" :user="appearNote.user"/>
				<XNoteHeader class="header" :note="appearNote" :mini="true"/>
			</div>
			<div class="body">
				<p v-if="appearNote.cw != null" class="cw">
					<Mfm v-if="appearNote.cw != ''" class="text" :text="appearNote.cw" :author="appearNote.user" :custom-emojis="appearNote.emojis" :i="$i"/>
					<br/>
					<XCwButton v-model="showContent" :note="appearNote"/>
				</p>
				<div v-show="appearNote.cw == null || showContent" class="content" :class="{ collapsed, isLong }">
					<div class="text">
						<Mfm v-if="appearNote.text" :text="appearNote.text" :author="appearNote.user" :i="$i" :custom-emojis="appearNote.emojis"/>
						<!-- <a v-if="appearNote.renote != null" class="rp">RN:</a> -->
						<div v-if="translating || translation" class="translation">
							<MkLoading v-if="translating" mini/>
							<div v-else class="translated">
								<b>{{ i18n.t('translatedFrom', { x: translation.sourceLang }) }}: </b>
								<Mfm :text="translation.text" :author="appearNote.user" :i="$i" :custom-emojis="appearNote.emojis"/>
							</div>
						</div>
					</div>
					<div v-if="appearNote.files.length > 0" class="files">
						<XMediaList :media-list="appearNote.files"/>
					</div>
					<XPoll v-if="appearNote.poll" ref="pollViewer" :note="appearNote" class="poll"/>
					<MkUrlPreview v-for="url in urls" :key="url" :url="url" :compact="true" :detail="false" class="url-preview"/>
					<div v-if="appearNote.renote" class="renote"><XNoteSimple :note="appearNote.renote" @click.stop="router.push(notePage(appearNote.renote))"/></div>
					<button v-if="isLong && collapsed" class="fade _button" @click.stop="collapsed = false">
						<span>{{ i18n.ts.showMore }}</span>
					</button>
					<button v-else-if="isLong && !collapsed" class="showLess _button" @click.stop="collapsed = true">
						<span>{{ i18n.ts.showLess }}</span>
					</button>
				</div>
				<MkA v-if="appearNote.channel && !inChannel" class="channel" :to="`/channels/${appearNote.channel.id}`" @click.stop><i class="ph-television ph-bold ph-lg"></i> {{ appearNote.channel.name }}</MkA>
			</div>
			<footer ref="el" class="footer" @click.stop>
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
			<!-- <MkNoteFooter :note="appearNote"></MkNoteFooter> -->
		</div>
	</article>
</div>
<div v-else class="muted" @click="muted = false">
	<I18n :src="i18n.ts.userSaysSomething" tag="small">
		<template #name>
			<MkA v-user-preview="appearNote.userId" class="name" :to="userPage(appearNote.user)">
				<MkUserName :user="appearNote.user"/>
			</MkA>
		</template>
	</I18n>
</div>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, onUnmounted, reactive, ref } from 'vue';
import * as mfm from 'mfm-js';
import type { Ref } from 'vue';
import type * as misskey from 'calckey-js';
import MkNoteSub from '@/components/MkNoteSub.vue';
import XNoteHeader from '@/components/MkNoteHeader.vue';
import XNoteSimple from '@/components/MkNoteSimple.vue';
import XMediaList from '@/components/MkMediaList.vue';
import XCwButton from '@/components/MkCwButton.vue';
import XPoll from '@/components/MkPoll.vue';
import XRenoteButton from '@/components/MkRenoteButton.vue';
import XReactionsViewer from '@/components/MkReactionsViewer.vue';
import XStarButton from '@/components/MkStarButton.vue';
import XQuoteButton from '@/components/MkQuoteButton.vue';
import MkUrlPreview from '@/components/MkUrlPreview.vue';
import MkVisibility from '@/components/MkVisibility.vue';
import { pleaseLogin } from '@/scripts/please-login';
import { focusPrev, focusNext } from '@/scripts/focus';
import { checkWordMute } from '@/scripts/check-word-mute';
import { useRouter } from '@/router';
import { userPage } from '@/filters/user';
import * as os from '@/os';
import { defaultStore, noteViewInterruptors } from '@/store';
import { reactionPicker } from '@/scripts/reaction-picker';
import { extractUrlFromMfm } from '@/scripts/extract-url-from-mfm';
import { $i } from '@/account';
import { i18n } from '@/i18n';
import { getNoteMenu } from '@/scripts/get-note-menu';
import { useNoteCapture } from '@/scripts/use-note-capture';
import { notePage } from '@/filters/note';
import { deepClone } from '@/scripts/clone';

const router = useRouter();

const props = defineProps<{
	note: misskey.entities.Note;
	pinned?: boolean;
}>();

const inChannel = inject('inChannel', null);

let note = $ref(deepClone(props.note));

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
const renoteTime = ref<HTMLElement>();
const reactButton = ref<HTMLElement>();
let appearNote = $computed(() => isRenote ? note.renote as misskey.entities.Note : note);
const isMyRenote = $i && ($i.id === note.userId);
const showContent = ref(false);
const isLong = (appearNote.cw == null && appearNote.text != null && (
	(appearNote.text.split('\n').length > 9) ||
	(appearNote.text.length > 500)
));
const collapsed = ref(appearNote.cw == null && isLong);
const isDeleted = ref(false);
const muted = ref(checkWordMute(appearNote, $i, defaultStore.state.mutedWords));
const translation = ref(null);
const translating = ref(false);
const urls = appearNote.text ? extractUrlFromMfm(mfm.parse(appearNote.text)).slice(0, 5) : null;

const keymap = {
	'r': () => reply(true),
	'e|a|plus': () => react(true),
	'q': () => renoteButton.value.renote(true),
	'up|k|shift+tab': focusBefore,
	'down|j|tab': focusAfter,
	'esc': blur,
	'm|o': () => menu(true),
	's': () => showContent.value !== showContent.value,
};

useNoteCapture({
	rootEl: el,
	note: $$(appearNote),
	isDeletedRef: isDeleted,
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

function onContextmenu(ev: MouseEvent): void {
	const isLink = (el: HTMLElement) => {
		if (el.tagName === 'A') return true;
		if (el.parentElement) {
			return isLink(el.parentElement);
		}
	};
	if (isLink(ev.target)) return;
	if (window.getSelection().toString() !== '') return;

	if (defaultStore.state.useReactionPickerForContextMenu) {
		ev.preventDefault();
		react();
	} else {
		os.contextMenu(getNoteMenu({ note: note, translating, translation, menuButton, isDeleted, currentClipPage }), ev).then(focus);
	}
}

function menu(viaKeyboard = false): void {
	os.popupMenu(getNoteMenu({ note: note, translating, translation, menuButton, isDeleted, currentClipPage }), menuButton.value, {
		viaKeyboard,
	}).then(focus);
}

function showRenoteMenu(viaKeyboard = false): void {
	if (!isMyRenote) return;
	os.popupMenu([{
		text: i18n.ts.unrenote,
		icon: 'ph-trash ph-bold ph-lg',
		danger: true,
		action: () => {
			os.api('notes/delete', {
				noteId: note.id,
			});
			isDeleted.value = true;
		},
	}], renoteTime.value, {
		viaKeyboard: viaKeyboard,
	});
}

function focus() {
	el.value.focus();
}

function blur() {
	el.value.blur();
}

function focusBefore() {
	focusPrev(el.value);
}

function focusAfter() {
	focusNext(el.value);
}

function noteClick(e) {
	if (document.getSelection().type === 'Range') {
		e.stopPropagation();
	} else {
		router.push(notePage(appearNote))
	}
}

function readPromo() {
	os.api('promo/read', {
		noteId: appearNote.id,
	});
	isDeleted.value = true;
}
</script>

<style lang="scss" scoped>
.tkcbzcuz {
	position: relative;
	transition: box-shadow 0.1s ease;
	font-size: 1.05em;
	overflow: clip;
	contain: content;

	// これらの指定はパフォーマンス向上には有効だが、ノートの高さは一定でないため、
	// 下の方までスクロールすると上のノートの高さがここで決め打ちされたものに変化し、表示しているノートの位置が変わってしまう
	// ノートがマウントされたときに自身の高さを取得し contain-intrinsic-size を設定しなおせばほぼ解決できそうだが、
	// 今度はその処理自体がパフォーマンス低下の原因にならないか懸念される。また、被リアクションでも高さは変化するため、やはり多少のズレは生じる
	// 一度レンダリングされた要素はブラウザがよしなにサイズを覚えておいてくれるような実装になるまで待った方が良さそう(なるのか？)
	//content-visibility: auto;
  //contain-intrinsic-size: 0 128px;

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

	& > .article > .main {
		&:hover, &:focus-within {
			:deep(.footer .button) {
				opacity: 1;
			}
		}
	}
	
	> .reply-to {
		& + .note-context {
			.line::before {
				content: "";
				display: block;
				margin-bottom: -10px;
				margin-top: 16px;
				border-left: 2px solid var(--divider);
				margin-left: calc((var(--avatarSize) / 2) - 1px);
			}
		}
	}

	.note-context {
		padding: 0 32px 0 32px;
		display: flex;
		&:first-child {
			margin-top: 20px;
		}
		> :not(.line) {
			width: 0;
			flex-grow: 1;
			position: relative;
			margin-bottom: -10px;
			line-height: 28px;
		}
		> .line {
			width: var(--avatarSize);
			display: flex;
			margin-right: 14px;
			margin-top: 0;
			flex-grow: 0;
		}
		
		> div > i {
			margin-left: -.5px;
		}
		> .info {
			display: flex;
			align-items: center;
			font-size: 90%;
			white-space: pre;
			color: #f6c177;

			> i {
				margin-right: 4px;
			}

			> .hide {
				margin-left: auto;
				color: inherit;
			}
		}


		> .renote {
			display: flex;
			align-items: center;
			white-space: pre;
			color: var(--renote);

			
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
				display: flex;

				> .time {
					flex-shrink: 0;
					color: inherit;
					display: inline-flex;
					align-items: center;
					> .dropdownIcon {
						margin-right: 4px;
					}
				}
			}
		}

		& + .article {
			padding-top: 10px !important;
		}

	}

	> .article {
		padding: 28px 32px 16px;
		cursor: pointer;

		@media (pointer: coarse) {
			cursor: default;
		}

		.header-container {
			display: flex;
			> .avatar {
				flex-shrink: 0;
				display: block;
				margin: 0 14px 0 0;
				width: var(--avatarSize);
				height: var(--avatarSize);
				position: relative;
				top: 0;
				left: 0;
			}
			> .header {
				width: 0;
				flex-grow: 1;
			}
		}
		> .main {
			flex: 1;
			min-width: 0;

			> .body {
				margin-top: .7em;

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
					&.isLong {
						> .showLess {
							width: 100%;
							margin-top: 1em;
							position: sticky;
							bottom: 1em;

							> span {
								display: inline-block;
								background: var(--popup);
								padding: 6px 10px;
								font-size: 0.8em;
								border-radius: 999px;
								box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
							}
						}
					}

					&.collapsed {
						position: relative;
						max-height: 9em;
						overflow: hidden;
						> .text {
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

					> .text {
						overflow-wrap: break-word;

						> .reply {
							color: var(--accent);
							margin-right: 0.5em;
						}

						> .rp {
							margin-left: 4px;
							font-style: oblique;
							color: var(--renote);
						}

						> .translation {
							border: solid 0.5px var(--divider);
							border-radius: var(--radius);
							padding: 12px;
							margin-top: 8px;
						}
					}

					> .files {
						margin-top: .4em;
						margin-bottom: .4em;
					}
					> .url-preview {
						margin-top: 8px;
					}

					> .poll {
						font-size: 80%;
					}

					> .renote {
						padding: 8px 0;

						> * {
							padding: 16px;
							border: solid 1px var(--renote);
							border-radius: 8px;
							transition: background .2s;
							&:hover, &:focus-within {
								background-color: var(--panelHighlight);
							}
						}
					}
				}

				> .channel {
					opacity: 0.7;
					font-size: 80%;
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
	

	> .reply {
		border-top: solid 0.5px var(--divider);
	}

	&.max-width_500px {
		font-size: 0.9em;
	}

	&.max-width_450px {
		--avatarSize: 46px;
		padding-top: 6px;
		> .note-context {
			padding-inline: 16px;
			margin-top: 0;
			> :not(.line) {
				margin-top: 5px;
			}
			> .line {
				margin-right: 10px;
			}
		}
		> .article {
			padding: 16px 16px 9px;

			> .main > .header-container > .avatar {
				margin-right: 10px;
				// top: calc(14px + var(--stickyTop, 0px));
			}
		}
	}



	&.max-width_300px {
		--avatarSize: 40px;
	}
}

.muted {
	padding: 8px;
	text-align: center;
	opacity: 0.7;
}
</style>
