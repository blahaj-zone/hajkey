<template>
	<div class="zlxnikvl">
		<XPie class="pie" :value="usage" />
		<div>
			<p><i class="ph-microchip ph-bold ph-lg"></i>RAM</p>
			<p>Total: {{ bytes(total, 1) }}</p>
			<p>Used: {{ bytes(used, 1) }}</p>
			<p>Free: {{ bytes(free, 1) }}</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from "vue";
import XPie from "./pie.vue";
import bytes from "@/filters/bytes";

const props = defineProps<{
	connection: any;
	meta: any;
}>();

let usage: number = $ref(0),
	total: number = $ref(0),
	used: number = $ref(0),
	free: number = $ref(0);

function onStats(stats) {
	usage = stats.mem.active / stats.mem.total;
	total = stats.mem.total;
	used = stats.mem.active;
	free = total - used;
}

onMounted(() => {
	props.connection.on("stats", onStats);
});

onBeforeUnmount(() => {
	props.connection.off("stats", onStats);
});
</script>

<style lang="scss" scoped>
.zlxnikvl {
	display: flex;
	padding: 16px;

	> .pie {
		height: 82px;
		flex-shrink: 0;
		margin-right: 16px;
	}

	> div {
		flex: 1;

		> p {
			margin: 0;
			font-size: 0.8em;

			&:first-child {
				font-weight: bold;
				margin-bottom: 4px;

				> i {
					margin-right: 4px;
				}
			}
		}
	}
}
</style>
