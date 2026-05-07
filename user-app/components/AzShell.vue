<template>
	<view class="az-shell" :class="{ 'zoom-mode': isXLargeMode }" :style="shellStyle">
		<slot />
		<AzBottomNav :active="active" />
		<AzVoiceAssistant v-if="settings.voiceAssistantEnabled" :config="voiceConfig" />
	</view>
</template>

<script>
import AzBottomNav from './AzBottomNav.vue'
import AzVoiceAssistant from './AzVoiceAssistant.vue'
import {
	accessibilityState,
	getAccessibilityCssVars,
	initAccessibilitySettings
} from '@/utils/accessibility.js'

export default {
	name: 'AzShell',
	components: { AzBottomNav, AzVoiceAssistant },
	props: {
		active: { type: String, default: '' },
		voiceConfig: {
			type: Object,
			default: () => ({})
		}
	},
	computed: {
		settings() {
			return accessibilityState
		},
		isXLargeMode() {
			return this.settings.fontSizeLevel === 'xlarge'
		},
		shellStyle() {
			return getAccessibilityCssVars()
		}
	},
	created() {
		initAccessibilitySettings()
	}
}
</script>

<style scoped>
.az-shell {
	min-height: 100vh;
	background: #FAFAF8;
	font-size: var(--font-size-base);
	line-height: var(--line-height-base);
}

.az-shell :deep(.page) {
	font-size: var(--font-size-base);
	line-height: var(--line-height-base);
}

.az-shell :deep(.title),
.az-shell :deep(.sheet-title),
.az-shell :deep(.section-title),
.az-shell :deep(.h2),
.az-shell :deep(.service-title),
.az-shell :deep(.setting-label),
.az-shell :deep(.card-name),
.az-shell :deep(.member-name),
.az-shell :deep(.order-card .service-name),
.az-shell :deep(.step-label),
.az-shell :deep(.activity-title),
.az-shell :deep(.person-name),
.az-shell :deep(.voice-state-text),
.az-shell :deep(.time-period-label) {
	font-size: var(--font-size-title) !important;
	line-height: var(--line-height-title) !important;
}

.az-shell :deep(.hello),
.az-shell :deep(.name),
.az-shell :deep(.hero .title),
.az-shell :deep(.sheet-title),
.az-shell :deep(.cert-name) {
	font-size: var(--font-size-hero) !important;
	line-height: var(--line-height-title) !important;
}

.az-shell :deep(.sub),
.az-shell :deep(.hint),
.az-shell :deep(.desc),
.az-shell :deep(.service-desc),
.az-shell :deep(.location-text),
.az-shell :deep(.detail-line),
.az-shell :deep(.pay-tip),
.az-shell :deep(.voice-info-btn),
.az-shell :deep(.hospital),
.az-shell :deep(.section-heading),
.az-shell :deep(.tab),
.az-shell :deep(.quick-title),
.az-shell :deep(.quick),
.az-shell :deep(.confirm-btn),
.az-shell :deep(.review-text),
.az-shell :deep(.value),
.az-shell :deep(.activity-date),
.az-shell :deep(.label),
.az-shell :deep(.score),
.az-shell :deep(.line),
.az-shell :deep(.fee-line),
.az-shell :deep(.total-line),
.az-shell :deep(.swipe-text),
.az-shell :deep(.active-title),
.az-shell :deep(.active-desc),
.az-shell :deep(.date),
.az-shell :deep(.time-period-range) {
	font-size: var(--font-size-subtitle) !important;
	line-height: var(--line-height-base) !important;
}

.az-shell :deep(.meta),
.az-shell :deep(.muted),
.az-shell :deep(.week),
.az-shell :deep(.status),
.az-shell :deep(.tag),
.az-shell :deep(.outline-tag),
.az-shell :deep(.phone),
.az-shell :deep(.relation),
.az-shell :deep(.order-id),
.az-shell :deep(.review-date),
.az-shell :deep(.small-stars),
.az-shell :deep(.time),
.az-shell :deep(.time-period-tip),
.az-shell :deep(.voice-retry-btn),
.az-shell :deep(.card-title),
.az-shell :deep(.stat-label),
.az-shell :deep(.count),
.az-shell :deep(.from),
.az-shell :deep(.swipe-tip),
.az-shell :deep(.tap-confirm),
.az-shell :deep(.urgent-badge),
.az-shell :deep(.service-order),
.az-shell :deep(.hospital-order) {
	font-size: var(--font-size-small) !important;
	line-height: var(--line-height-base) !important;
}

