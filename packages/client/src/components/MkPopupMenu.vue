<template>
	<MkModal
		ref="modal"
		v-slot="{ type, maxHeight }"
		:z-priority="'high'"
		:src="src"
		:transparent-bg="true"
		@click="modal.close()"
		@closed="emit('closed')"
		tabindex="-1"
		v-focus
	>
		<MkMenu
			:items="items"
			:align="align"
			:width="width"
			:max-height="maxHeight"
			:as-drawer="type === 'drawer'"
			class="sfhdhdhq"
			:class="{
				drawer: type === 'drawer',
				...classMap(classes),
			}"
			@close="modal.close()"
		/>
	</MkModal>
</template>

<script lang="ts" setup>
import MkModal from "./MkModal.vue";
import MkMenu from "./MkMenu.vue";
import { MenuClasses, MenuItem } from "@/types/menu";

defineProps<{
	items: MenuItem[];
	align?: "center" | string;
	width?: number;
	viaKeyboard?: boolean;
	src?: any;
	classes?: MenuClasses;
}>();

const emit = defineEmits<{
	(ev: "closed"): void;
}>();

let modal = $ref<InstanceType<typeof MkModal>>();

function classMap(classes?: MenuClasses) {
	if (!classes) return {};

	return (Array.isArray(classes) ? classes : classes.value).reduce(
		(acc, cls) => {
			acc[cls] = true;
			return acc;
		},
		{}
	);
}
</script>

<style lang="scss" scoped>
.sfhdhdhq {
	&.drawer {
		border-radius: 24px;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0;
	}
}
</style>
