<template>
<div class="_formRoot">
	<FormSection>
		<template #label>{{ i18n.ts.autoWatchLabel }}</template>

		<FormSwitch v-model="autoWatchReplied" class="_formBlock" @update:modelValue="save()">
			{{ i18n.ts.autoWatchReplied }}
			<template #caption>{{ i18n.ts.autoWatchRepliedDescription }}</template>
		</FormSwitch>

		<FormSwitch v-model="autoWatchBoosted" class="_formBlock" @update:modelValue="save()">
			{{ i18n.ts.autoWatchBoosted }}
			<template #caption>{{ i18n.ts.autoWatchBoostedDescription }}</template>
		</FormSwitch>

		<FormSwitch v-model="autoWatchQuoted" class="_formBlock" @update:modelValue="save()">
			{{ i18n.ts.autoWatchQuoted }}
			<template #caption>{{ i18n.ts.autoWatchQuotedDescription }}</template>
		</FormSwitch>

		<FormSwitch v-model="autoWatchReacted" class="_formBlock" @update:modelValue="save()">
			{{ i18n.ts.autoWatchReacted }}
			<template #caption>{{ i18n.ts.autoWatchReactedDescription }}</template>
		</FormSwitch>

		<FormSwitch v-model="autoWatchVoted" class="_formBlock" @update:modelValue="save()">
			{{ i18n.ts.autoWatchVoted }}
			<template #caption>{{ i18n.ts.autoWatchVotedDescription }}</template>
		</FormSwitch>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import * as os from '@/os';
import { } from 'vue';
import { i18n } from '@/i18n';
import { $i } from '@/account';
import { definePageMetadata } from '@/scripts/page-metadata';
import FormSwitch from '@/components/form/switch.vue';
import FormSection from '@/components/form/section.vue';

const autoWatchReplied = $ref($i!.autoWatchReplied);
const autoWatchBoosted = $ref($i!.autoWatchBoosted);
const autoWatchQuoted = $ref($i!.autoWatchQuoted);
const autoWatchReacted = $ref($i!.autoWatchReacted);
const autoWatchVoted = $ref($i!.autoWatchVoted);

async function save() {
	await os.api('i/update', {
		autoWatchReplied: !!autoWatchReplied,
		autoWatchBoosted: !!autoWatchBoosted,
		autoWatchQuoted: !!autoWatchQuoted,
		autoWatchReacted: !!autoWatchReacted,
		autoWatchVoted: !!autoWatchVoted,
	});
}

definePageMetadata({
	title: i18n.ts.behavior,
	icon: 'ph-wrench-bold ph-lg',
});
</script>
