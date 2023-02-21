<template>
	<section v-if="mode === 'new' || mode === 'edit' ">
		<h1>{{ mode === 'new' ? i18n.ts._wiki.create : i18n.ts._wiki.edit }}</h1>
		<form @submit.prevent="save">
			<div class="_formRoot">
				<FormSection>
					<template #label>{{ i18n.ts._wiki.title }}</template>
					<FormInput v-model="page.title" class="_formBlock">
						<template #caption>{{ i18n.ts._wiki.titleDescription }}</template>
					</FormInput>
				</FormSection>
				<FormSection>
					<template #label>{{ i18n.ts._wiki.slug }}</template>
					<FormInput v-model="page.slug" class="_formBlock">
						<template #caption>{{ i18n.ts._wiki.slugDescription }}</template>
					</FormInput>
				</FormSection>
				<FormSection>
					<template #label>{{ i18n.ts._wiki.content }}</template>
					<FormTextarea v-model="page.content" class="_formBlock">
						<template #caption>{{ i18n.ts._wiki.contentDescription }}</template>
					</FormTextarea>
				</FormSection>
				<FormSection>
					<template #label>{{ i18n.ts._wiki.permissions }}</template>
					<FormSelect v-model="page.permission" class="_formBlock">
						<option value="public">{{ i18n.ts._wiki.public }}</option>
						<option value="private">{{ i18n.ts._wiki.private }}</option>
						<option value="specified">{{ i18n.ts._wiki.specified }}</option>
					</FormSelect>

					<FormInput v-if="permission === 'specified'" v-model="page.specified" type="textarea" class="_formBlock">
						<template #caption>{{ i18n.ts._wiki.specifiedDescription }}</template>
					</FormInput>
				</FormSection>
			</div>
			<div class="_formRoot">
				<FormSection>
					<FormButton type="submit" class="_formBlock" :disabled="!canSubmit">
						{{ mode === 'create' ? i18n.ts._wiki.create : i18n.ts._wiki.edit }}
					</FormButton>
				</FormSection>
			</div>
		</form>
	</section>
	<section v-else>
		<MkStickyContainer>
			<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>

			<swiper
				:modules="[Virtual]"
				:space-between="20"
				:virtual="true"
				:allow-touch-move="!(deviceKind === 'desktop' && !defaultStore.state.swipeOnDesktop)"
				@swiper="setSwiperRef"
				@slide-change="onSlideChange"
			>
				<swiper-slide>
					<article class="wiki-view">
						<h1>{{ page.title }}</h1>
						<div class="content" v-html="pageContent"></div>
					</article>
				</swiper-slide>
				<swiper-slide>
					<section class="wiki-list">
						<ul>
							<li v-for="item in items" :key="item.slug">
								<router-link :to="{ name: 'wiki', params: { mode: 'view', slug: item.slug } }">
									{{ item.title }}
								</router-link>
							</li>
						</ul>
					</section>
				</swiper-slide>
			</swiper>
		</MkStickyContainer>
	</section>
</template>

<script lang="ts" setup>
import * as os from '@/os';
import i18n from '@/components/global/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import { useRouter } from '@/router';

import { Virtual } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/scss';
import 'swiper/scss/virtual';

import FormSection from '@/components/form/section.vue';
import FormSelect from '@/components/form/select.vue';
import FormInput from '@/components/form/input.vue';

import markdownIt from 'markdown-it';
import * as mdEmoji from 'markdown-it-emoji';
import * as mdContainer from 'markdown-it-container';
import * as mdTable from 'markdown-it-multimd-table';
import * as mdTaskLists from 'markdown-it-task-lists';
import * as mdHeader from 'markdown-it-github-headings';

const props = defineProps<{
	mode: string;
	slug: string;
}>();

let page = $ref(null);
let items = $ref(null);

const router = useRouter();

const headerActions = $computed(() => [{
	icon: 'ph-plus-bold ph-lg',
	text: i18n.ts._wiki.create,
	handler: create,
}]);

const headerTabs = $computed(() => [{
	key: 'view',
	title: i18n.ts._wiki.wiki,
	icon: 'ph-file-text-bold ph-lg',
}, {
	key: 'list',
	title: i18n.ts._wiki.list,
	icon: 'ph-list-bold ph-lg',
}]);

page = await os.api('wiki/show', {
	slug: $route.params.slug ?? 'home',
});

items = await os.api('wiki/list');

const md = markdownIt({
		html: true,
		linkify: true,
		typographer: true,
	});

md.use(mdEmoji)
	.use(mdContainer, 'warning')
	.use(mdContainer, 'info')
	.use(mdContainer, 'note')
	.use(mdContainer, 'spoiler', {
		render: (tokens, idx) => {
			if (tokens[idx].nesting === 1) {
				return `<details class="spoiler"><summary>${tokens[idx].info.trim()}</summary>\n`;
			} else {
				return '</details>\n';
			}
		},
	})
	.use(mdTable, {
		headerless: true,
		multiline: true,
		rowspan: true,
		multibody: true,
		autolabel: true,
	})
	.use(mdTaskLists, {
		label: true,
		labelAfter: true,
	})
	.use(mdHeader, {
		prefixHeadingIds: false,
	});

const pageContent = $computed(() => {
	if (page) {
		return md.render(page.content);
	} else {
		return '';
	}
});

function create() {
	router.push('/wiki/new');
}

function save() {
	os.api('wiki/save', {
		page: page,
	});
}

definePageMetadata({
	title: i18n.ts._wiki.wiki,
	icon: 'ph-globe-simple-bold ph-lg',
});
</script>

<style lang="scss" scoped>
</style>
