<template>
	<div
		v-adaptive-border
		class="novjtctn"
		:class="{ disabled, checked, grouped }"
		:aria-checked="checked"
		:aria-disabled="disabled"
		@click="toggle"
	>
		<input type="radio" :disabled="disabled" />
		<span class="button">
			<span></span>
		</span>
		<span class="label"><slot></slot></span>
	</div>
</template>

<script lang="ts" setup>
import {} from "vue";

const props = defineProps<{
	modelValue: any;
	value: any;
	disabled: boolean;
	grouped?: boolean;
}>();

const emit = defineEmits<{
	(ev: "update:modelValue", value: any): void;
}>();

let checked = $computed(() => props.modelValue === props.value);

function toggle(): void {
	if (props.disabled) return;
	emit("update:modelValue", props.value);
}
</script>

<style lang="scss" scoped>
.novjtctn {
	position: relative;
	display: inline-block;
	text-align: left;
	cursor: pointer;
	padding: 8px 10px;
	min-width: 60px;
	background-color: var(--panel);
	background-clip: padding-box !important;
	border: solid 1px var(--panel);
	border-radius: 6px;
	transition: all 0.2s;

	&.grouped {
		border-radius: 0;
		border-left: solid 1px var(--panel);
		border-right: none;
		padding: 4px 8px;
		min-width: 20px;
		text-align: center;
		&:first-child {
			border-radius: 6px 0 0 6px;
		}
		&:last-child {
			border-radius: 0 6px 6px 0;
			border-right: solid 1px var(--panel);
		}
	}

	> * {
		user-select: none;
	}

	&.disabled {
		opacity: 0.6;

		&,
		* {
			cursor: not-allowed !important;
		}
	}

	&:hover {
		border-color: var(--inputBorderHover) !important;
	}
	&:focus-within {
		outline: auto;
	}

	&.checked {
		background-color: var(--accentedBg) !important;
		border-color: var(--accentedBg) !important;
		color: var(--accent);

		&,
		* {
			cursor: default !important;
		}

		> .button {
			border-color: var(--accent);

			&:after {
				background-color: var(--accent);
				transform: scale(1);
				opacity: 1;
			}
		}
	}

	> input {
		position: absolute;
		width: 0;
		height: 0;
		opacity: 0;
		margin: 0;
	}

	> .button {
		position: absolute;
		width: 14px;
		height: 14px;
		background: none;
		border: solid 2px var(--inputBorder);
		border-radius: 100%;
		transition: inherit;

		&:after {
			content: "";
			display: block;
			position: absolute;
			top: 3px;
			right: 3px;
			bottom: 3px;
			left: 3px;
			border-radius: 100%;
			opacity: 0;
			transform: scale(0);
			transition: 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
		}
		.grouped & {
			display: none;
		}
	}

	> .label {
		margin-left: 28px;
		display: block;
		line-height: 20px;
		cursor: pointer;
		.grouped & {
			margin-left: 0;
			text-align: center;
		}
	}
}
</style>
