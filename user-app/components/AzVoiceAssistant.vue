<template>
	<view>
		<view
			class="voice-fab"
			:class="{ dragging: fabDragging }"
			:style="fabStyle"
			@touchstart.stop="handleFabTouchStart"
			@touchmove.stop.prevent="handleFabTouchMove"
			@touchend.stop="handleFabTouchEnd"
			@touchcancel.stop="handleFabTouchCancel"
		>
			<AzIcon name="mic" :size="24" color="#FFFFFF" />
		</view>

		<view v-if="open" class="sheet-mask" @tap="closeSheet">
			<view class="voice-sheet" @tap.stop>
				<view class="sheet-handle" />
				<text class="sheet-title">{{ panelTitle }}</text>
				<text class="sheet-desc">{{ statusText }}</text>
				<text v-if="recognizedText" class="recognized-text">{{ recognizedText }}</text>

				<view class="mic-wrap">
					<view v-if="listening" class="pulse-ring pulse-a" />
					<view v-if="listening" class="pulse-ring pulse-b" />
					<view class="mic-large" :class="{ listening }" @tap="toggleListening">
						<AzIcon name="mic" :size="32" :color="listening ? '#FFFFFF' : '#6B7280'" />
					</view>
				</view>

				<text class="try-title">试试这样说：</text>
				<view class="command-row">
					<text
						v-for="cmd in commands"
						:key="cmd"
						class="command-chip"
						@tap="handleCommandChip(cmd)"
					>
						{{ cmd }}
					</text>
				</view>

				<view class="close-btn" @tap="closeSheet">
					<AzIcon name="close" :size="24" color="#9CA3AF" />
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import AzIcon from './AzIcon.vue'
import { recognizeSingleSentence, cancelSpeechRecognition } from '@/utils/aliyun-speech.js'
import { getDefaultVoiceCommandHints, parseVoiceCommand } from '@/utils/voice-command.js'
import { getVoiceFabSize, initAccessibilitySettings } from '@/utils/accessibility.js'

const FAB_STORAGE_KEY = 'az_voice_fab_position'

function normalizeHandleResult(result) {
	if (typeof result === 'boolean') {
		return {
			handled: result
		}
	}

	if (!result || typeof result !== 'object') {
		return {
			handled: Boolean(result)
		}
	}

	return {
		handled: Boolean(result.handled),
		continueListening: Boolean(result.continueListening),
		keepOpen: Boolean(result.keepOpen),
		delayMs: Number(result.delayMs || 0)
	}
}

