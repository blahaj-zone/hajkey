<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<div class="lznhrdub">
		<MkSpacer :content-max="1200">
			<swiper
				:modules="[Virtual]"
				:space-between="20"
				:virtual="true"
				:allow-touch-move="!(deviceKind === 'desktop' && !defaultStore.state.swipeOnDesktop) && defaultStore.state.allowSwipe"
				@swiper="setSwiperRef"
				@slide-change="onSlideChange"
			>
				<swiper-slide>
					<XFeatured/>
				</swiper-slide>
				<swiper-slide>
					<XUsers/>
				</swiper-slide>
			</swiper>
		</MkSpacer>
	</div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch, onMounted } from 'vue';
import { Virtual } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import XFeatured from './explore.featured.vue';
import XUsers from './explore.users.vue';
import type MkFolder from '@/components/MkFolder.vue';
import { definePageMetadata } from '@/scripts/page-metadata';
import { deviceKind } from '@/scripts/device-kind';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';
import 'swiper/scss';
import 'swiper/scss/virtual';

const props = defineProps<{
	tag?: string;
}>();

const tabs = ['featured', 'users'];
let tab = $ref(tabs[0]);
watch($$(tab), () => (syncSlide(tabs.indexOf(tab))));

let tagsEl = $ref<InstanceType<typeof MkFolder>>();

watch(() => props.tag, () => {
	if (tagsEl) tagsEl.toggleContent(props.tag == null);
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [{
	key: 'featured',
	icon: 'ph-lightning ph-bold ph-lg',
	title: i18n.ts.featured,
}, {
	key: 'users',
	icon: 'ph-users ph-bold ph-lg',
	title: i18n.ts.users,
}]);

definePageMetadata(computed(() => ({
	title: i18n.ts.explore,
	icon: 'ph-compass ph-bold ph-lg',
})));

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

</script>
