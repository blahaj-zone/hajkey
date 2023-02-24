<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<div style="overflow: clip;">
		<MkSpacer :content-max="600" :margin-min="20">
			<div class="_formRoot">
				<FormSection>
					<template #label>{{ i18n.ts._apps.crossPlatform }}</template>
					<div class="_formBlock" style="text-align: center;">
						<pwa-install/>
						<MkButton primary rounded inline @click="installPwa">{{ i18n.ts._apps.pwa }}</MkButton>
					</div>
					<div class="_formLinks">
						<FormLink to="https://kaiteki.app" external>
							<template #icon>
								<i class="ph-android-logo-bold ph-xl"/>
								<i class="ph-windows-logo-bold ph-xl"/>
								<i class="ph-linux-logo-bold ph-xl"/>
							</template>
							{{ i18n.ts._apps.kaiteki }}
							<template #suffix>{{ i18n.ts._apps.firstClass }}, {{ i18n.ts._apps.free }}</template>
						</FormLink>
					</div>
				</FormSection>
				<FormSection>
					<template #label>{{ i18n.ts._apps.mobile }}</template>
					<div class="_formLinks">
						<FormLink to="https://play.google.com/store/apps/details?id=jp.panta.misskeyandroidclient" external>
							<template #icon>
								<i class="ph-android-logo-bold ph-xl"/>
							</template>
							{{ i18n.ts._apps.milktea }}
							<template #suffix>{{ i18n.ts._apps.firstClass }}, {{ i18n.ts._apps.free }}</template>
						</FormLink>
						<FormLink to="https://play.google.com/store/apps/details?id=jp.juggler.subwaytooter&gl=US" external>
							<template #icon>
								<i class="ph-android-logo-bold ph-xl"/>
							</template>
							{{ i18n.ts._apps.subwayTooter }}
							<template #suffix>{{ i18n.ts._apps.secondClass }}, {{ i18n.ts._apps.free }}</template>
						</FormLink>
						<!-- <FormLink to="https://apps.apple.com/app/kimis-a-client-for-misskey/id1667275125" external>
							<template #icon>
								<i class="ph-apple-logo-bold ph-xl"/>
							</template>
							{{ i18n.ts._apps.kimis }}
							<template #suffix>{{ i18n.ts._apps.secondClass }}, {{ i18n.ts._apps.paid }}</template>
						</FormLink> -->
					</div>
				</FormSection>
				<FormSection>
					<template #label>{{ i18n.ts.desktop }}</template>
					<div class="_formLinks">
						<FormLink to="https://thedesk.top/" external>
							<template #icon>
								<i class="ph-apple-logo-bold ph-xl"/>
								<i class="ph-windows-logo-bold ph-xl"/>
								<i class="ph-linux-logo-bold ph-xl"/>
							</template>
							{{ i18n.ts._apps.theDesk }}
							<template #suffix>{{ i18n.ts._apps.secondClass }}, {{ i18n.ts._apps.free }}</template>
						</FormLink>
						<FormLink to="https://github.com/AsPulse/lesskey" external>
							<template #icon>
								<i class="ph-terminal-window-bold ph-xl"/>
							</template>
							{{ i18n.ts._apps.lesskey }}
							<template #suffix>{{ i18n.ts._apps.secondClass }}, {{ i18n.ts._apps.free }}</template>
						</FormLink>
					</div>
				</FormSection>
			</div>
		</MkSpacer>
	</div>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import FormLink from '@/components/form/link.vue';
import FormSection from '@/components/form/section.vue';
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import '@khmyznikov/pwa-install';

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

function installPwa(ev: MouseEvent) {
	const pwaInstall = document.getElementsByTagName('pwa-install')[0];
	pwaInstall.showDialog();
}

definePageMetadata({
	title: i18n.ts._apps.apps,
	icon: null,
});
</script>