.az-shell.zoom-mode :deep(.page) {
	letter-spacing: 0;
}

.az-shell.zoom-mode :deep(.card),
.az-shell.zoom-mode :deep(.order-card),
.az-shell.zoom-mode :deep(.member-card),
.az-shell.zoom-mode :deep(.review-card),
.az-shell.zoom-mode :deep(.service-card),
.az-shell.zoom-mode :deep(.map-preview),
.az-shell.zoom-mode :deep(.matched-card),
.az-shell.zoom-mode :deep(.detail-card),
.az-shell.zoom-mode :deep(.stats-card),
.az-shell.zoom-mode :deep(.companion-card),
.az-shell.zoom-mode :deep(.quick-sheet),
.az-shell.zoom-mode :deep(.sheet),
.az-shell.zoom-mode :deep(.voice-sheet) {
	padding: var(--card-padding-lg) !important;
	border-radius: var(--radius-card-lg) !important;
}

.az-shell.zoom-mode :deep(.tabs),
.az-shell.zoom-mode :deep(.toggle-row),
.az-shell.zoom-mode :deep(.service-list),
.az-shell.zoom-mode :deep(.section),
.az-shell.zoom-mode :deep(.content),
.az-shell.zoom-mode :deep(.list),
.az-shell.zoom-mode :deep(.sections),
.az-shell.zoom-mode :deep(.map-section),
.az-shell.zoom-mode :deep(.list-section),
.az-shell.zoom-mode :deep(.service-section) {
	padding-left: var(--page-padding-x) !important;
	padding-right: var(--page-padding-x) !important;
}

.az-shell.zoom-mode :deep(.toggle-btn),
.az-shell.zoom-mode :deep(.primary-btn),
.az-shell.zoom-mode :deep(.muted-btn),
.az-shell.zoom-mode :deep(.outline),
.az-shell.zoom-mode :deep(.quick),
.az-shell.zoom-mode :deep(.confirm-btn),
.az-shell.zoom-mode :deep(.voice-info-btn),
.az-shell.zoom-mode :deep(.bind-btn),
.az-shell.zoom-mode :deep(.submit),
.az-shell.zoom-mode :deep(.pay-method),
.az-shell.zoom-mode :deep(.hospital),
.az-shell.zoom-mode :deep(.time-period-card),
.az-shell.zoom-mode :deep(.date-pill),
.az-shell.zoom-mode :deep(.quick-order),
.az-shell.zoom-mode :deep(.voice-retry-btn),
.az-shell.zoom-mode :deep(.command-chip),
.az-shell.zoom-mode :deep(.pay-fixed .swipe),
.az-shell.zoom-mode :deep(.logout) {
	min-height: var(--control-height) !important;
	border-radius: var(--radius-control) !important;
}

.az-shell.zoom-mode :deep(.confirm-btn),
.az-shell.zoom-mode :deep(.bind-btn),
.az-shell.zoom-mode :deep(.submit),
.az-shell.zoom-mode :deep(.quick),
.az-shell.zoom-mode :deep(.quick-order),
.az-shell.zoom-mode :deep(.pay-fixed .swipe),
.az-shell.zoom-mode :deep(.paid) {
	min-height: var(--control-height-lg) !important;
}

.az-shell.zoom-mode :deep(.item-icon),
.az-shell.zoom-mode :deep(.service-icon),
.az-shell.zoom-mode :deep(.icon-bg),
.az-shell.zoom-mode :deep(.hero-icon),
.az-shell.zoom-mode :deep(.activity-icon),
.az-shell.zoom-mode :deep(.detail-icon),
.az-shell.zoom-mode :deep(.camera),
.az-shell.zoom-mode :deep(.plus),
.az-shell.zoom-mode :deep(.match-check),
.az-shell.zoom-mode :deep(.locate-icon) {
	width: var(--touch-size) !important;
	height: var(--touch-size) !important;
}

.az-shell.zoom-mode :deep(.switch) {
	width: 58px !important;
	height: 34px !important;
}

.az-shell.zoom-mode :deep(.switch view) {
	width: 28px !important;
	height: 28px !important;
}

.az-shell.zoom-mode :deep(.fixed-confirm),
.az-shell.zoom-mode :deep(.bottom-bar),
.az-shell.zoom-mode :deep(.pay-fixed) {
	bottom: var(--bottom-panel-offset) !important;
}
</style>
