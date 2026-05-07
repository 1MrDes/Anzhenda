<template>
	<AzShell active="profile">
		<view class="page">
			<view class="hero">
				<view class="avatar-wrap">
					<view class="avatar">{{ displayName.charAt(0) }}</view>
					<view class="camera">
						<AzIcon name="camera" :size="14" color="#6B7280" />
					</view>
				</view>
				<text class="name">{{ displayName }}</text>
				<text class="phone">138****5678</text>
				<view class="member">
					<AzIcon name="award" :size="16" color="#F5A623" />
					<text>金牌会员</text>
				</view>
			</view>

			<view class="stats">
				<view class="stat">
					<text class="num green">{{ familyState.patients.length }}</text>
					<text>就诊人</text>
				</view>
				<view class="stat border">
					<text class="num blue">{{ familyState.familyBindings.length }}</text>
					<text>已绑定家人</text>
				</view>
				<view class="stat border">
					<text class="num gold">{{ pendingTaskCount }}</text>
					<text>家庭代办</text>
				</view>
			</view>

			<view class="sections">
				<view class="card">
					<text class="card-title">辅助功能</text>

					<view class="setting last">
						<view class="item-icon" style="background: #E8F5EE;">
							<AzIcon name="type" :size="20" color="#2B9A6F" />
						</view>
						<view class="setting-main">
							<text class="setting-label">界面大小</text>
							<text class="setting-desc">{{ currentSizeDesc }}</text>
						</view>
						<view class="font-row">
							<text
								v-for="option in fontSizeOptions"
								:key="option.value"
								class="font-chip"
								:class="{ active: settings.fontSizeLevel === option.value }"
								@tap.stop="changeFontSize(option.value)"
							>
								{{ option.label }}
							</text>
						</view>
					</view>

					<view class="setting">
						<view class="item-icon" style="background: #EBF3FC;">
							<AzIcon name="mic" :size="20" color="#4A90D9" />
						</view>
						<view class="setting-main">
							<text class="setting-label">语音助手</text>
							<text class="setting-desc">{{ settings.voiceAssistantEnabled ? '已开启，页面会显示语音助手按钮' : '已关闭，页面会隐藏语音助手按钮' }}</text>
						</view>
						<view class="switch" :class="{ on: settings.voiceAssistantEnabled }" @tap.stop="toggleVoiceAssistant">
							<view />
						</view>
					</view>

					<view class="setting last" @tap="handleOtherItem(helpCenterItem)">
						<view class="item-icon" :style="{ background: helpCenterItem.bg }">
							<AzIcon :name="helpCenterItem.icon" :size="20" :color="helpCenterItem.color" />
						</view>
						<view class="setting-main">
							<text class="setting-label">{{ helpCenterItem.label }}</text>
							<text class="setting-desc">{{ helpCenterItem.desc }}</text>
						</view>
						<AzIcon name="right" :size="22" color="#9CA3AF" />
					</view>
				</view>

				<view class="card">
					<text class="card-title">服务设置</text>
					<view
						v-for="(item, index) in serviceItems"
						:key="item.label"
						class="setting"
						:class="{ last: index === serviceItems.length - 1 }"
						@tap="goServicePage(item)"
					>
						<view class="item-icon" :style="{ background: item.bg }">
							<AzIcon :name="item.icon" :size="20" :color="item.color" />
						</view>
						<view class="setting-main">
							<text class="setting-label">{{ item.label }}</text>
							<text class="setting-desc">{{ item.desc }}</text>
						</view>
						<AzIcon name="right" :size="22" color="#9CA3AF" />
					</view>
				</view>

				<view class="card">
					<text class="card-title">其他</text>
					<view
						v-for="(item, index) in otherItems"
						:key="item.label"
						class="setting"
						:class="{ last: index === otherItems.length - 1 }"
						@tap="handleOtherItem(item)"
					>
						<view class="item-icon" :style="{ background: item.bg }">
							<AzIcon :name="item.icon" :size="20" :color="item.color" />
						</view>
						<text class="setting-label">{{ item.label }}</text>
						<AzIcon name="right" :size="22" color="#9CA3AF" />
					</view>
				</view>

				<view class="logout" @tap="showSoon('退出登录')">
					<AzIcon name="logout" :size="20" color="#E85D4A" />
					退出登录
				</view>
			</view>
		</view>
	</AzShell>
</template>

<script>
import AzShell from '@/components/AzShell.vue'
import AzIcon from '@/components/AzIcon.vue'
import {
	accessibilityState,
	getFontSizeOptions,
	initAccessibilitySettings,
	setFontSizeLevel,
	setVoiceAssistantEnabled
} from '@/utils/accessibility.js'
import { familyCareState, getCurrentPatient, initFamilyCareStore } from '@/utils/family-care.js'

