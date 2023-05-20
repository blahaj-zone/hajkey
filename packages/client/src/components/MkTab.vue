<script lang="ts">
import { defineComponent, h, resolveDirective, withDirectives } from "vue";

export default defineComponent({
	props: {
		modelValue: {
			required: true,
		},
		style: {
			required: false,
		},
	},
	render() {
		const options = this.$slots.default();

		return h(
			"div",
			{
				class: ["pxhvhrfw", { chips: this.style === "chips" }],
				role: "tablist",
			},
			options.map((option) =>
				withDirectives(
					h(
						"button",
						{
							class: "_button",
							role: "tab",
							key: option.key,
							"aria-selected":
								this.modelValue === option.props?.value
									? "true"
									: "false",
							onClick: () => {
								this.$emit(
									"update:modelValue",
									option.props?.value
								);
							},
						},
						option.children
					),
					[[resolveDirective("click-anime")]]
				)
			)
		);
	},
});
</script>

<style lang="scss">
.pxhvhrfw {
	display: flex;
	font-size: 90%;
	border-radius: var(--radius);
	padding: 10px 8px;

	> button {
		flex: 1;
		padding: 10px 8px;
		margin: 0 8px;
		border-radius: var(--radius);

		&:disabled {
			opacity: 1 !important;
			cursor: default;
		}

		&[aria-selected="true"] {
			color: var(--accent);
			background: var(--accentedBg) !important;
		}

		&:not([aria-selected="true"]):hover {
			color: var(--fgHighlighted);
			background: var(--panelHighlight);
		}

		&:not(:first-child) {
			margin-left: 8px;
		}

		> .icon {
			margin-right: 6px;
		}
	}

	&.chips {
		padding: 12px 32px;
		font-size: 0.85em;
		overflow-x: auto;
		> button {
			display: flex;
			gap: 6px;
			align-items: center;
			flex: unset;
			margin: 0;
			margin-right: 8px;
			padding: 0.5em 1em;
			border-radius: 100px;
			background: var(--buttonBg);
			> i {
				margin-top: -0.1em;
			}
		}
	}

	&.max-width_500px {
		font-size: 80%;

		> button {
			padding: 11px 8px;
		}
	}
}
</style>
