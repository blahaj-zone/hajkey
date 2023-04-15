<template>
	<button
		class="kpoogebi _button"
		:class="{
			wait,
			active: isFollowing || hasPendingFollowRequestFromYou,
			full,
			large,
			blocking: isBlocking,
		}"
		:disabled="wait"
		@click="onClick"
	>
		<template v-if="!wait">
			<template v-if="isBlocking">
				<span v-if="full">{{ i18n.ts.blocked }}</span
				><i class="ph-prohibit ph-bold ph-lg"></i>
			</template>
			<template
				v-else-if="hasPendingFollowRequestFromYou && user.isLocked"
			>
				<span v-if="full">{{ i18n.ts.followRequestPending }}</span
				><i class="ph-hourglass-medium ph-bold ph-lg"></i>
			</template>
			<template
				v-else-if="hasPendingFollowRequestFromYou && !user.isLocked"
			>
				<!-- つまりリモートフォローの場合。 -->
				<span v-if="full">{{ i18n.ts.processing }}</span
				><i class="ph-circle-notch ph-bold ph-lg fa-pulse"></i>
			</template>
			<template v-else-if="isFollowing">
				<span v-if="full">{{ i18n.ts.unfollow }}</span
				><i class="ph-minus ph-bold ph-lg"></i>
			</template>
			<template v-else-if="!isFollowing && user.isLocked">
				<span v-if="full">{{ i18n.ts.followRequest }}</span
				><i class="ph-plus ph-bold ph-lg"></i>
			</template>
			<template v-else-if="!isFollowing && !user.isLocked">
				<span v-if="full">{{ i18n.ts.follow }}</span
				><i class="ph-plus ph-bold ph-lg"></i>
			</template>
		</template>
		<template v-else>
			<span v-if="full">{{ i18n.ts.processing }}</span
			><i class="ph-circle-notch ph-bold ph-lg fa-pulse ph-fw ph-lg"></i>
		</template>
	</button>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import type * as Misskey from "calckey-js";
import * as os from "@/os";
import { stream } from "@/stream";
import { i18n } from "@/i18n";

const emit = defineEmits(["refresh"]);
const props = withDefaults(
	defineProps<{
		user: Misskey.entities.UserDetailed;
		full?: boolean;
		large?: boolean;
	}>(),
	{
		full: false,
		large: false,
	}
);

const isBlocking = computed(() => props.user.isBlocking);

let isFollowing = $ref(props.user.isFollowing);
let hasPendingFollowRequestFromYou = $ref(
	props.user.hasPendingFollowRequestFromYou
);
let wait = $ref(false);
const connection = stream.useChannel("main");

if (props.user.isFollowing == null) {
	os.api("users/show", {
		userId: props.user.id,
	}).then(onFollowChange);
}

function onFollowChange(user: Misskey.entities.UserDetailed) {
	if (user.id === props.user.id) {
		isFollowing = user.isFollowing;
		hasPendingFollowRequestFromYou = user.hasPendingFollowRequestFromYou;
	}
}

async function onClick() {
	wait = true;

	try {
		if (isBlocking.value) {
			const { canceled } = await os.confirm({
				type: "warning",
				text: i18n.t("unblockConfirm"),
			});
			if (canceled) return;

			await os.api("blocking/delete", {
				userId: props.user.id,
			});
			if (props.user.isMuted) {
				await os.api("mute/delete", {
					userId: props.user.id,
				});
			}
			emit("refresh");
		} else if (isFollowing) {
			const { canceled } = await os.confirm({
				type: "warning",
				text: i18n.t("unfollowConfirm", {
					name: props.user.name || props.user.username,
				}),
			});

			if (canceled) return;

			await os.api("following/delete", {
				userId: props.user.id,
			});
		} else {
			if (hasPendingFollowRequestFromYou) {
				await os.api("following/requests/cancel", {
					userId: props.user.id,
				});
				hasPendingFollowRequestFromYou = false;
			} else {
				await os.api("following/create", {
					userId: props.user.id,
				});
				hasPendingFollowRequestFromYou = true;
			}
		}
	} catch (err) {
		console.error(err);
	} finally {
		wait = false;
	}
}

onMounted(() => {
	connection.on("follow", onFollowChange);
	connection.on("unfollow", onFollowChange);
});

onBeforeUnmount(() => {
	connection.dispose();
});
</script>

<style lang="scss" scoped>
.kpoogebi {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
	color: var(--accent);
	border: solid 1px var(--accent);
	padding: 0;
	height: 31px;
	font-size: 16px;
	border-radius: 32px;
	background: var(--bg);

	&.full {
		padding: 0 8px 0 12px;
		font-size: 14px;
	}

	&.large {
		font-size: 16px;
		height: 38px;
		padding: 0 12px 0 16px;
	}

	&:not(.full) {
		width: 31px;
	}

	&:focus-visible {
		&:after {
			content: "";
			pointer-events: none;
			position: absolute;
			top: -5px;
			right: -5px;
			bottom: -5px;
			left: -5px;
			border: 2px solid var(--focus);
			border-radius: 32px;
		}
	}

	&:hover {
		//background: mix($primary, #fff, 20);
	}

	&:active {
		//background: mix($primary, #fff, 40);
	}

	&.active {
		color: #fff;
		background: var(--accent);

		&:hover {
			background: var(--accentLighten);
			border-color: var(--accentLighten);
		}

		&:active {
			background: var(--accentDarken);
			border-color: var(--accentDarken);
		}
	}

	&.wait {
		cursor: wait !important;
		opacity: 0.7;
	}

	> span {
		margin-right: 6px;
	}
}

.blocking {
	background-color: var(--bg) !important;
	border: none;
}
</style>
