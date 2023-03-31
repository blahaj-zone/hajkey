<template>
<div class="tdflqwzn" :class="{ isMe }">
	<XReaction v-for="(count, reaction) in note.reactions" :key="reaction" :reaction="reaction" :count="count" :is-initial="initialReactions.has(reaction)" :note="note"/>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as misskey from 'calckey-js';
import { $i } from '@/account';
import XReaction from '@/components/MkReactionsViewer.reaction.vue';

const props = defineProps<{
	note: misskey.entities.Note;
}>();

const initialReactions = new Set(Object.keys(props.note.reactions));

const isMe = computed(() => $i && $i.id === props.note.userId);
</script>

<style lang="scss" scoped>
.tdflqwzn {
	margin-inline: -2px;
	margin-top: .2em;
	width: 100%;
	
	&:empty {
		display: none;
	}

	&.isMe {
		> span {
			cursor: default !important;
		}
	}
}
</style>
