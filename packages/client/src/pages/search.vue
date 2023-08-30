<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
				:display-back-button="true"
		/></template>
		<MkSpacer :content-max="800">
			<swiper
				:round-lengths="true"
				:touch-angle="25"
				:threshold="10"
				:centeredSlides="true"
				:modules="[Virtual]"
				:space-between="20"
				:virtual="true"
				:allow-touch-move="
					defaultStore.state.swipeOnMobile &&
					(deviceKind !== 'desktop' ||
						defaultStore.state.swipeOnDesktop)
				"
				@swiper="setSwiperRef"
				@slide-change="onSlideChange"
			>
				<swiper-slide>
					<template v-if="$i">
						<XNotes ref="notes" :pagination="notesPagination" />
					</template>
					<template v-else>
						<transition :name="$store.state.animation ? 'zoom' : ''" appear>
							<div class="_fullinfo" ref="notes">
								<img
									:src="instance.images.info"
									class="_ghost"
									alt="Info"
								/>
								<div>
									{{ i18n.ts.searchNotLoggedIn_1 }}<br>
									{{ i18n.ts.searchNotLoggedIn_2 }}
								</div>
							</div>
						</transition>
					</template>
				</swiper-slide>
				<swiper-slide>
					<XUserList
						ref="users"
						class="_gap"
						:pagination="usersPagination"
					/>
				</swiper-slide>
			</swiper>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch, onMounted } from "vue";
import { Virtual } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import XNotes from "@/components/MkNotes.vue";
import XUserList from "@/components/MkUserList.vue";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { defaultStore } from "@/store";
import { deviceKind } from "@/scripts/device-kind";
import { $i } from "@/account";
import "swiper/scss";
import "swiper/scss/virtual";
import {instance} from "@/instance";

const props = defineProps<{
	query: string;
	channel?: string;
}>();

const notesPagination = {
	endpoint: "notes/search" as const,
	limit: 10,
	params: computed(() => ({
		query: props.query,
		channelId: props.channel,
	})),
};

const usersPagination = {
	endpoint: "users/search" as const,
	limit: 10,
	params: computed(() => ({
		query: props.query,
		origin: "combined",
	})),
};

const tabs = ["notes", "users"];
let tab = $ref(tabs[0]);
watch($$(tab), () => syncSlide(tabs.indexOf(tab)));

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [
	{
		key: "notes",
		icon: "ph-magnifying-glass ph-bold ph-lg",
		title: i18n.ts.notes,
	},
	{
		key: "users",
		icon: "ph-users ph-bold ph-lg",
		title: i18n.ts.users,
	},
]);

let swiperRef = null;

function setSwiperRef(swiper) {
	swiperRef = swiper;
	syncSlide(tabs.indexOf(tab));
}

function onSlideChange() {
	tab = tabs[swiperRef.activeIndex];
}

function syncSlide(index) {
	swiperRef.slideTo(index);
}

onMounted(() => {
	syncSlide(tabs.indexOf(swiperRef.activeIndex));
});

definePageMetadata(
	computed(() => ({
		title: i18n.t("searchWith", { q: props.query }),
		icon: "ph-magnifying-glass ph-bold ph-lg",
	})),
);
</script>
