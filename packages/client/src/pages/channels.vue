<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="700">
		<swiper
			:modules="[Virtual]"
			:space-between="20"
			:virtual="true"
			:allow-touch-move="!(deviceKind === 'desktop' && !defaultStore.state.swipeOnDesktop) && defaultStore.state.allowSwipe"
			@swiper="setSwiperRef"
			@slide-change="onSlideChange"
		>
			<swiper-slide>
				<div class="_content grwlizim featured">
					<MkPagination v-slot="{items}" :pagination="featuredPagination">
						<MkChannelPreview v-for="channel in items" :key="channel.id" class="_gap" :channel="channel"/>
					</MkPagination>
				</div>
			</swiper-slide>
			<swiper-slide>
				<div class="_content grwlizim following">
					<MkPagination v-slot="{items}" :pagination="followingPagination">
						<MkChannelPreview v-for="channel in items" :key="channel.id" class="_gap" :channel="channel"/>
					</MkPagination>
				</div>
			</swiper-slide>
			<swiper-slide>
				<div class="_content grwlizim owned">
					<MkButton class="new" @click="create()"><i class="ph-plus-bold ph-lg"></i></MkButton>
					<MkPagination v-slot="{items}" :pagination="ownedPagination">
						<MkChannelPreview v-for="channel in items" :key="channel.id" class="_gap" :channel="channel"/>
					</MkPagination>
				</div>
			</swiper-slide>
		</swiper>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, defineComponent, inject, watch } from 'vue';
import { Virtual } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import MkChannelPreview from '@/components/MkChannelPreview.vue';
import MkPagination from '@/components/MkPagination.vue';
import MkButton from '@/components/MkButton.vue';
import { useRouter } from '@/router';
import { definePageMetadata } from '@/scripts/page-metadata';
import { deviceKind } from '@/scripts/device-kind';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';
import 'swiper/scss';
import 'swiper/scss/virtual';

const router = useRouter();

const tabs = ['featured', 'following', 'owned'];
let tab = $ref(tabs[0]);
watch($$(tab), () => (syncSlide(tabs.indexOf(tab))));

const featuredPagination = {
	endpoint: 'channels/featured' as const,
	limit: 10,
	noPaging: false,
};
const followingPagination = {
	endpoint: 'channels/followed' as const,
	limit: 10,
};
const ownedPagination = {
	endpoint: 'channels/owned' as const,
	limit: 10,
};

function create() {
	router.push('/channels/new');
}

const headerActions = $computed(() => [{
	icon: 'ph-plus-bold ph-lg',
	text: i18n.ts.create,
	handler: create,
}]);

const headerTabs = $computed(() => [{
	key: 'featured',
	title: i18n.ts._channel.featured,
	icon: 'ph-fire-simple-bold ph-lg',
}, {
	key: 'following',
	title: i18n.ts._channel.following,
	icon: 'ph-heart-bold ph-lg',
}, {
	key: 'owned',
	title: i18n.ts._channel.owned,
	icon: 'ph-crown-simple-bold ph-lg',
}]);

definePageMetadata(computed(() => ({
	title: i18n.ts.channel,
	icon: 'ph-television-bold ph-lg',
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
</script>
