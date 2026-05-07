<script>
import { initAccessibilitySettings } from '@/utils/accessibility.js'
import { initFamilyCareStore } from '@/utils/family-care.js'
import { stopVoicePlayback } from '@/utils/voice-player.js'

export default {
	onLaunch() {
		initAccessibilitySettings()
		initFamilyCareStore()
		console.log('App Launch')
	},
	onShow() {
		console.log('App Show')
	},
	onHide() {
		stopVoicePlayback()
		console.log('App Hide')
	}
}
</script>

<style>
page {
	background: #FAFAF8;
	color: #2D2D2D;
	font-family: "PingFang SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	font-size: 16px;
	line-height: 1.55;
}

view,
text,
scroll-view,
button,
input,
textarea {
	box-sizing: border-box;
}

text,
button,
input,
textarea {
	font-size: inherit;
	line-height: inherit;
}

button {
	margin: 0;
	padding: 0;
	background: transparent;
	border: 0;
	line-height: 1;
}

button::after {
	border: 0;
}

.safe-bottom {
	padding-bottom: calc(24px + env(safe-area-inset-bottom));
}
</style>
