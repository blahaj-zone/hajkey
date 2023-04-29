<template>
	<button
		class="_button"
		:class="{ showLess: modelValue, fade: !modelValue }"
		@click.stop="toggle"
	>
		<span
			>{{ modelValue ? i18n.ts._cw.hide : i18n.ts._cw.show }}
			<span v-if="!modelValue">{{ label }}</span>
		</span>
	</button>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { length } from "stringz";
import * as misskey from "calckey-js";
import { concat } from "@/scripts/array";
import { i18n } from "@/i18n";

const props = defineProps<{
	modelValue: boolean;
	note: misskey.entities.Note;
}>();

const emit = defineEmits<{
	(ev: "update:modelValue", v: boolean): void;
}>();

const label = computed(() => {
	return concat([
		props.note.text
			? [i18n.t("_cw.chars", { count: length(props.note.text) })]
			: [],
		props.note.files && props.note.files.length !== 0
			? [i18n.t("_cw.files", { count: props.note.files.length })]
			: [],
		props.note.poll != null ? [i18n.ts.poll] : [],
		props.note.renote != null ? [i18n.ts.quoteAttached] : [],
	] as string[][]).join(", ");
});

const toggle = () => {
	emit("update:modelValue", !props.modelValue);
};
</script>

<style lang="scss" scoped>
._button {
	font-weight: 700;
	> span {
		background: var(--cwBg) !important;
		color: var(--cwFg);
		transition: background 0.2s, color 0.2s;
		> span {
			font-weight: 500;
			&::before {
				content: "(";
			}
			&::after {
				content: ")";
			}
		}
	}
	&:hover > span {
		background: var(--cwFg) !important;
		color: var(--cwBg) !important;
	}
}
</style>
