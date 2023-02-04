<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<div class="lznhrdub">
		<MkSpacer :content-max="1200">
			<swiper
				:modules="[Virtual]"
				:space-between="20"
				:virtual="true"
				:allow-touch-move="!(deviceKind === 'desktop' && !defaultStore.state.swipeOnDesktop)"
				@swiper="setSwiperRef"
				@slide-change="onSlideChange"
			>
				<swiper-slide>
					<XFeatured/>
				</swiper-slide>
				<swiper-slide>
					<XUsers/>
				</swiper-slide>
				<swiper-slide>
					<div>
						<MkInput v-model="searchQuery" :debounce="true" type="search" class="_formBlock">
							<template #prefix><i class="ph-magnifying-glass-bold ph-lg"></i></template>
							<template #label>{{ i18n.ts.searchUser }}</template>
						</MkInput>
						<MkRadios v-model="searchOrigin" class="_formBlock">
							<option value="combined">{{ i18n.ts.all }}</option>
							<option value="local">{{ i18n.ts.local }}</option>
							<option value="remote">{{ i18n.ts.remote }}</option>
						</MkRadios>
					</div>
					<XUserList v-if="searchQuery" ref="searchEl" class="_gap" :pagination="searchPagination"/>
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
import MkInput from '@/components/form/input.vue';
import MkRadios from '@/components/form/radios.vue';
import { definePageMetadata } from '@/scripts/page-metadata';
import { deviceKind } from '@/scripts/device-kind';
import { i18n } from '@/i18n';
import XUserList from '@/components/MkUserList.vue';
import { defaultStore } from '@/store';
import 'swiper/scss';
import 'swiper/scss/virtual';

const props = defineProps<{
	tag?: string;
}>();

const tabs = ['featured', 'users', 'search'];
let tab = $ref(tabs[0]);
watch($$(tab), () => (syncSlide(tabs.indexOf(tab))));

let tagsEl = $ref<InstanceType<typeof MkFolder>>();
let searchQuery = $ref(null);
let searchOrigin = $ref('combined');

watch(() => props.tag, () => {
	if (tagsEl) tagsEl.toggleContent(props.tag == null);
});

const searchPagination = {
	endpoint: 'users/search' as const,
	limit: 10,
	params: computed(() => (searchQuery && searchQuery !== '') ? {
		query: searchQuery,
		origin: searchOrigin,
	} : null),
};

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [{
	key: 'featured',
	icon: 'ph-lightning-bold ph-lg',
	title: i18n.ts.featured,
}, {
	key: 'users',
	icon: 'ph-users-bold ph-lg',
	title: i18n.ts.users,
}, {
	key: 'search',
	icon: 'ph-magnifying-glass-bold ph-lg',
	title: i18n.ts.search,
}]);

definePageMetadata(computed(() => ({
	title: i18n.ts.explore,
	icon: 'ph-compass-bold ph-lg',
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
