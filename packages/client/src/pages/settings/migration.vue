<template>
	<div class="_formRoot">
		<FormSection>
			<template #label>{{ i18n.ts.moveTo }}</template>
			<FormInput v-model="moveToAccount" class="_formBlock">
				<template #prefix
					><i class="ph-airplane-takeoff ph-bold ph-lg"></i
				></template>
				<template #label>{{ i18n.ts.moveToLabel }}</template>
			</FormInput>
			<FormButton primary danger @click="move(moveToAccount)">
				{{ i18n.ts.moveAccount }}
			</FormButton>
			<div class="description">{{ i18n.ts.moveAccountDescription }}</div>
		</FormSection>

		<FormSection>
			<template #label>{{ i18n.ts.moveFrom }}</template>
			<FormInput v-model="accountAlias" class="_formBlock">
				<template #prefix
					><i class="ph-airplane-landing ph-bold ph-lg"></i
				></template>
				<template #label>{{ i18n.ts.moveFromLabel }}</template>
			</FormInput>
			<FormButton
				class="button"
				inline
				primary
				@click="save(accountAlias.toString())"
			>
				<i class="ph-floppy-disk-back ph-bold ph-lg"></i>
				{{ i18n.ts.save }}
			</FormButton>
			<div class="description">{{ i18n.ts.moveFromDescription }}</div>
		</FormSection>
	</div>
</template>

<script lang="ts" setup>
import FormSection from "@/components/form/section.vue";
import FormInput from "@/components/form/input.vue";
import FormButton from "@/components/MkButton.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

let moveToAccount = $ref("");
let accountAlias = $ref("");

async function save(account): Promise<void> {
	os.apiWithDialog("i/known-as", {
		alsoKnownAs: account,
	});
}

async function move(account): Promise<void> {
	const confirm = await os.confirm({
		type: "warning",
		text: i18n.t("migrationConfirm", { account: account.toString() }),
	});
	if (confirm.canceled) return;
	os.apiWithDialog("i/move", {
		moveToAccount: account,
	});
}

definePageMetadata({
	title: i18n.ts.security,
	icon: "ph-lock ph-bold ph-lg",
});
</script>

<style lang="scss">
.description {
	font-size: 0.85em;
	padding: 1rem;
}
</style>
