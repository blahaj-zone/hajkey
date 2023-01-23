<template>
<div class="hpaizdrt" :style="border">
	<img v-if="instance.faviconUrl" class="icon" :src="instance.faviconUrl" aria-hidden="true"/>
	<span class="name" :style="bg">{{ instance.name }}</span>
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

const [r, g, b] = (themeColor.match(/\w\w/g)?.map(x => parseInt(x, 16))) as [number, number, number];
const rLum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const textColor = rLum > 0.179 ? '#101010' : '#f0f0f0';
const shadowColor = rLum <= 0.179 ? '#000000' : '#ffffff';
const shadowBlur = rLum <= 0.179 ? '0 2px 2px' : '1px 1px 1px';

const bg = {
	color: textColor,
	textShadow: ` ${shadowColor} ${shadowBlur}`,
	background: `linear-gradient(90deg, ${themeColor}, ${themeColor}AA)`,
};
const border = {
	border: `1px solid ${themeColor}`,
};
</script>

<style lang="scss" scoped>
.hpaizdrt {
	$height: 1.1rem;

	height: $height;
	padding: 0;
	justify-self: flex-end;
	border-radius: 100px;
	font-size: .8em;
	overflow: hidden;

	> .icon {
    height: 90%;
    margin: 0 0 0 0.25em;
	}

	> .name {
    padding: 0.3em 0.9em;
		margin-left: 4px;
		line-height: $height;
		font-size: 0.9em;
		vertical-align: top;
		font-weight: bold;
		text-overflow: clip;
	}
}
</style>
