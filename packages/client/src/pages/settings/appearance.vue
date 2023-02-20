<template>
<div class="_formRoot">
	<h3>Note: A page reload is required to apply these settings.</h3>
	<FormSection>
		<template #label>{{ i18n.ts.repliesLabel }}</template>

		<FormInput v-model="repliesDepth" type="number" min="1" max="20" step="1" class="_formBlock" @update:modelValue="save()">
			<template #label>{{ i18n.ts.repliesDepth }}</template>
			<template #prefix><i class="ph-tree-structure-bold ph-lg"></i></template>
			<template #caption>{{ i18n.ts.repliesDepthDescription }}</template>
		</FormInput>

		<FormSwitch v-model="replyDividerColorize" class="_formBlock" @update:modelValue="save()">
			{{ i18n.ts.replyDividerColorize }}
			<template #caption>{{ i18n.ts.replyDividerColorizeDescription }}</template>
		</FormSwitch>
		<FormSwitch v-model="replyDividerColorGrad" class="_formBlock" @update:modelValue="save()">
			{{ i18n.ts.replyDividerColorGrad }}
		</FormSwitch>
		<FormSwitch v-model="replyDividerColorBg" class="_formBlock" @update:modelValue="save()">
			{{ i18n.ts.replyDividerColorBg }}
		</FormSwitch>

		<FormSwitch v-model="replyIndentCompact" class="_formBlock" @update:modelValue="save()">
			{{ i18n.ts.replyIndentCompact }}
			<template #caption>{{ i18n.ts.replyIndentCompactDescription }}</template>
		</FormSwitch>
	</FormSection>

	<FormSection>
		<template #label>{{ i18n.ts.contentWarningsLabel }}</template>

		<FormSwitch v-model="autoShowCw" class="_formBlock" @update:modelValue="save()">
			{{ i18n.ts.autoShowCw }}
			<template #caption>{{ i18n.ts.autoShowCwDescription }}</template>
		</FormSwitch>
	</FormSection>

	<FormSection>
		<template #label>{{ i18n.ts.expandPostLabel }}</template>

		<FormSwitch v-model="expandPostAlways" class="_formBlock" @update:modelValue="save()">
			{{ i18n.ts.expandPostAlways }}
			<template #caption>{{ i18n.ts.expandPostAlwaysDescription }}</template>
		</FormSwitch>
		<FormInput v-model="expandPostMaxLines" type="number" class="_formBlock" @update:modelValue="save()">
			<template #label>{{ i18n.ts.expandPostMaxLines }}</template>
			<template #prefix><i class="ph-list-numbers-bold ph-lg"></i></template>
			<template #caption>{{ i18n.ts.expandPostMaxLinesDescription }}</template>
		</FormInput>
		<FormInput v-model="expandPostMaxCharacters" type="number" class="_formBlock" @update:modelValue="save()">
			<template #label>{{ i18n.ts.expandPostMaxCharacters }}</template>
			<template #prefix><i class="ph-hash-bold ph-lg"></i></template>
			<template #caption>{{ i18n.ts.expandPostMaxCharactersDescription }}</template>
		</FormInput>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import FormSwitch from '@/components/form/switch.vue';
import FormSection from '@/components/form/section.vue';
import FormInput from '@/components/form/input.vue';
import { defaultStore } from '@/store';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

let repliesDepth = $computed(defaultStore.makeGetterSetter('repliesDepth'));
let replyDividerColorize = $computed(defaultStore.makeGetterSetter('replyDividerColorize'));
let replyDividerColorGrad = $computed(defaultStore.makeGetterSetter('replyDividerColorGrad'));
let replyDividerColorBg = $computed(defaultStore.makeGetterSetter('replyDividerColorBg'));
let replyIndentCompact = $computed(defaultStore.makeGetterSetter('replyIndentCompact'));

let autoShowCw = $computed(defaultStore.makeGetterSetter('autoShowCw'));

let expandPostAlways = $computed(defaultStore.makeGetterSetter('expandPostAlways'));
let expandPostMaxLines = $computed(defaultStore.makeGetterSetter('expandPostMaxLines'));
let expandPostMaxCharacters = $computed(defaultStore.makeGetterSetter('expandPostMaxCharacters'));

function save() {
}

definePageMetadata({
	title: i18n.ts.appearance,
	icon: 'ph-eye-bold ph-lg',
});
</script>
