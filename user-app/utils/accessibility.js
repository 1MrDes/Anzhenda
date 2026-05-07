import { reactive } from 'vue'

const FONT_STORAGE_KEY = 'fontSizeLevel'
const VOICE_STORAGE_KEY = 'voiceAssistantEnabled'

const FONT_LEVELS = {
	large: {
		base: 16,
		small: 15,
		subtitle: 18,
		title: 24,
		hero: 28
	},
	xlarge: {
		base: 24,
		small: 22,
		subtitle: 27,
		title: 36,
		hero: 44
	}
}

export const accessibilityState = reactive({
	inited: false,
	fontSizeLevel: 'large',
	voiceAssistantEnabled: true
})

function normalizeFontLevel(level) {
	return Object.prototype.hasOwnProperty.call(FONT_LEVELS, level) ? level : 'large'
}

function normalizeBoolean(value, fallback) {
	if (typeof value === 'boolean') return value
	if (value === 'true') return true
	if (value === 'false') return false
	return fallback
}

export function initAccessibilitySettings() {
	if (accessibilityState.inited) return

	const cachedFontLevel = uni.getStorageSync(FONT_STORAGE_KEY)
	const cachedVoiceEnabled = uni.getStorageSync(VOICE_STORAGE_KEY)
	const cachedZoomEnabled = uni.getStorageSync('zoomModeEnabled')

	let nextFontLevel = normalizeFontLevel(cachedFontLevel || 'large')
	if (!cachedFontLevel && normalizeBoolean(cachedZoomEnabled, false)) {
		nextFontLevel = 'xlarge'
	}

	accessibilityState.fontSizeLevel = nextFontLevel
	accessibilityState.voiceAssistantEnabled = normalizeBoolean(cachedVoiceEnabled, true)
	accessibilityState.inited = true
}

export function setFontSizeLevel(level) {
	const normalizedLevel = normalizeFontLevel(level)
	accessibilityState.fontSizeLevel = normalizedLevel
	uni.setStorageSync(FONT_STORAGE_KEY, normalizedLevel)
}

export function setVoiceAssistantEnabled(enabled) {
	const nextValue = Boolean(enabled)
	accessibilityState.voiceAssistantEnabled = nextValue
	uni.setStorageSync(VOICE_STORAGE_KEY, nextValue)
}

export function getFontSizeOptions() {
	return [
		{ value: 'large', label: '大' },
		{ value: 'xlarge', label: '超大' }
	]
}

export function getZoomScale() {
	return accessibilityState.fontSizeLevel === 'xlarge' ? 1.36 : 1
}

export function getVoiceFabSize() {
	return accessibilityState.fontSizeLevel === 'xlarge' ? 80 : 60
}

export function getAccessibilityCssVars() {
	const fontPreset = FONT_LEVELS[accessibilityState.fontSizeLevel] || FONT_LEVELS.large
	const zoomEnabled = accessibilityState.fontSizeLevel === 'xlarge'
	const baseSpace = zoomEnabled ? 28 : 20

	return {
		'--font-size-xs': `${fontPreset.small - 1}px`,
		'--font-size-small': `${fontPreset.small}px`,
		'--font-size-base': `${fontPreset.base}px`,
		'--font-size-subtitle': `${fontPreset.subtitle}px`,
		'--font-size-title': `${fontPreset.title}px`,
		'--font-size-hero': `${fontPreset.hero}px`,
		'--line-height-base': zoomEnabled ? '1.78' : '1.55',
		'--line-height-title': '1.35',
		'--page-padding-x': `${baseSpace}px`,
		'--page-padding-y': `${zoomEnabled ? 24 : 16}px`,
		'--section-gap': `${zoomEnabled ? 32 : 24}px`,
		'--card-gap': `${zoomEnabled ? 20 : 12}px`,
		'--card-padding': `${zoomEnabled ? 24 : 16}px`,
		'--card-padding-lg': `${zoomEnabled ? 28 : 20}px`,
		'--control-height': `${zoomEnabled ? 56 : 44}px`,
		'--control-height-lg': `${zoomEnabled ? 70 : 56}px`,
		'--touch-size': `${zoomEnabled ? 60 : 44}px`,
		'--touch-size-sm': `${zoomEnabled ? 52 : 40}px`,
		'--radius-card': `${zoomEnabled ? 20 : 16}px`,
		'--radius-card-lg': `${zoomEnabled ? 24 : 20}px`,
		'--radius-control': `${zoomEnabled ? 16 : 12}px`,
		'--radius-pill': '999px',
		'--icon-scale': String(getZoomScale()),
		'--voice-fab-size': `${getVoiceFabSize()}px`,
		'--voice-fab-right': `${zoomEnabled ? 28 : 20}px`,
		'--voice-fab-bottom': `${zoomEnabled ? 124 : 100}px`,
		'--bottom-panel-offset': `${zoomEnabled ? 90 : 72}px`
	}
}

export function useAccessibilitySettings() {
	return {
		state: accessibilityState,
		fontSizeOptions: getFontSizeOptions(),
		initAccessibilitySettings,
		setFontSizeLevel,
		setVoiceAssistantEnabled
	}
}