export default {
	name: 'AzVoiceAssistant',
	components: { AzIcon },
	props: {
		config: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			open: false,
			listening: false,
			recognizedText: '',
			lastError: '',
			relistenTimer: null,
			fabDragging: false,
			fabMoved: false,
			fabPosition: {
				left: 0,
				top: 0
			},
			dragStartPoint: {
				x: 0,
				y: 0
			},
			dragStartPosition: {
				left: 0,
				top: 0
			},
			screenSize: {
				width: 375,
				height: 667,
				safeBottom: 0
			},
			ownerRoute: ''
		}
	},
	computed: {
		fabPixelSize() {
			return getVoiceFabSize()
		},
		fabStyle() {
			return {
				left: `${this.fabPosition.left}px`,
				top: `${this.fabPosition.top}px`,
				width: `${this.fabPixelSize}px`,
				height: `${this.fabPixelSize}px`
			}
		},
		panelTitle() {
			return (this.config && this.config.panelTitle) || '语音助手'
		},
		commands() {
			return (this.config && this.config.commandHints && this.config.commandHints.length)
				? this.config.commandHints
				: getDefaultVoiceCommandHints()
		},
		statusText() {
			if (!this.config || !this.config.onCommand) {
				return '当前页面暂未接入语音指令'
			}
			if (this.listening) {
				return '正在聆听，请说出您的需求...'
			}
			if (this.lastError) {
				return this.lastError
			}
			return (this.config && this.config.statusText) || '点击下方按钮开始说话'
		}
	},
	watch: {
		fabPixelSize() {
			this.fabPosition = this.clampFabPosition(this.fabPosition.left, this.fabPosition.top)
			this.persistFabPosition()
		}
	},
	mounted() {
		initAccessibilitySettings()
		this.ownerRoute = this.getCurrentPageRoute()
		this.initializeFabPosition()
		uni.$on('az-voice-open', this.handleExternalOpen)
		uni.$on('az-voice-close', this.handleExternalClose)
		uni.$on('az-voice-listen', this.handleExternalListen)
	},
	beforeUnmount() {
		uni.$off('az-voice-open', this.handleExternalOpen)
		uni.$off('az-voice-close', this.handleExternalClose)
		uni.$off('az-voice-listen', this.handleExternalListen)
		this.clearRelistenTimer()
	},
	methods: {
		getCurrentPageRoute() {
			const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
			const currentPage = pages.length ? pages[pages.length - 1] : null
			return (currentPage && currentPage.route) || ''
		},
		isActivePage() {
			if (!this.ownerRoute) return true
			return this.getCurrentPageRoute() === this.ownerRoute
		},
		initializeFabPosition() {
			const systemInfo = uni.getSystemInfoSync ? uni.getSystemInfoSync() : {}
			const width = Number(systemInfo.windowWidth || systemInfo.screenWidth || 375)
			const height = Number(systemInfo.windowHeight || systemInfo.screenHeight || 667)
			const safeBottom = systemInfo.safeArea && systemInfo.safeArea.bottom
				? Math.max(0, height - systemInfo.safeArea.bottom)
				: 0

			this.screenSize = {
				width,
				height,
				safeBottom
			}

			const savedPosition = uni.getStorageSync(FAB_STORAGE_KEY)
			if (savedPosition && typeof savedPosition.left === 'number' && typeof savedPosition.top === 'number') {
				this.fabPosition = this.clampFabPosition(savedPosition.left, savedPosition.top)
				return
			}

			this.fabPosition = this.getDefaultFabPosition()
		},
		getDefaultFabPosition() {
			const left = this.screenSize.width - this.fabPixelSize - 20
			const top = this.screenSize.height - this.fabPixelSize - 100 - this.screenSize.safeBottom
			return this.clampFabPosition(left, top)
		},
		clampFabPosition(left, top) {
			const minLeft = 12
			const minTop = 80
			const maxLeft = Math.max(minLeft, this.screenSize.width - this.fabPixelSize - 12)
			const maxTop = Math.max(minTop, this.screenSize.height - this.fabPixelSize - 12 - this.screenSize.safeBottom)

			return {
				left: Math.min(Math.max(left, minLeft), maxLeft),
				top: Math.min(Math.max(top, minTop), maxTop)
			}
		},
		persistFabPosition() {
			uni.setStorageSync(FAB_STORAGE_KEY, {
				left: this.fabPosition.left,
				top: this.fabPosition.top
			})
		},
		handleFabTouchStart(event) {
			const touch = event.touches && event.touches[0]
			if (!touch) return

			this.fabDragging = true
			this.fabMoved = false
			this.dragStartPoint = {
				x: touch.clientX,
				y: touch.clientY
			}
			this.dragStartPosition = {
				left: this.fabPosition.left,
				top: this.fabPosition.top
			}
		},
		handleFabTouchMove(event) {
			if (!this.fabDragging) return
			const touch = event.touches && event.touches[0]
			if (!touch) return

			const deltaX = touch.clientX - this.dragStartPoint.x
			const deltaY = touch.clientY - this.dragStartPoint.y

			if (!this.fabMoved && (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6)) {
				this.fabMoved = true
			}

			this.fabPosition = this.clampFabPosition(
				this.dragStartPosition.left + deltaX,
				this.dragStartPosition.top + deltaY
			)
		},
		async handleFabTouchEnd() {
			if (!this.fabDragging) return
			const moved = this.fabMoved
			this.fabDragging = false
			this.fabMoved = false
			this.persistFabPosition()

			if (!moved) {
				await this.openSheet()
			}
		},
		handleFabTouchCancel() {
			if (!this.fabDragging) return
			this.fabDragging = false
			this.fabMoved = false
			this.persistFabPosition()
		},
		clearRelistenTimer() {
			if (this.relistenTimer) {
				clearTimeout(this.relistenTimer)
				this.relistenTimer = null
			}
		},
		async handleExternalOpen(payload = {}) {
			if (!this.isActivePage()) return
			await this.openSheet(payload)
		},
		async handleExternalClose() {
			if (!this.isActivePage()) return
			await this.closeSheet()
		},
		async handleExternalListen(payload = {}) {
			if (!this.isActivePage()) return
			this.open = true
			await this.startListening(payload)
		},
		async openSheet(payload = {}) {
			const { autoListen = true } = payload
			this.open = true
			this.lastError = ''
			this.recognizedText = ''
			if (autoListen && this.config && this.config.onCommand) {
				await this.startListening(payload)
			}
		},
		async toggleListening() {
			if (this.listening) {
				await cancelSpeechRecognition()
				this.listening = false
				return
			}
			await this.startListening()
		},
		async startListening(payload = {}) {
			if (!this.config || !this.config.onCommand || this.listening || !this.isActivePage()) return
			this.clearRelistenTimer()
			this.lastError = ''
			this.recognizedText = ''
			this.listening = true
			try {
				const result = await recognizeSingleSentence({
					onPartial: text => {
						this.recognizedText = text
					},
					silenceFinishDelay: payload.silenceFinishDelay
				})
				this.listening = false
				this.recognizedText = result.text || ''
				await this.dispatchCommand(result.text)
			} catch (error) {
				this.listening = false
				this.lastError = error.message || '没有听清，请再说一遍'
				uni.showToast({
					title: this.lastError,
					icon: 'none'
				})
			}
		},
		scheduleRelisten(delayMs = 350) {
			this.clearRelistenTimer()
			this.relistenTimer = setTimeout(() => {
				if (!this.open || !this.isActivePage()) return
				this.startListening()
			}, delayMs)
		},
		async dispatchCommand(text) {
			let command = parseVoiceCommand(text)
			if (!command && this.config && typeof this.config.onUnknownText === 'function') {
				const rawResult = await Promise.resolve(this.config.onUnknownText(text, { text }))
				const result = normalizeHandleResult(rawResult)
				if (result.handled) {
					if (result.continueListening) {
						this.scheduleRelisten(result.delayMs)
						return
					}
					if (!result.keepOpen) {
						this.closeSheet()
					}
					return
				}
			}

			if (!command) {
				uni.showToast({
					title: '没有听清，请再说一遍',
					icon: 'none'
				})
				return
			}

			const rawResult = await Promise.resolve(this.config.onCommand(command, { text }))
			const result = normalizeHandleResult(rawResult)
			if (!result.handled) {
				uni.showToast({
					title: '没有听清，请再说一遍',
					icon: 'none'
				})
				return
			}

			if (result.continueListening) {
				this.scheduleRelisten(result.delayMs)
				return
			}

			if (!result.keepOpen) {
				this.closeSheet()
			}
		},
		async handleCommandChip(text) {
			if (this.listening) {
				await cancelSpeechRecognition()
				this.listening = false
			}
			this.recognizedText = text
			await this.dispatchCommand(text)
		},
		async closeSheet() {
			this.clearRelistenTimer()
			if (this.listening) {
				await cancelSpeechRecognition()
			}
			this.listening = false
			this.open = false
		}
	}
}
</script>

