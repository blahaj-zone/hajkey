import { computed, ref, reactive } from "vue";
import { $i } from "./account";
import { search } from "@/scripts/search";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { ui } from "@/config";
import { unisonReload } from "@/scripts/unison-reload";
import { defaultStore } from "@/store";
import { instance } from "@/instance";
import { host } from "@/config";
import XTutorial from "@/components/MkTutorialDialog.vue";

export const navbarItemDef = reactive({
	notifications: {
		title: "notifications",
		icon: "ph-bell ph-bold ph-lg",
		show: computed(() => $i != null),
		indicated: computed(() => $i?.hasUnreadNotification && defaultStore.state.indicateNotification),
		to: "/my/notifications",
	},
	messaging: {
		title: "messaging",
		icon: "ph-chats-teardrop ph-bold ph-lg",
		show: computed(() => $i != null),
		indicated: computed(() => $i?.hasUnreadMessagingMessage && defaultStore.state.indicateMessaging),
		to: "/my/messaging",
	},
	drive: {
		title: "drive",
		icon: "ph-cloud ph-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/drive",
	},
	followRequests: {
		title: "followRequests",
		icon: "ph-hand-waving ph-bold ph-lg",
		show: computed(() => $i?.isLocked),
		indicated: computed(() => $i?.hasPendingReceivedFollowRequest && defaultStore.state.indicateFollows),
		to: "/my/follow-requests",
	},
	explore: {
		title: "explore",
		icon: "ph-compass ph-bold ph-lg",
		to: "/explore",
	},
	announcements: {
		title: "announcements",
		icon: "ph-megaphone-simple ph-bold ph-lg",
		indicated: computed(() => $i?.hasUnreadAnnouncement && defaultStore.state.indicateAnnouncements),
		to: "/announcements",
	},
	search: {
		title: "search",
		icon: "ph-magnifying-glass ph-bold ph-lg",
		action: () => search(),
	},
	lists: {
		title: "lists",
		icon: "ph-list-bullets ph-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/lists",
	},
	/*
	groups: {
		title: 'groups',
		icon: 'ph-users-three ph-bold ph-lg',
		show: computed(() => $i != null),
		to: '/my/groups',
	},
	*/
	antennas: {
		title: "antennas",
		icon: "ph-flying-saucer ph-bold ph-lg",
		show: computed(() => $i != null),
		indicated: computed(() => $i?.hasUnreadAntenna && defaultStore.state.indicateAntennas),
		to: "/my/antennas",
	},
	favorites: {
		title: "favorites",
		icon: "ph-bookmark-simple ph-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/favorites",
	},
	pages: {
		title: "pages",
		icon: "ph-file-text ph-bold ph-lg",
		to: "/pages",
	},
	gallery: {
		title: "gallery",
		icon: "ph-image-square ph-bold ph-lg",
		to: "/gallery",
	},
	clips: {
		title: "clip",
		icon: "ph-paperclip ph-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/clips",
	},
	channels: {
		title: "channel",
        icon: "ph-television ph-bold ph-lg",
        indicated: computed(() => $i?.hasUnreadChannel && defaultStore.state.indicateChannels),
		to: "/channels",
	},
	groups: {
		title: "groups",
		icon: "ph-users-three ph-bold ph-lg",
		to: "/my/groups",
	},
	ui: {
		title: "switchUi",
		icon: "ph-layout ph-bold ph-lg",
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
		icon: "ph-arrows-clockwise ph-bold ph-lg",
		action: (ev) => {
			location.reload();
		},
	},
	help: {
		title: "help",
		icon: "ph-question ph-bold ph-lg",
		action: (ev) => {
			os.popupMenu(
				[
					{
						text: instance.name ?? host,
						type: "label",
					},
					{
						type: "link",
						text: i18n.ts.instanceInfo,
						icon: "ph-info ph-bold ph-lg",
						to: "/about",
					},
					{
						type: "link",
						text: i18n.ts.aboutMisskey,
						icon: "ph-lightbulb ph-bold ph-lg",
						to: "/about-calckey",
					},
					{
						type: "link",
						text: i18n.ts._apps.apps,
						icon: "ph-device-mobile ph-bold ph-lg",
						to: "/apps",
					},
					{
						type: "button",
						action: async () => {
							defaultStore.set("tutorial", 0);
							os.popup(XTutorial, {}, {}, "closed");
						},
						text: i18n.ts.replayTutorial,
						icon: "ph-circle-wavy-question ph-bold ph-lg",
					},
					null,
					{
						type: "parent",
						text: i18n.ts.developer,
						icon: "ph-code ph-bold ph-lg",
						children: [
							{
								type: "link",
								to: "/api-console",
								text: "API Console",
								icon: "ph-terminal-window ph-bold ph-lg",
							},
							{
								text: i18n.ts.document,
								icon: "ph-file-doc ph-bold ph-lg",
								action: () => {
									window.open("/api-doc", "_blank");
								},
							},
							{
								type: "link",
								to: "/scratchpad",
								text: "AiScript Scratchpad",
								icon: "ph-scribble-loop ph-bold ph-lg",
							},
						],
					},
				],
				ev.currentTarget ?? ev.target,
			);
		},
	},
});
