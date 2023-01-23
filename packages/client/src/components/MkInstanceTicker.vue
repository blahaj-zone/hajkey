<template>
<div class="hpaizdrt">
	<div class="pill" :style="pillStyle" :data-contrasts="contrasts">
		<div class="icon">
			<img v-if="instance.faviconUrl" class="icon" :src="instance.faviconUrl" aria-hidden="true"/>
		</div>
		<span class="name" :style="nameStyle">{{ instance.name }}</span>
	</div>
</div>
</template>

<script lang="ts" setup>
import { instanceName } from '@/config';
import { instance as Instance } from '@/instance';

const props = defineProps<{
	instance?: {
		faviconUrl?: string
		iconUrl?: string
		name: string
		themeColor?: string
	}
}>();

// if no instance data is given, this is for the local instance
const instance = props.instance ?? {
	faviconUrl: Instance.iconUrl || Instance.faviconUrl || '/favicon.ico',
	name: instanceName,
	themeColor: (document.querySelector('meta[name="theme-color-orig"]') as HTMLMetaElement)?.content
};

const themeColor = instance.themeColor ?? '#3088D4';

const [r, g, b] = (themeColor.match(/\w\w/g)?.map(x => parseInt(x, 16) / 255)) as [number, number, number];
const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
const lum = 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;

const contrastWithBlack = (lum + 0.05) / 0.05;
const contrastWithWhite = (1.0 + 0.05) / (lum + 0.05);
const isLight = contrastWithBlack > contrastWithWhite;

const contrasts = `${contrastWithBlack.toFixed(2)}:${contrastWithWhite.toFixed(2)}`;
const textColor = isLight ? '#101010' : '#f0f0f0';
const textShadow = isLight ? '#ffffff 1px 1px 1px' : '#000000 0 2px 2px';

const pillStyle = {
	border: `1px solid ${themeColor}`,
	background: `linear-gradient(90deg, ${themeColor}, ${themeColor}AA)`,
}
const nameStyle = {
	color: textColor,
	textShadow: textShadow,
};
</script>

<style lang="scss" scoped>
.hpaizdrt {
	$height: 1.1rem;

	height: 1.3rem;
	padding: 0;
	justify-self: flex-end;
	overflow: hidden;
	
	.pill {
		height: $height;
		border-radius: 1em;
		display: inline-block;

		> .icon {
			height: 100%;
			background: #fff;
			width: 1.5rem;
			border-radius: 1em 0 0 1em;
			display: inline-block;
			
			> img {
				height: 0.9em;
				margin: 0.1em 0 0 0.4em;
			}
		}

		> .name {
			font-size: 0.9em;
			line-height: $height;
			margin: 0 0.5em 0 0.1em;
			vertical-align: top;
			font-weight: bold;
			text-overflow: clip;
		}
	}
}
</style>
