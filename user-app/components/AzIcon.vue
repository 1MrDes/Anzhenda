<template>
	<image
		v-if="isMicIcon"
		class="az-icon-image"
		:src="iconSrc"
		:style="imageStyle"
		mode="aspectFit"
	/>
	<text v-else class="az-icon" :style="{ color, fontSize: renderSize + 'px' }">{{ glyph }}</text>
</template>

<script>
import { getZoomScale } from '@/utils/accessibility.js'

const glyphs = {
	home: '⌂',
	calendar: '▦',
	file: '▤',
	user: '◉',
	location: '⌖',
	bell: '◔',
	star: '★',
	right: '›',
	left: '‹',
	clipboard: '☰',
	pill: '✚',
	stethoscope: '✦',
	siren: '!',
	navigation: '➤',
	zap: '⚡',
	clock: '◷',
	check: '✓',
	locate: '◎',
	building: '▥',
	shield: '⛨',
	heart: '♥',
	award: '✪',
	message: '✉',
	phone: '☎',
	wallet: '▣',
	card: '▭',
	users: '◐',
	receipt: '🧾',
	plus: '+',
	camera: '⌗',
	mic: '🎤',
	type: 'T',
	contrast: '◐',
	help: '?',
	info: 'i',
	logout: '↪',
	activity: '⌁',
	close: '×'
}

export default {
	name: 'AzIcon',
	props: {
		name: { type: String, default: 'user' },
		size: { type: Number, default: 20 },
		color: { type: String, default: '#2D2D2D' }
	},
	computed: {
		iconScale() {
			const zoomScale = getZoomScale()
			if (zoomScale <= 1) return 1
			return 1 + (zoomScale - 1) * 0.5
		},
		renderSize() {
			return Math.round(this.size * this.iconScale)
		},
		isMicIcon() {
			return this.name === 'mic'
		},
		iconSrc() {
			const normalizedColor = String(this.color || '').trim().toUpperCase()
			return normalizedColor === '#FFFFFF'
				? '/static/voice-mic-white.svg'
				: '/static/voice-mic-green.svg'
		},
		imageStyle() {
			const iconSize = Math.round(this.renderSize * 0.9)
			const offsetY = Math.round(this.renderSize * -0.03)
			return {
				width: iconSize + 'px',
				height: iconSize + 'px',
				transform: `translateY(${offsetY}px)`
			}
		},
		glyph() {
			return glyphs[this.name] || glyphs.user
		}
	}
}
</script>

<style scoped>
.az-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 1em;
	height: 1em;
	font-family: Arial, "PingFang SC", sans-serif;
	font-weight: 700;
	line-height: 1;
	text-align: center;
	vertical-align: middle;
	flex-shrink: 0;
}

.az-icon-image {
	display: block;
	flex-shrink: 0;
	vertical-align: middle;
}
</style>
