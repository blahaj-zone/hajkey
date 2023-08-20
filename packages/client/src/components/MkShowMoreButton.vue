<template>
	<button
		ref="el"
		class="_button"
		:class="[cwButton, { fade: modelValue, showLess: !modelValue }]"
		@click.stop="toggle"
	>
		<span>{{ modelValue ? i18n.ts.showMore : i18n.ts.showLess }}</span>
	</button>
</template>
<script lang="ts" setup>
import { i18n } from "@/i18n";
import { computed, ref } from "vue";
import {defaultStore} from "@/store";

const props = defineProps<{
	modelValue: boolean;
}>();

const el = ref<HTMLElement>();

const emit = defineEmits<{
	(ev: "update:modelValue", v: boolean): void;
}>();

const cwButton = computed (() => `_button_${defaultStore.state.cwStyle}`);

const toggle = () => {
	emit("update:modelValue", !props.modelValue);
};

function focus() {
	el.value.focus();
}

defineExpose({
	focus,
});
</script>
<style lang="scss" scoped>
.fade {
	display: block;
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	padding: 20px;
	margin-bottom: -10px;
	z-index: 5;
	&._button_modern {
		> span {
			display: inline-block;
			background: var(--panel);
			padding: 0.4em 3em;
			font-size: 0.8em;
			border-radius: 999px;
			box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
		}
	}
	&:not(._button_modern) {
		> span {
			display: inline-block;
			background: var(--panel);
			padding: 0.4em 1em;
			font-size: 0.8em;
			border-radius: 999px;
			box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
		}
	}
	&:hover {
		> span {
			background: var(--panelHighlight);
		}
	}
}
.showLess {
	width: 100%;
	position: sticky;
	bottom: calc(var(--stickyBottom) - 1em);
	padding: 20px;
	z-index: 5;

	&._button_modern {
		> span {
			display: inline-block;
			background: var(--panel);
			padding: 0.4em 3em;
			font-size: 0.8em;
			border-radius: 999px;
			box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
		}
	}

	&:not(._button_modern) {
		> span {
			display: inline-block;
			background: var(--panel);
			padding: 6px 10px;
			font-size: 0.8em;
			border-radius: 999px;
			box-shadow: 0 0 7px 7px var(--bg);
		}
	}
}
</style>
