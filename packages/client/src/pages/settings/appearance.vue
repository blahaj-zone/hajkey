<template>
<div class="_formRoot">
	<h3>Note: A page reload is required to apply these settings.</h3>
	<FormSection>
		<template #label>{{ i18n.ts.repliesLabel }}</template>

		<FormRange v-model="repliesDepth" :min="1" :max="20" :step="1" easing class="_formBlock">
			<template #label>
				<i class="ph-tree-structure-bold ph-lg"></i>
				{{ i18n.ts.repliesDepth }}
			</template>
			<template #caption>{{ i18n.ts.repliesDepthDescription }}</template>
		</FormRange>

		<FormSwitch v-model="replyDividerColorize" class="_formBlock">
			{{ i18n.ts.replyDividerColorize }}
			<template #caption>{{ i18n.ts.replyDividerColorizeDescription }}</template>
		</FormSwitch>
		<FormSwitch v-model="replyDividerColorGrad" class="_formBlock">
			{{ i18n.ts.replyDividerColorGrad }}
		</FormSwitch>
		<FormSwitch v-model="replyDividerColorBg" class="_formBlock">
			{{ i18n.ts.replyDividerColorBg }}
		</FormSwitch>

		<FormSwitch v-model="replyIndentCompact" class="_formBlock">
			{{ i18n.ts.replyIndentCompact }}
			<template #caption>{{ i18n.ts.replyIndentCompactDescription }}</template>
		</FormSwitch>
	</FormSection>

	<FormSection>
		<template #label>{{ i18n.ts._defaultTimeline.header }}</template>

		<FormSelect v-model="defaultTimeline" :large="true" class="_formBlock">
			<template #label>
				{{ i18n.ts._defaultTimeline.label }}
			</template>
			<template #prefix>
				<i class="ph-article-bold ph-lg"></i>
			</template>

			<option value="">
				{{ i18n.ts._defaultTimeline.last }}
			</option>
			<option value="home">
				{{ i18n.ts._defaultTimeline.home }}
			</option>
			<option value="local">
				{{ i18n.ts._defaultTimeline.local }}
			</option>
			<option value="recommended">
				{{ i18n.ts._defaultTimeline.recommended }}
			</option>
			<option value="social">
				{{ i18n.ts._defaultTimeline.social }}
			</option>
			<option value="global">
				{{ i18n.ts._defaultTimeline.global }}
			</option>
		</FormSelect>
	</FormSection>

	<FormSection>
		<template #label>{{ i18n.ts.contentWarningsLabel }}</template>

		<FormSwitch v-model="autoShowCw" class="_formBlock">
			{{ i18n.ts.autoShowCw }}
			<template #caption>{{ i18n.ts.autoShowCwDescription }}</template>
		</FormSwitch>

		<FormSelect v-model="nsfw" :large="true" class="_formBlock">
			<template #label>
				{{ i18n.ts.nsfw }}
			</template>
			<template #prefix>
				<i class="ph-shield-check-bold ph-lg"></i>
			</template>
			
			<option value="respect">
				{{ i18n.ts._nsfw.respect }}
			</option>
			<option value="ignore">
				{{ i18n.ts._nsfw.ignore }}
			</option>
			<option value="force">
				{{ i18n.ts._nsfw.force }}
			</option>
		</FormSelect>
	</FormSection>

	<FormSection>
		<template #label>{{ i18n.ts.expandPostLabel }}</template>

		<FormSwitch v-model="expandPostAlways" class="_formBlock">
			{{ i18n.ts.expandPostAlways }}
			<template #caption>{{ i18n.ts.expandPostAlwaysDescription }}</template>
		</FormSwitch>
		<FormInput v-model="expandPostMaxLines" type="number" class="_formBlock">
			<template #label>{{ i18n.ts.expandPostMaxLines }}</template>
			<template #prefix><i class="ph-list-numbers-bold ph-lg"></i></template>
			<template #caption>{{ i18n.ts.expandPostMaxLinesDescription }}</template>
		</FormInput>
		<FormInput v-model="expandPostMaxCharacters" type="number" class="_formBlock">
			<template #label>{{ i18n.ts.expandPostMaxCharacters }}</template>
			<template #prefix><i class="ph-hash-bold ph-lg"></i></template>
			<template #caption>{{ i18n.ts.expandPostMaxCharactersDescription }}</template>
		</FormInput>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';
import { definePageMetadata } from '@/scripts/page-metadata';

import FormInput from '@/components/form/input.vue';
import FormRange from '@/components/form/range.vue';
import FormSection from '@/components/form/section.vue';
import FormSelect from '@/components/form/select.vue';
import FormSwitch from '@/components/form/switch.vue';

const repliesDepth = $computed(defaultStore.makeGetterSetter('repliesDepth'));
const replyDividerColorize = $computed(defaultStore.makeGetterSetter('replyDividerColorize'));
const replyDividerColorGrad = $computed(defaultStore.makeGetterSetter('replyDividerColorGrad'));
const replyDividerColorBg = $computed(defaultStore.makeGetterSetter('replyDividerColorBg'));
const replyIndentCompact = $computed(defaultStore.makeGetterSetter('replyIndentCompact'));

const autoShowCw = $computed(defaultStore.makeGetterSetter('autoShowCw'));
const nsfw = $computed(defaultStore.makeGetterSetter('nsfw'));

const expandPostAlways = $computed(defaultStore.makeGetterSetter('expandPostAlways'));
const expandPostMaxLines = $computed(defaultStore.makeGetterSetter('expandPostMaxLines'));
const expandPostMaxCharacters = $computed(defaultStore.makeGetterSetter('expandPostMaxCharacters'));

const defaultTimeline = $computed(defaultStore.makeGetterSetter('defaultTimeline'));

definePageMetadata({
	title: i18n.ts.appearance,
	icon: 'ph-eye-bold ph-lg',
});
</script>