<style scoped>
.voice-fab {
	position: fixed;
	z-index: 50;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%);
	box-shadow: 0 4px 16px rgba(43, 154, 111, 0.35);
	transition: transform .18s ease, box-shadow .18s ease;
}

.voice-fab.dragging {
	transform: scale(1.04);
	box-shadow: 0 8px 20px rgba(43, 154, 111, 0.28);
}

.sheet-mask {
	position: fixed;
	inset: 0;
	z-index: 80;
	background: rgba(0, 0, 0, 0.35);
	display: flex;
	align-items: flex-end;
}

.voice-sheet {
	width: 100%;
	padding: 12px 24px calc(40px + env(safe-area-inset-bottom));
	border-radius: 28px 28px 0 0;
	background: #FFFFFF;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.sheet-handle {
	width: 40px;
	height: 4px;
	border-radius: 999px;
	background: #E8E5E0;
	margin-bottom: 18px;
}

.sheet-title {
	font-size: 20px;
	font-weight: 700;
	color: #2D2D2D;
}

.sheet-desc {
	margin-top: 8px;
	font-size: 18px;
	color: #6B7280;
	text-align: center;
}

.recognized-text {
	margin-top: 10px;
	padding: 10px 14px;
	border-radius: 12px;
	background: #F3F0EB;
	font-size: 16px;
	line-height: 1.5;
	color: #2D2D2D;
	text-align: center;
	max-width: 100%;
}

.mic-wrap {
	position: relative;
	width: 128px;
	height: 128px;
	margin-top: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.mic-large {
	position: relative;
	z-index: 2;
	width: 80px;
	height: 80px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #E8E5E0;
}

.mic-large.listening {
	background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%);
}

.pulse-ring {
	position: absolute;
	width: 100px;
	height: 100px;
	border-radius: 50%;
	background: rgba(43, 154, 111, 0.14);
	animation: pulse 1.5s ease-out infinite;
}

.pulse-b {
	animation-delay: .3s;
}

.try-title {
	margin-top: 8px;
	font-size: 18px;
	font-weight: 600;
	color: #6B7280;
}

.command-row {
	margin-top: 12px;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 8px;
}

.command-chip {
	min-height: 44px;
	padding: 0 14px;
	border: 1px solid #E8E5E0;
	border-radius: 22px;
	display: flex;
	align-items: center;
	color: #2D2D2D;
	font-size: 18px;
}

.close-btn {
	margin-top: 22px;
	width: 48px;
	height: 48px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

@keyframes pulse {
	0% { transform: scale(1); opacity: .6; }
	100% { transform: scale(1.55); opacity: 0; }
}
</style>
