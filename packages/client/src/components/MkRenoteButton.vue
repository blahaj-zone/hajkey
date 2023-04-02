<template>
<button
	v-if="canRenote"
	ref="buttonRef"
	v-tooltip.noDelay.bottom="i18n.ts.renote"
	class="eddddedb _button canRenote"
	@click="renote(false, $event)"
>
	<i class="ph-repeat ph-bold ph-lg"></i>
	<p v-if="count > 0" class="count">{{ count }}</p>
</button>
<button v-else class="eddddedb _button">
	<i class="ph-prohibit ph-bold ph-lg"></i>
</button>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import type * as misskey from 'calckey-js';
import Ripple from '@/components/MkRipple.vue';
import XDetails from '@/components/MkUsersTooltip.vue';
import { pleaseLogin } from '@/scripts/please-login';
import * as os from '@/os';
import { $i } from '@/account';
import { useTooltip } from '@/scripts/use-tooltip';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';

const props = defineProps<{
		note: misskey.entities.Note;
		count: number;
	}>();

const buttonRef = ref<HTMLElement>();

const canRenote = computed(() => ['public', 'home'].includes(props.note.visibility) || props.note.userId === $i.id);

useTooltip(buttonRef, async (showing) => {
	const renotes = await os.api('notes/renotes', {
		noteId: props.note.id,
		limit: 11,
	});

	const users = renotes.map(x => x.user);

	if (users.length < 1) return;

	os.popup(XDetails, {
		showing,
		users,
		count: props.count,
		targetElement: buttonRef.value,
	}, {}, 'closed');
});

const renote = async (viaKeyboard = false, ev?: MouseEvent) => {
	pleaseLogin();

	const renotes = await os.api('notes/renotes', {
		noteId: props.note.id,
		limit: 11,
	});

	const users = renotes.map(x => x.user.id);
	const hasRenotedBefore = users.includes($i.id);

	let buttonActions = [];

	if (props.note.visibility === 'public') {
		buttonActions.push({
			text: i18n.ts.renote,
			textStyle: 'font-weight: bold',
			icon: 'ph-repeat ph-bold ph-lg',
			danger: false,
			action: () => {
				os.api('notes/create', {
					renoteId: props.note.id,
					visibility: 'public',
				});
				const el = ev && (ev.currentTarget ?? ev.target) as HTMLElement | null | undefined;
				if (el) {
					const rect = el.getBoundingClientRect();
					const x = rect.left + (el.offsetWidth / 2);
					const y = rect.top + (el.offsetHeight / 2);
					os.popup(Ripple, { x, y }, {}, 'end');
				}
			},
		});
	}

	if (['public', 'home'].includes(props.note.visibility)) {
		buttonActions.push({
			text: i18n.ts.renoteAsUnlisted,
			icons: ['ph-repeat ph-bold ph-lg', 'ph-house ph-bold ph-lg'],
			danger: false,
			action: () => {
				os.api('notes/create', {
					renoteId: props.note.id,
					visibility: 'home',
				});
				const el = ev && (ev.currentTarget ?? ev.target) as HTMLElement | null | undefined;
				if (el) {
					const rect = el.getBoundingClientRect();
					const x = rect.left + (el.offsetWidth / 2);
					const y = rect.top + (el.offsetHeight / 2);
					os.popup(Ripple, { x, y }, {}, 'end');
				}
			},
		});
	}

	if (props.note.visibility === 'specified') {
		buttonActions.push({
			text: i18n.ts.renoteToRecipients,
			icons: ['ph-repeat ph-bold ph-lg', 'ph-envelope-simple-open ph-bold ph-lg'],
			danger: false,
			action: () => {
				os.api('notes/create', {
					renoteId: props.note.id,
					visibility: 'specified',
					visibleUserIds: props.note.visibleUserIds,
				});
				const el = ev && (ev.currentTarget ?? ev.target) as HTMLElement | null | undefined;
				if (el) {
					const rect = el.getBoundingClientRect();
					const x = rect.left + (el.offsetWidth / 2);
					const y = rect.top + (el.offsetHeight / 2);
					os.popup(Ripple, { x, y }, {}, 'end');
				}
			},
		});
	} else {
		buttonActions.push({
			text: i18n.ts.renoteToFollowers,
			icons: ['ph-repeat ph-bold ph-lg', 'ph-lock-simple-open ph-bold ph-lg'],
			danger: false,
			action: () => {
				os.api('notes/create', {
					renoteId: props.note.id,
					visibility: 'followers',
				});
				const el = ev && (ev.currentTarget ?? ev.target) as HTMLElement | null | undefined;
				if (el) {
					const rect = el.getBoundingClientRect();
					const x = rect.left + (el.offsetWidth / 2);
					const y = rect.top + (el.offsetHeight / 2);
					os.popup(Ripple, { x, y }, {}, 'end');
				}
			},
		});
	}

	if (!defaultStore.state.seperateRenoteQuote) {
		buttonActions.push({
			text: i18n.ts.quote,
			icon: 'ph-quotes ph-bold ph-lg',
			danger: false,
			action: () => {
				os.post({
					renote: props.note,
				});
			},
		});
	}

	if (hasRenotedBefore) {
		buttonActions.push({
			text: i18n.ts.unrenote,
			icon: 'ph-trash ph-bold ph-lg',
			danger: true,
			action: () => {
				os.api('notes/unrenote', {
					noteId: props.note.id,
				});
			},
		});
	}
	os.popupMenu(buttonActions, buttonRef.value, { viaKeyboard });
};
</script>

	<style lang="scss" scoped>
	.eddddedb {
		display: inline-block;
		height: 32px;
		margin: 2px;
		padding: 0 6px;
		border-radius: 4px;

		&:not(.canRenote) {
			cursor: default;
		}

		&.renoted {
			background: var(--accent);
		}

		> .count {
			display: inline;
			margin-left: 8px;
			opacity: 0.7;
		}
	}
	</style>
