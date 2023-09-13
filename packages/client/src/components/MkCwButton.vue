<template>
	<button
		ref="el"
		class="_button"
		:class="[cwButton, { showLess: modelValue, fade: !modelValue, }]"
		@click.stop="toggle"
	>
		<span class="cw-toggle-text"
			>{{ modelValue ? i18n.ts._cw.hide : i18n.ts._cw.show }}
			<span class="cw-char-count" v-if="!modelValue">{{ label }}</span>
		</span>
	</button>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { length } from "stringz";
import type * as misskey from "iceshrimp-js";
import { concat } from "@/scripts/array";
import { i18n } from "@/i18n";
import {defaultStore} from "@/store";

const props = defineProps<{
	modelValue: boolean;
	note: misskey.entities.Note;
}>();

const emit = defineEmits<{
	(ev: "update:modelValue", v: boolean): void;
}>();

const el = ref<HTMLElement>();

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
._button_modern {
	font-weight: 700;
	z-index: 5;
	> span {
		background: var(--cwBg) !important;
		color: var(--cwFg);
		transition:
			background 0.2s,
			color 0.2s;
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
	&:hover > span,
	&:focus > span {
		background: var(--cwFg) !important;
		color: var(--cwBg) !important;
	}

	&.fade {
		display: block;
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		> span {
			display: inline-block;
			background: var(--panel);
			padding: 0.4em 3em;
			font-size: 0.8em;
			border-radius: 999px;
			box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
		}
		&:hover {
			> span {
				background: var(--panelHighlight);
			}
		}
	}
	&.showLess {
		width: 100%;
		position: sticky;
		bottom: calc(var(--stickyBottom) - 1em);
		padding: 20px;

		> span {
			display: inline-block;
			background: var(--panel);
			padding: 0.4em 3em;
			font-size: 0.8em;
			border-radius: 999px;
			box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
		}
	}
}

._button_alternative {
	font-weight: 700;
	z-index: 5;
	> span {
		background: var(--cwBg) !important;
		color: var(--cwFg);
		transition:
			background 0.2s,
			color 0.2s;
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
	&:hover > span,
	&:focus > span {
		background: var(--cwFg) !important;
		color: var(--cwBg) !important;
	}

	&.fade {
		display: block;
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		> span {
			display: inline-block;
			background: var(--panel);
			padding: 0.4em 1em;
			font-size: 0.8em;
			border-radius: 999px;
			box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
		}
		&:hover {
			> span {
				background: var(--panelHighlight);
			}
		}
	}
	&.showLess {
		width: 100%;
		position: sticky;
		bottom: calc(var(--stickyBottom) - 1em);
		padding: 20px;

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

._button_classic {
	display: inline-block;
	padding: 4px 8px;
	font-size: 0.7em;
	color: var(--cwFg);
	background: var(--cwBg);
	border-radius: 2px;

	&:hover {
		background: var(--cwHoverBg);
	}

	> span.cw-toggle-text {
		font-weight: bold;

		> span.cw-char-count {
			font-weight: normal;

			&:before {
				content: '(';
			}

			&:after {
				content: ')';
			}
		}
	}
}
</style>
