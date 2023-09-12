<template>
	<FormFolder v-if="showTimelineFilter" class="filter-block">
		<template #label>{{ i18n.ts.filter }}</template>
		<template #icon><i class="ph-funnel ph-bold ph-lg"></i></template>
		<FormRadios
			v-model="showPosts"
			class="filter-item"
			:grouped="true"
			@update:modelValue="refresh()"
		>
			<template #label>{{ i18n.ts._timelineFilter.showPosts }}</template>
			<option value="always">{{ i18n.ts._timelineFilter.always }}</option>
			<option value="show">{{ i18n.ts._timelineFilter.show }}</option>
			<option value="hide">{{ i18n.ts._timelineFilter.hide }}</option>
			<option value="never">{{ i18n.ts._timelineFilter.never }}</option>
		</FormRadios>
		<FormRadios
			v-model="showReplies"
			class="filter-item"
			:grouped="true"
			@update:modelValue="refresh()"
		>
			<template #label>{{
				i18n.ts._timelineFilter.showReplies
			}}</template>
			<option value="always">{{ i18n.ts._timelineFilter.always }}</option>
			<option value="show">{{ i18n.ts._timelineFilter.show }}</option>
			<option value="hide">{{ i18n.ts._timelineFilter.hide }}</option>
			<option value="never">{{ i18n.ts._timelineFilter.never }}</option>
		</FormRadios>
		<FormRadios
			v-model="showBoosts"
			class="filter-item"
			:grouped="true"
			@update:modelValue="refresh()"
		>
			<template #label>{{ i18n.ts._timelineFilter.showBoosts }}</template>
			<option value="always">{{ i18n.ts._timelineFilter.always }}</option>
			<option value="show">{{ i18n.ts._timelineFilter.show }}</option>
			<option value="hide">{{ i18n.ts._timelineFilter.hide }}</option>
			<option value="never">{{ i18n.ts._timelineFilter.never }}</option>
		</FormRadios>
		<FormRadios
			v-model="showQuotes"
			class="filter-item"
			:grouped="true"
			@update:modelValue="refresh()"
		>
			<template #label>{{ i18n.ts._timelineFilter.showQuotes }}</template>
			<option value="always">{{ i18n.ts._timelineFilter.always }}</option>
			<option value="show">{{ i18n.ts._timelineFilter.show }}</option>
			<option value="hide">{{ i18n.ts._timelineFilter.hide }}</option>
			<option value="never">{{ i18n.ts._timelineFilter.never }}</option>
		</FormRadios>
		<FormRadios
			v-model="showPolls"
			class="filter-item"
			:grouped="true"
			@update:modelValue="refresh()"
		>
			<template #label>{{ i18n.ts._timelineFilter.showPolls }}</template>
			<option value="always">{{ i18n.ts._timelineFilter.always }}</option>
			<option value="show">{{ i18n.ts._timelineFilter.show }}</option>
			<option value="hide">{{ i18n.ts._timelineFilter.hide }}</option>
			<option value="never">{{ i18n.ts._timelineFilter.never }}</option>
		</FormRadios>
		<FormRadios
			v-model="showMentions"
			class="filter-item"
			:grouped="true"
			@update:modelValue="refresh()"
		>
			<template #label>{{
				i18n.ts._timelineFilter.showMentions
			}}</template>
			<option value="always">{{ i18n.ts._timelineFilter.always }}</option>
			<option value="show">{{ i18n.ts._timelineFilter.show }}</option>
			<option value="hide">{{ i18n.ts._timelineFilter.hide }}</option>
			<option value="never">{{ i18n.ts._timelineFilter.never }}</option>
		</FormRadios>
		<FormRadios
			v-model="showCws"
			class="filter-item"
			:grouped="true"
			@update:modelValue="refresh()"
		>
			<template #label>{{ i18n.ts._timelineFilter.showCws }}</template>
			<option value="always">{{ i18n.ts._timelineFilter.always }}</option>
			<option value="show">{{ i18n.ts._timelineFilter.show }}</option>
			<option value="hide">{{ i18n.ts._timelineFilter.hide }}</option>
			<option value="never">{{ i18n.ts._timelineFilter.never }}</option>
		</FormRadios>
		<FormRadios
			v-model="showNonCws"
			class="filter-item"
			:grouped="true"
			@update:modelValue="refresh()"
		>
			<template #label>{{ i18n.ts._timelineFilter.showNonCws }}</template>
			<option value="always">{{ i18n.ts._timelineFilter.always }}</option>
			<option value="show">{{ i18n.ts._timelineFilter.show }}</option>
			<option value="hide">{{ i18n.ts._timelineFilter.hide }}</option>
			<option value="never">{{ i18n.ts._timelineFilter.never }}</option>
		</FormRadios>
		<FormSwitch
			v-model="displayParent"
			class="filter-item"
			@update:modelValue="refresh()"
		>
			{{ i18n.ts._timelineFilter.displayParent }}
		</FormSwitch>
		<FormSwitch
			v-model="displayPreviews"
			class="filter-item"
			@update:modelValue="refresh()"
		>
			{{ i18n.ts._timelineFilter.displayPreviews }}
		</FormSwitch>
		<FormSwitch
			v-model="displayMedia"
			class="filter-item"
			@update:modelValue="refresh()"
		>
			{{ i18n.ts._timelineFilter.displayMedia }}
		</FormSwitch>
		<FormSwitch
			v-model="hideDuplicates"
			class="filter-item"
			@update:modelValue="refresh()"
		>
			{{ i18n.ts._timelineFilter.hideDuplicates }}
		</FormSwitch>
	</FormFolder>

	<MkPagination
		ref="pagingComponent"
		:pagination="pagination"
		:visibleCheck="visibleCheck"
	>
		<template #empty>
			<div class="_fullinfo">
				<img
					src="/static-assets/badges/info.png"
					class="_ghost"
					alt="Info"
				/>
				<div>{{ i18n.ts.noNotes }}</div>
			</div>
		</template>

		<template #default="{ items: notes }">
			<div class="giivymft" :class="{ noGap }" ref="tlEl">
				<XList
					ref="notes"
					v-slot="{ item: note }"
					:items="notes"
					:direction="pagination.reversed ? 'up' : 'down'"
					:reversed="pagination.reversed"
					:no-gap="noGap"
					class="notes"
				>
					<XNote
						:key="note._featuredId_ || note._prId_ || note.id"
						class="qtqtichx"
						:note="note"
					/>
				</XList>
			</div>
		</template>
	</MkPagination>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { Paging } from "@/components/MkPagination.vue";
import XNote from "@/components/MkNote.vue";
import XList from "@/components/MkDateSeparatedList.vue";
import MkPagination from "@/components/MkPagination.vue";
import { i18n } from "@/i18n";
import { scroll } from "@/scripts/scroll";

const tlEl = ref<HTMLElement>();

const props = defineProps<{
	pagination: Paging;
	noGap?: boolean;
}>();

const pagingComponent = ref<InstanceType<typeof MkPagination>>();

function scrollTop() {
	scroll(tlEl.value, { top: 0, behavior: "smooth" });
}

defineExpose({
	pagingComponent,
	scrollTop,
});
</script>

<style lang="scss" scoped>
.giivymft {
	&.noGap {
		> .notes {
			background: var(--panel) !important;
			border-radius: var(--radius);
		}
	}
	&:not(.noGap) {
		> .notes {
			.qtqtichx {
				background: var(--panel);
				border-radius: var(--radius);
			}
		}
	}
}
.filter-block {
	margin-bottom: 1rem;
	.filter-item {
		margin-top: 0.5rem;
		&:first-child {
			margin-top: 0;
		}
	}
}
</style>
