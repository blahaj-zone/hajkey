<template>
<header class="kkwtjztg">
	<MkA v-user-preview="note.user.id" class="name" :to="userPage(note.user)">
		<MkUserName :user="note.user" class="mkusername">
			<span v-if="note.user.isBot" class="is-bot">bot</span>
		</MkUserName>
	</MkA>
	<div class="username"><MkAcct :user="note.user"/></div>
	<div class="info">
		<MkA class="created-at" :to="notePage(note)">
			<MkTime :time="note.createdAt"/>
		</MkA>
		<MkVisibility :note="note"/>
	</div>
</header>
</template>

<script lang="ts" setup>
import { } from 'vue';
import type * as misskey from 'calckey-js';
import MkVisibility from '@/components/MkVisibility.vue';
import { notePage } from '@/filters/note';
import { userPage } from '@/filters/user';

defineProps<{
	note: misskey.entities.Note;
	pinned?: boolean;
}>();
</script>

<style lang="scss" scoped>
.kkwtjztg {
	display: flex;
	align-items: baseline;
	white-space: nowrap;
	justify-self: flex-end;
	padding: .1em .7em;
	border-radius: 100px;
	font-size: .8em;
	text-shadow: 0 2px 2px var(--shadow);

	> .name {
		flex-shrink: 1;
		display: block;
		margin: 0 .5em 0 0;
		padding: 0;
		overflow: hidden;
		font-size: 1.2em;
		font-weight: bold;
		text-decoration: none;
		text-overflow: ellipsis;

		>.mkusername >.is-bot {
			flex-shrink: 0;
			align-self: center;
			margin: 0 .5em 0 0;
			padding: 1px 6px;
			font-size: 80%;
			border: solid 0.5px var(--divider);
			border-radius: 3px;
		}

		&:hover {
			text-decoration: underline;
		}
	}

	> .username {
		flex-shrink: 9999999;
		margin: 0 .5em 0 0;
		overflow: hidden;
		text-overflow: ellipsis;
		grid-row: 2;
		align-self: flex-start;
	}

	> .info {
		flex-shrink: 0;
		margin-left: auto;
		font-size: 0.9em;
	}
}
</style>
