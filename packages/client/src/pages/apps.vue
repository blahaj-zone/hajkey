<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader :actions="headerActions" :tabs="headerTabs"
		/></template>
		<div style="overflow: clip">
			<MkSpacer :content-max="600" :margin-min="20">
				<div class="_formRoot">
					<FormSection>
						<template #label>{{
							i18n.ts._apps.crossPlatform
						}}</template>
						<div class="_formBlock" style="text-align: center">
							<pwa-install />
							<MkButton
								primary
								rounded
								inline
								@click="installPwa"
								>{{ i18n.ts._apps.pwa }}</MkButton
							>
						</div>
						<div class="_formLinks">
							<FormLink to="https://kaiteki.app" external>
								<template #icon>
									<i class="ph-android-logo ph-bold ph-xl" />
									<i class="ph-windows-logo ph-bold ph-xl" />
									<i class="ph-linux-logo ph-bold ph-xl" />
								</template>
								{{ i18n.ts._apps.kaiteki }}
								<template #suffix
									>{{ i18n.ts._apps.firstClass }},
									{{ i18n.ts._apps.free }}</template
								>
							</FormLink>
						</div>
					</FormSection>
					<FormSection>
						<template #label>{{ i18n.ts._apps.mobile }}</template>
						<div class="_formLinks">
							<FormLink
								to="https://play.google.com/store/apps/details?id=jp.panta.misskeyandroidclient"
								external
							>
								<template #icon>
									<i class="ph-android-logo ph-bold ph-xl" />
								</template>
								{{ i18n.ts._apps.milktea }}
								<template #suffix
									>{{ i18n.ts._apps.firstClass }},
									{{ i18n.ts._apps.free }}</template
								>
							</FormLink>
							<FormLink
								to="https://testflight.apple.com/join/xNdgUbh6"
								external
							>
								<template #icon>
									<i class="ph-apple-logo ph-bold ph-xl" />
								</template>
								{{ i18n.ts._apps.mona }}
								<template #suffix
									>{{ i18n.ts._apps.thirdClass }},
									{{ i18n.ts._apps.free }}</template
								>
							</FormLink>
						</div>
					</FormSection>
					<FormSection>
						<template #label>{{ i18n.ts.desktop }}</template>
						<div class="_formLinks">
							<FormLink to="https://thedesk.top/" external>
								<template #icon>
									<i class="ph-apple-logo ph-bold ph-xl" />
									<i class="ph-windows-logo ph-bold ph-xl" />
									<i class="ph-linux-logo ph-bold ph-xl" />
								</template>
								{{ i18n.ts._apps.theDesk }}
								<template #suffix
									>{{ i18n.ts._apps.secondClass }},
									{{ i18n.ts._apps.free }}</template
								>
							</FormLink>
							<FormLink
								to="https://uboar.github.io/missli/"
								external
							>
								<template #icon>
									<i class="ph-globe ph-bold ph-xl" />
								</template>
								{{ i18n.ts._apps.missLi }}
								<template #suffix
									>{{ i18n.ts._apps.secondClass }},
									{{ i18n.ts._apps.free }}</template
								>
							</FormLink>
						</div>
					</FormSection>
				</div>
			</MkSpacer>
		</div>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import FormLink from "@/components/form/link.vue";
import FormSection from "@/components/form/section.vue";
import MkButton from "@/components/MkButton.vue";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import "@khmyznikov/pwa-install";

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

function installPwa(ev: MouseEvent) {
	const pwaInstall = document.getElementsByTagName("pwa-install")[0];
	pwaInstall.showDialog();
}

definePageMetadata({
	title: i18n.ts._apps.apps,
	icon: null,
});
</script>
