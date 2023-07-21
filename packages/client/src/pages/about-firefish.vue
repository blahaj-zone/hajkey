<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :actions="headerActions" :tabs="headerTabs"
		/></template>
		<div style="overflow: clip">
			<MkSpacer :content-max="600" :margin-min="20">
				<div class="_formRoot znqjceqz">
					<div id="debug"></div>
					<div
						ref="containerEl"
						v-panel
						class="_formBlock about"
						:class="{ playing: easterEggEngine != null }"
					>
						<img
							src="/client-assets/about-icon.png"
							alt=""
							class="icon"
							draggable="false"
							@load="iconLoaded"
							@click="gravity"
						/>
						<div class="misskey">Iceshrimp</div>
						<div class="version">v{{ version }}</div>
						<span
							v-for="emoji in easterEggEmojis"
							:key="emoji.id"
							class="emoji"
							:data-physics-x="emoji.left"
							:data-physics-y="emoji.top"
							:class="{
								_physics_circle_: !emoji.emoji.startsWith(':'),
							}"
							><MkEmoji
								class="emoji"
								:emoji="emoji.emoji"
								:custom-emojis="$instance.emojis"
								:is-reaction="false"
								:normal="true"
								:no-style="true"
						/></span>
					</div>
					<div class="_formBlock" style="text-align: center">
						{{ i18n.ts._aboutFirefish.about }}<br /><a
							href="https://iceshrimp.dev/"
							target="_blank"
							class="_link"
							>{{ i18n.ts.learnMore }}</a
						>
					</div>
					<div class="_formBlock" style="text-align: center">
						<MkButton primary rounded inline @click="iLoveMisskey"
							>I <Mfm text="$[jelly ❤]" /> #Iceshrimp</MkButton
						>
					</div>
					<FormSection>
						<div class="_formLinks">
							<FormLink
								to="https://iceshrimp.dev/iceshrimp/iceshrimp"
								external
							>
								<template #icon
									><i class="ph-code ph-bold ph-lg"></i
								></template>
								{{ i18n.ts._aboutFirefish.source }}
								<template #suffix>Iceshrimp development</template>
							</FormLink>
						</div>
					</FormSection>
				</div>
			</MkSpacer>
		</div>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount } from "vue";
import { version } from "@/config";
import FormLink from "@/components/form/link.vue";
import FormSection from "@/components/form/section.vue";
import MkButton from "@/components/MkButton.vue";
import MkLink from "@/components/MkLink.vue";
import MkSparkle from "@/components/MkSparkle.vue";
import { physics } from "@/scripts/physics";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";

let easterEggReady = false;
let easterEggEmojis = $ref([]);
let easterEggEngine = $ref(null);
const containerEl = $ref<HTMLElement>();

function iconLoaded() {
	const emojis = defaultStore.state.reactions;
	const containerWidth = containerEl?.offsetWidth;
	for (let i = 0; i < 32; i++) {
		easterEggEmojis.push({
			id: i.toString(),
			top: -(128 + Math.random() * 256),
			left: Math.random() * containerWidth,
			emoji: emojis[Math.floor(Math.random() * emojis.length)],
		});
	}

	nextTick(() => {
		easterEggReady = true;
	});
}

function gravity() {
	if (!easterEggReady) return;
	easterEggReady = false;
	easterEggEngine = physics(containerEl);
}

function iLoveMisskey() {
	os.post({
		initialText: "I $[jelly ❤] #Iceshrimp",
		instant: true,
	});
}

onBeforeUnmount(() => {
	if (easterEggEngine) {
		easterEggEngine.stop();
	}
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.aboutFirefish,
	icon: null,
});
</script>

<style lang="scss" scoped>
.znqjceqz {
	> .about {
		position: relative;
		text-align: center;
		padding: 16px;
		border-radius: var(--radius);

		&.playing {
			&,
			* {
				user-select: none;
			}

			* {
				will-change: transform;
			}

			> .emoji {
				visibility: visible;
			}
		}

		> .icon {
			display: block;
			width: 100px;
			margin: 0 auto;
			border-radius: 3px;
		}

		> .misskey {
			margin: 0.75em auto 0 auto;
			width: max-content;
		}

		> .version {
			margin: 0 auto;
			width: max-content;
			opacity: 0.5;
		}

		> .emoji {
			position: absolute;
			top: 0;
			left: 0;
			visibility: hidden;

			> .emoji {
				pointer-events: none;
				font-size: 24px;
				width: 24px;
			}
		}
	}
}
</style>
