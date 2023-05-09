<template>
	<FormFolder v-if="showTimelineFilter" class="_formBlock filter-block">
		<template #label>{{ i18n.ts.filter }}</template>
		<template #icon><i class="ph-funnel ph-bold ph-lg"></i></template>
		<FormRadios
			v-model="showPosts"
			class="filter-item"
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
			<div class="giivymft" :class="{ noGap }">
				<XList
					ref="notes"
					v-slot="{ item: note }"
					:items="notes"
					:direction="pagination.reversed ? 'up' : 'down'"
					:reversed="pagination.reversed"
					:no-gap="noGap"
					:ad="true"
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
import FormSwitch from "@/components/form/switch.vue";
import FormRadios from "@/components/form/radios.vue";
import FormFolder from "@/components/form/folder.vue";
import { defaultStore } from "@/store";
import { Note } from "calckey-js/built/entities";
import { $i } from "@/account";

const props = defineProps<{
	pagination: Paging;
	noGap?: boolean;
}>();

const pagingComponent = ref<InstanceType<typeof MkPagination>>();

const timer = ref<NodeJS.Timeout>();
const refresh = () => {
	if (timer.value) clearTimeout(timer.value);
	timer.value = setTimeout(update, 2500);
};

const update = () => {
	timer.value = undefined;
	pagingComponent.value?.runFilter();
};

const showTimelineFilter = $computed(
	defaultStore.makeGetterSetter("showTimelineFilter")
);
const showMentions = $computed(
	defaultStore.makeGetterSetter("filterShowMentions")
);
const showReplies = $computed(
	defaultStore.makeGetterSetter("filterShowReplies")
);
const showPosts = $computed(defaultStore.makeGetterSetter("filterShowPosts"));
const showBoosts = $computed(defaultStore.makeGetterSetter("filterShowBoosts"));
const showQuotes = $computed(defaultStore.makeGetterSetter("filterShowQuotes"));
const showPolls = $computed(defaultStore.makeGetterSetter("filterShowPolls"));
const showCws = $computed(defaultStore.makeGetterSetter("filterShowCws"));
const showNonCws = $computed(defaultStore.makeGetterSetter("filterShowNonCws"));
const displayParent = $computed(
	defaultStore.makeGetterSetter("filterDisplayParent")
);
const displayPreviews = $computed(
	defaultStore.makeGetterSetter("filterDisplayPreviews")
);
const displayMedia = $computed(
	defaultStore.makeGetterSetter("filterDisplayMedia")
);
const hideDuplicates = $computed(
	defaultStore.makeGetterSetter("filterHideDuplicates")
);

let duplicates: Record<string, boolean> = {};
const visibleCheck = (item: Note | false) => {
	if (item === false) {
		duplicates = {};
		return;
	}

	const appearNoteId = item.renoteId ? item.renoteId : item.id;

	const mentions = [
		...(item.mentions ?? []),
		...(item.renote?.mentions ?? []),
		...(item.reply?.mentions ?? []),
	];

	const mentioned = mentions.some((userId) => userId === $i?.id);
	const isReply = !!item.replyId;
	const isBoost = !!item.renoteId && !item.text;
	const isQuote = !!item.renoteId && !!item.text;
	const isPoll = !!item.poll;
	const hasCw = !!(item.cw || item.renote?.cw || item.reply?.cw);
	const isPost = !isReply && !isBoost && !isQuote && !isPoll;
	const isDuplicate = duplicates[appearNoteId];
	duplicates[appearNoteId] = true;

	if (isDuplicate && hideDuplicates.value) {
		return false;
	}

	let hide = false;
	let force = false;

	const test = (
		check: boolean,
		condition: "always" | "show" | "hide" | "never"
	): boolean => {
		if (!check) {
			return true;
		}
		switch (condition) {
			case "always":
				force = true;
				break;
			case "hide":
				hide = true;
				break;
			case "never":
				return false;
		}
		return true;
	};

	if (!test(mentioned, showMentions)) return false;
	if (!test(isPost, showPosts)) return false;
	if (!test(isReply, showReplies)) return false;
	if (!test(isBoost, showBoosts)) return false;
	if (!test(isQuote, showQuotes)) return false;
	if (!test(isPoll, showPolls)) return false;
	if (!test(hasCw, showCws)) return false;
	if (!test(!hasCw, showNonCws)) return false;

	if (force) {
		return true;
	}
	return !hide;
};

defineExpose({
	pagingComponent,
});
</script>

<style lang="scss" scoped>
.giivymft {
	&.noGap {
		> .notes {
			background: var(--panel);
			border-radius: var(--radius);
		}
	}
	&:not(.noGap) {
		> .notes {
			background: var(--bg);
			.qtqtichx {
				background: var(--panel);
				border-radius: var(--radius);
			}
		}
	}
}

.filter-block {
	.filter-item {
		margin-top: 0.5rem;
		&:first-child {
			margin-top: 0;
		}
		.novjtctn {
			padding-top: 0.25rem;
			padding-bottom: 0.25rem;
			> .label {
				margin-left: 0;
				text-align: center;
			}
			> .button {
				display: none;
			}
		}
	}
}
</style>
