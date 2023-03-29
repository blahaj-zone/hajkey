<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="700">
		<div class="ieepwinx">
			<MkButton :link="true" to="/my/antennas/create" primary class="add"><i class="ph-plus ph-bold ph-lg"></i> {{ i18n.ts.add }}</MkButton>

			<div class="">
				<MkPagination v-slot="{items}" ref="list" :pagination="pagination">
					<div v-for="antenna in items" :key="antenna.id">
						<MkA class="uopelskx" :link="true" :to="`/timeline/antenna/${antenna.id}`">
							<i class="ph-flying-saucer ph-bold ph-lg"></i><i :class="`${antenna.hasUnreadNote ? 'ph-circle ph-fill' : 'ph-check'} ph-xs notify-icon`"></i>
						</MkA>
						<MkA class="ljoevbzj" :to="`/my/antennas/${antenna.id}`">
							<div class="name">{{ antenna.name }}</div>
						</MkA>
					</div>
				</MkPagination>
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { onActivated, onDeactivated, ref } from 'vue';
import MkPagination from '@/components/MkPagination.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

const pagination = {
	endpoint: 'antennas/list' as const,
	limit: 250,
};

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

const list = ref<typeof MkPagination|null>(null);

let isCached: boolean = false;
let refreshTimer: number | null = null;

const refresh = () => {
	if (isCached) {
		list.value?.refresh();
	}

	isCached = true;
	refreshTimer = setTimeout(refresh, 15000)
};

onActivated(() => {
	refresh();
});

onDeactivated(() => {
	if (refreshTimer) {
		clearTimeout(refreshTimer);
		refreshTimer = null;
	}
});

definePageMetadata({
	title: i18n.ts.manageAntennas,
	icon: 'ph-flying-saucer ph-bold ph-lg',
});
</script>

<style lang="scss" scoped>
.ieepwinx {

	> .add {
		margin: 0 auto 16px auto;
	}

	.uopelskx {
		float: left;
		min-width: 25px;
		padding: 13px;
		margin-right: 10px;
		border: solid 1px var(--divider);
		border-radius: 6px;

		&:hover {
			border: solid 1px var(--accent);
			text-decoration: none;
		}
	}

	.ljoevbzj {
		display: block;
		padding: 16px;
		margin-bottom: 8px;
		border: solid 1px var(--divider);
		border-radius: 6px;

		&:hover {
			border: solid 1px var(--accent);
			text-decoration: none;
		}

		> .name {
			font-weight: bold;
		}
	}

	.notify-icon {
    position: relative;
    top: -1em;
    left: -0.5em;

		&.ph-circle ph-fill {
			color: var(--indicator);
			animation: blink 1s infinite;
		}

		&.ph-check {
			color: var(--muted);
		}
	}
}
</style>
