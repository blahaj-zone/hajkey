<template><MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
		<MkSpacer :content-max="800" :margin-min="16" :margin-max="32">
	<FormButton primary @click="indexPosts">{{ i18n.ts.indexPosts }}</FormButton>
	<FormSuspense v-slot="{ result: database }" :p="databasePromiseFactory">
		<MkKeyValue v-for="table in database" :key="table[0]" oneline style="margin: 1em 0;">
			<template #key>{{ table[0] }}</template>
			<template #value>{{ bytes(table[1].size) }} ({{ number(table[1].count) }} recs)</template>
		</MkKeyValue>
	</FormSuspense>
</MkSpacer></MkStickyContainer>
</template>

<script lang="ts" setup>
import { } from 'vue';
import FormSuspense from '@/components/form/suspense.vue';
import FormButton from '@/components/MkButton.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import * as os from '@/os';
import bytes from '@/filters/bytes';
import number from '@/filters/number';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

async function indexPosts() {
	const { canceled, result: index } = await os.inputText({
		title: i18n.ts.indexFrom,
	});
	if (canceled) return;

	if (index == null || index === "") {
		await os.api('admin/search/index-all');
		await os.alert({
			type: 'info',
			text: i18n.ts.indexNotice
		});
	}
	else {
		await os.api('admin/search/index-all', {
			cursor: index
		});
		await os.alert({
			type: 'info',
			text: i18n.ts.indexNotice
		});
	}
}

const databasePromiseFactory = () => os.api('admin/get-table-stats').then(res => Object.entries(res).sort((a, b) => b[1].size - a[1].size));

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.database,
	icon: 'ph-database ph-bold ph-lg',
});
</script>
