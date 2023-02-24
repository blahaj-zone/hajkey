import { computed, ref, reactive } from "vue";
import { $i } from "./account";
import { search } from "@/scripts/search";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { ui } from "@/config";
import { unisonReload } from "@/scripts/unison-reload";
import { defaultStore } from '@/store';
import { instance } from '@/instance';
import { host } from '@/config';
import XTutorial from '@/components/MkTutorialDialog.vue';

export const navbarItemDef = reactive({
	notifications: {
		title: "notifications",
		icon: "ph-bell-bold ph-lg",
		show: computed(() => $i != null),
		indicated: computed(() => $i?.hasUnreadNotification),
		to: "/my/notifications",
	},
	messaging: {
		title: "messaging",
		icon: "ph-chats-teardrop-bold ph-lg",
		show: computed(() => $i != null),
		indicated: computed(() => $i?.hasUnreadMessagingMessage),
		to: "/my/messaging",
	},
	drive: {
		title: "drive",
		icon: "ph-cloud-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/drive",
	},
	followRequests: {
		title: "followRequests",
		icon: "ph-hand-waving-bold ph-lg",
		show: computed(() => $i?.isLocked),
		indicated: computed(() => $i?.hasPendingReceivedFollowRequest),
		to: "/my/follow-requests",
	},
	explore: {
		title: "explore",
		icon: "ph-compass-bold ph-lg",
		to: "/explore",
	},
	announcements: {
		title: "announcements",
		icon: "ph-megaphone-simple-bold ph-lg",
		indicated: computed(() => $i?.hasUnreadAnnouncement),
		to: "/announcements",
	},
	search: {
		title: "search",
		icon: "ph-magnifying-glass-bold ph-lg",
		action: () => search(),
	},
	lists: {
		title: "lists",
		icon: "ph-list-bullets-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/lists",
	},
	/*
	groups: {
		title: 'groups',
		icon: 'ph-users-three-bold ph-lg',
		show: computed(() => $i != null),
		to: '/my/groups',
	},
	*/
	antennas: {
		title: "antennas",
		icon: "ph-flying-saucer-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/antennas",
	},
	favorites: {
		title: "favorites",
		icon: "ph-bookmark-simple-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/favorites",
	},
	pages: {
		title: "pages",
		icon: "ph-file-text-bold ph-lg",
		to: "/pages",
	},
	gallery: {
		title: "gallery",
		icon: "ph-image-square-bold ph-lg",
		to: "/gallery",
	},
	clips: {
		title: "clip",
		icon: "ph-paperclip-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/clips",
	},
	channels: {
		title: "channel",
		icon: "ph-television-bold ph-lg",
		to: "/channels",
	},
	groups: {
		title: "groups",
		icon: "ph-users-three-bold ph-lg",
		to: "/my/groups",
	},
	ui: {
		title: "switchUi",
		icon: "ph-layout-bold ph-lg",
		action: (ev) => {
			os.popupMenu(
				[
					{
						text: i18n.ts.default,
						active: ui === "default" || ui === null,
						action: () => {
							localStorage.setItem("ui", "default");
							unisonReload();
						},
					},
					{
						text: i18n.ts.deck,
						active: ui === "deck",
						action: () => {
							localStorage.setItem("ui", "deck");
							unisonReload();
						},
					},
					{
						text: i18n.ts.classic,
						active: ui === "classic",
						action: () => {
							localStorage.setItem("ui", "classic");
							unisonReload();
						},
					},
				],
				ev.currentTarget ?? ev.target,
			);
		},
	},
	reload: {
		title: "reload",
		icon: "ph-arrows-clockwise-bold ph-lg",
		action: (ev) => {
			location.reload();
		},
	},
	help: {
		title: "help",
		icon: "ph-question-bold ph-lg",
		action: (ev) => {
			os.popupMenu([{
				text: instance.name ?? host,
				type: 'label',
			}, {
				type: 'link',
				text: i18n.ts.instanceInfo,
				icon: 'ph-info-bold ph-lg',
				to: '/about',
			}, {
				type: 'link',
				text: i18n.ts.aboutMisskey,
				icon: 'ph-lightbulb-bold ph-lg',
				to: '/about-calckey',
			}, {
				type: 'link',
				text: i18n.ts._apps.apps,
				icon: 'ph-device-mobile-bold ph-lg',
				to: '/apps',
			}, {
					type: 'button',
					action: async () => {
						defaultStore.set('tutorial', 0);
						os.popup(XTutorial, {}, {}, 'closed');
					},
					text: i18n.ts.replayTutorial,
					icon: 'ph-circle-wavy-question-bold ph-lg',
				}, null, {
					type: 'parent',
					text: i18n.ts.developer,
					icon: 'ph-code-bold ph-lg',
					children: [{
						type: 'link',
						to: '/api-console',
						text: 'API Console',
						icon: 'ph-terminal-window-bold ph-lg',
					}, {
						text: i18n.ts.document,
						icon: 'ph-file-doc-bold ph-lg',
						action: () => {
							window.open('/api-doc', '_blank');
						},
					}, {
						type: 'link',
						to: '/scratchpad',
						text: 'AiScript Scratchpad',
						icon: 'ph-scribble-loop-bold ph-lg',
					}]
				}], ev.currentTarget ?? ev.target,
			);
		},
	},
});
