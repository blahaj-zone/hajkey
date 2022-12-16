<template>
<div>
	<MkSpacer :content-max="800">
		<MkPagination v-slot="{items}" ref="list" :pagination="pagination">
			<MkA v-for="item in items" :key="item.id" :to="`/clips/${item.id}`" class="item _panel _gap">
				<div class="_panel">
					<b>{{ item.name }}</b>
					<Mfm v-if="item.description" class="description" :text="item.description"/>
				</div>
			</MkA>
		</MkPagination>
	</MkSpacer>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import * as misskey from 'calckey-js';
import MkPagination from '@/components/MkPagination.vue';

const props = defineProps<{
	user: misskey.entities.User;
}>();

const pagination = {
	endpoint: 'users/clips' as const,
	limit: 20,
	params: computed(() => ({
		userId: props.user.id,
	})),
};
</script>

<style lang="scss" scoped>

</style>
