<template>
	<AzShell active="">
		<view class="page">
			<view class="nav">
				<view class="back" @tap="back"><AzIcon name="left" :size="24" color="#2D2D2D" /></view>
				<text>帮助中心</text>
			</view>

			<view class="content">
				<view class="intro-card">
					<text class="intro-title">不会用也没关系</text>
					<text class="intro-desc">点击下面的内容，就能听语音说明。一步一步跟着做，就能完成预约和支付。</text>
					<view class="intro-actions">
						<view class="play-all-btn" :class="{ playing: playingAll }" @tap="togglePlayAll">
							<AzIcon name="mic" :size="18" color="#FFFFFF" />
							<text>{{ playingAll ? '停止播放' : '播放全部帮助' }}</text>
						</view>
						<text class="intro-tip">点击内容可语音播放</text>
					</view>
				</view>

				<view
					v-for="item in helpItems"
					:key="item.id"
					class="help-card"
					:class="{ active: currentPlayingId === item.id }"
					@tap="toggleItemPlayback(item)"
				>
					<view class="help-icon" :class="{ active: currentPlayingId === item.id }">
						<AzIcon name="help" :size="20" :color="currentPlayingId === item.id ? '#FFFFFF' : '#F5A623'" />
					</view>
					<view class="help-main">
						<view class="help-head">
							<text class="help-title">{{ item.title }}</text>
							<text class="play-tag" :class="{ active: currentPlayingId === item.id }">
								{{ currentPlayingId === item.id ? '播放中' : '点击收听' }}
							</text>
						</view>
						<text class="help-content">{{ item.content }}</text>
					</view>
				</view>
			</view>
		</view>
	</AzShell>
</template>

<script>
import AzShell from '@/components/AzShell.vue'
import AzIcon from '@/components/AzIcon.vue'
import { helpCenterItems } from '@/common/helpCenterData.js'
import { broadcastText } from '@/utils/voice-broadcast.js'
import { stopVoicePlayback } from '@/utils/voice-player.js'

export default {
	components: { AzShell, AzIcon },
	data() {
		return {
			helpItems: helpCenterItems,
			currentPlayingId: '',
			playingAll: false,
			playSessionToken: 0
		}
	},
	onHide() {
		this.stopPlayback()
	},
	onUnload() {
		this.stopPlayback()
	},
	methods: {
		waitBetweenSegments(delay = 420) {
			return new Promise(resolve => {
				setTimeout(resolve, delay)
			})
		},
		async playHelpAudio(item, token) {
			await broadcastText(item.title, { silent: true })
			if (this.playSessionToken !== token) return
			await this.waitBetweenSegments()
			if (this.playSessionToken !== token) return
			await broadcastText(item.content, { silent: true })
		},
		back() {
			uni.navigateBack({
				fail: () => {
					uni.navigateTo({ url: '/pages/profile/index' })
				}
			})
		},
		stopPlayback() {
			this.playSessionToken += 1
			this.playingAll = false
			this.currentPlayingId = ''
			stopVoicePlayback()
		},
		async toggleItemPlayback(item) {
			if (this.currentPlayingId === item.id) {
				this.stopPlayback()
				return
			}

			this.stopPlayback()
			const token = Date.now()
			this.playSessionToken = token
			this.currentPlayingId = item.id

			try {
				await this.playHelpAudio(item, token)
			} catch (error) {
				uni.showToast({
					title: error.message || '语音播报失败',
					icon: 'none'
				})
			} finally {
				if (this.playSessionToken === token) {
					this.currentPlayingId = ''
				}
			}
		},
		async togglePlayAll() {
			if (this.playingAll) {
				this.stopPlayback()
				return
			}

			this.stopPlayback()
			const token = Date.now()
			this.playSessionToken = token
			this.playingAll = true

			for (const item of this.helpItems) {
				if (this.playSessionToken !== token) break
				this.currentPlayingId = item.id
				try {
					await this.playHelpAudio(item, token)
				} catch (error) {
					uni.showToast({
						title: error.message || '语音播报失败',
						icon: 'none'
					})
					break
				}
			}

			if (this.playSessionToken === token) {
				this.currentPlayingId = ''
				this.playingAll = false
			}
		}
	},
	beforeUnmount() {
		this.stopPlayback()
	}
}
</script>

<style scoped>
.page { min-height: 100vh; padding-bottom: 112px; background: #FAFAF8; }
.nav { position: sticky; top: 0; z-index: 20; height: 64px; padding: 0 20px; background: #FFFFFF; box-shadow: 0 1px 8px rgba(0,0,0,.04); display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; color: #2D2D2D; }
.back { width: 40px; height: 40px; border-radius: 12px; background: #F3F0EB; display: flex; align-items: center; justify-content: center; }
.content { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.intro-card, .help-card { padding: 18px; border-radius: 18px; background: #FFFFFF; box-shadow: 0 2px 12px rgba(45,45,45,.06); }
.intro-title { display: block; font-size: 22px; font-weight: 800; color: #2D2D2D; }
.intro-desc { display: block; margin-top: 8px; font-size: 16px; line-height: 1.7; color: #6B7280; }
.intro-actions { margin-top: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.play-all-btn { min-height: 48px; padding: 0 18px; border-radius: 14px; background: linear-gradient(135deg, #2B9A6F, #3DB88A); display: flex; align-items: center; justify-content: center; gap: 8px; color: #FFFFFF; font-size: 16px; font-weight: 800; }
.play-all-btn.playing { background: linear-gradient(135deg, #E85D4A, #F08070); }
.intro-tip { font-size: 14px; color: #9CA3AF; }
.help-card { display: flex; align-items: flex-start; gap: 14px; border: 1px solid transparent; }
.help-card.active { border-color: #2B9A6F; background: #F0FAF5; box-shadow: 0 6px 18px rgba(43,154,111,.12); }
.help-icon { width: 44px; height: 44px; border-radius: 14px; background: #FFF5E0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.help-icon.active { background: linear-gradient(135deg, #2B9A6F, #3DB88A); }
.help-main { flex: 1; min-width: 0; }
.help-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.help-title { font-size: 20px; font-weight: 800; color: #2D2D2D; }
.play-tag { padding: 4px 10px; border-radius: 999px; background: #F3F0EB; color: #6B7280; font-size: 13px; font-weight: 700; white-space: nowrap; }
.play-tag.active { background: #E8F5EE; color: #2B9A6F; }
.help-content { display: block; margin-top: 8px; font-size: 16px; line-height: 1.75; color: #6B7280; }
</style>