export default {
	components: { AzShell, AzIcon },
	data() {
		return {
			fontSizeOptions: getFontSizeOptions(),
			serviceItems: [
				{ icon: 'user', label: '就诊人管理', desc: '管理多个就诊人，快速切换当前服务对象', color: '#E85D4A', bg: '#FFF0ED', url: '/pages/patients/index' },
				{ icon: 'users', label: '家人绑定', desc: '绑定家人后，可协助预约、缴费和查看记录', color: '#4A90D9', bg: '#EBF3FC', url: '/pages/family-binding/index' },
				{ icon: 'heart', label: '家庭代办', desc: '代预约、代缴费、查看记录、绑定新家人', color: '#2B9A6F', bg: '#E8F5EE', url: '/pages/family/index' }
			],
			otherItems: [
				{ icon: 'message', label: '意见反馈', color: '#7C6BC4', bg: '#F3EEFB' },
				{ icon: 'info', label: '关于安诊达', color: '#2B9A6F', bg: '#E8F5EE' }
			]
		}
	},
	computed: {
		settings() {
			return accessibilityState
		},
		familyState() {
			return familyCareState
		},
		currentPatient() {
			return getCurrentPatient()
		},
		displayName() {
			return this.currentPatient?.name || '安诊达用户'
		},
		pendingTaskCount() {
			return this.familyState.familyTaskOrders.filter(item => item.canPay || item.status === '已预约').length
		},
		currentSizeDesc() {
			return this.settings.fontSizeLevel === 'xlarge'
				? '超大：字体、按钮和卡片都会明显放大'
				: '大：当前适合日常使用的界面大小'
		},
		helpCenterItem() {
			return {
				icon: 'help',
				label: '帮助中心',
				desc: '点击查看使用帮助，也可以语音讲解',
				color: '#F5A623',
				bg: '#FFF5E0',
				url: '/pages/help/index'
			}
		}
	},
	created() {
		initAccessibilitySettings()
		initFamilyCareStore()
	},
	methods: {
		changeFontSize(level) {
			setFontSizeLevel(level)
		},
		toggleVoiceAssistant() {
			setVoiceAssistantEnabled(!this.settings.voiceAssistantEnabled)
		},
		goServicePage(item) {
			uni.navigateTo({ url: item.url })
		},
		handleOtherItem(item) {
			if (item.url) {
				uni.navigateTo({ url: item.url })
				return
			}
			this.showSoon(item.label)
		},
		showSoon(label) {
			uni.showToast({
				title: `${label}正在完善中`,
				icon: 'none'
			})
		}
	}
}
</script>

<style scoped>
.page { min-height: 100vh; padding-bottom: 112px; background: #FAFAF8; }
.hero { padding: 44px 20px 34px; background: linear-gradient(180deg, #E8F5EE 0%, #FAFAF8 100%); display: flex; flex-direction: column; align-items: center; text-align: center; }
.avatar-wrap { position: relative; margin-bottom: 14px; }
.avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #2B9A6F, #3DB88A); box-shadow: 0 4px 16px rgba(43,154,111,.3); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 30px; font-weight: 800; }
.camera { position: absolute; right: 0; bottom: 0; width: 28px; height: 28px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,.1); display: flex; align-items: center; justify-content: center; }
.name { font-size: 24px; font-weight: 800; color: #2D2D2D; }
.phone { margin-top: 6px; font-size: 16px; color: #6B7280; }
.member { margin-top: 12px; padding: 6px 14px; border-radius: 999px; background: #FFF5E0; display: flex; align-items: center; gap: 6px; color: #F5A623; font-size: 16px; font-weight: 700; }
.stats { margin: -10px 20px 20px; padding: 16px; border-radius: 16px; background: #FFFFFF; box-shadow: 0 2px 12px rgba(45,45,45,.06); display: flex; position: relative; z-index: 2; }
.stat { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; color: #6B7280; font-size: 16px; }
.stat.border { border-left: 1px solid #F3F0EB; }
.num { font-size: 22px; font-weight: 800; }
.green { color: #2B9A6F; }
.blue { color: #4A90D9; }
.gold { color: #F5A623; }
.sections { padding: 0 20px; display: flex; flex-direction: column; gap: 16px; }
.card { border-radius: 16px; background: #FFFFFF; box-shadow: 0 2px 12px rgba(45,45,45,.06); overflow: hidden; }
.card-title { display: block; padding: 16px 20px 4px; color: #9CA3AF; font-size: 16px; font-weight: 700; }
.setting { min-height: 68px; margin: 0 16px; padding: 12px 4px; border-bottom: 1px solid #F3F0EB; display: flex; align-items: center; gap: 14px; }
.setting.last { border-bottom: 0; }
.setting-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.item-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.setting-label { font-size: 18px; font-weight: 700; color: #2D2D2D; }
.setting-desc { font-size: 14px; line-height: 1.5; color: #9CA3AF; }
.switch { width: 52px; height: 30px; border-radius: 999px; background: #D1D5DB; padding: 3px; display: flex; align-items: center; flex-shrink: 0; }
.switch view { width: 24px; height: 24px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform .2s; }
.switch.on { background: #2B9A6F; justify-content: flex-end; }
.font-row { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.font-chip { min-width: 52px; padding: 8px 10px; border-radius: 8px; background: #F3F0EB; color: #6B7280; font-size: 14px; font-weight: 700; text-align: center; }
.font-chip.active { background: #2B9A6F; color: #FFFFFF; }
.logout { height: 56px; border-radius: 14px; border: 1px solid #E85D4A; display: flex; align-items: center; justify-content: center; gap: 8px; color: #E85D4A; font-size: 16px; font-weight: 800; }
</style>
