<template>
	<AzShell active="booking" :voice-config="voiceConfig">
		<view class="page booking">
			<view class="header">
				<text class="title">选择服务</text>
				<text class="sub">请选择您需要的陪诊服务</text>
			</view>

			<view v-if="currentPatient" class="patient-banner">
				<text class="patient-banner-label">{{ fromFamilyMode ? '当前正在为家人预约' : '当前就诊人' }}</text>
				<text class="patient-banner-name">{{ currentPatient.name }}（{{ currentPatient.remarkRelation }}）</text>
				<text class="patient-banner-desc">{{ currentPatient.gender }} · {{ currentPatient.age }}岁 · {{ currentPatient.healthStatus }}</text>
			</view>

			<view class="service-list">
				<view
					v-for="(service, index) in serviceTypes"
					:key="service.id"
					class="service-card"
					:class="{ selected: selectedService === service.id, urgent: service.priority === 'urgent' }"
					@tap="selectService(service.id)"
				>
					<view class="service-order">序号{{ index + 1 }}</view>
					<view class="service-icon" :style="{ background: service.bg }">
						<AzIcon :name="service.icon" :size="24" :color="service.color" />
					</view>
					<view class="service-main">
						<view class="row between">
							<text class="service-title">{{ getServiceVoiceName(service.id) }}</text>
							<text v-if="service.priority === 'urgent'" class="urgent-badge">紧急</text>
						</view>
						<text class="service-desc">{{ service.description }}</text>
						<view class="row price-row">
							<text class="price" :style="{ color: service.color }">￥{{ service.price }}<text class="unit">/次</text></text>
							<view class="time">
								<AzIcon name="clock" :size="14" color="#9CA3AF" />
								<text>{{ service.duration }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="section">
				<view class="section-heading">
					<AzIcon name="calendar" :size="20" color="#2B9A6F" />
					<text>选择日期和时间</text>
				</view>
				<scroll-view class="date-scroll" scroll-x show-scrollbar="false">
					<view class="date-row">
						<view
							v-for="item in dates"
							:key="item.date"
							class="date-pill"
							:class="{ active: selectedDate === item.date }"
							@tap="selectDate(item.date)"
						>
							<text class="week">{{ item.weekDay }}</text>
							<text class="date">{{ item.label }}</text>
						</view>
					</view>
				</scroll-view>
				<view class="time-period-list">
					<view
						v-for="period in timePeriods"
						:key="period.id"
						class="time-period-card"
						:class="{ active: selectedTimePeriod === period.id, disabled: period.disabled }"
						@tap="selectTimePeriod(period)"
					>
						<view class="time-period-main">
							<text class="time-period-label">{{ period.label }}</text>
							<text class="time-period-range">{{ period.range }}</text>
						</view>
						<view v-if="selectedTimePeriod === period.id" class="time-period-check">
							<AzIcon name="check" :size="16" color="#FFFFFF" />
						</view>
					</view>
				</view>
				<text v-if="selectedTimePeriodData" class="time-period-tip">
					已选择【{{ selectedTimePeriodData.label }}】时段，系统将为您安排该时间段内合适的陪诊时间。
				</text>
			</view>

			<view class="section">
				<view class="section-heading">
					<AzIcon name="building" :size="20" color="#2B9A6F" />
					<text>选择医院</text>
				</view>
				<view
					v-for="(hospital, index) in hospitals"
					:key="hospital"
					class="hospital"
					:class="{ active: selectedHospital === hospital }"
					@tap="selectHospital(hospital)"
				>
					<view class="row">
						<view class="hospital-order">序号{{ index + 1 }}</view>
						<AzIcon name="location" :size="20" :color="selectedHospital === hospital ? '#2B9A6F' : '#9CA3AF'" />
						<text>{{ hospital }}</text>
					</view>
					<view v-if="selectedHospital === hospital" class="check-mini">
						<AzIcon name="right" :size="14" color="#FFFFFF" />
					</view>
				</view>
			</view>

			<view class="fixed-confirm">
				<view class="voice-state-bar" v-if="voiceBookingMode">
					<text class="voice-state-text">{{ currentStepLabel }}</text>
					<view class="voice-retry-btn" @tap="triggerVoiceStepRecognition">
						<AzIcon name="mic" :size="16" color="#2B9A6F" />
						<text>{{ currentStepActionText }}</text>
					</view>
				</view>
				<view class="voice-info-btn" @tap="broadcastCurrentBookingInfo">
					<AzIcon name="mic" :size="18" color="#2B9A6F" />
					<text>播报当前预约信息</text>
				</view>
				<view class="confirm-btn" :class="{ disabled: !canConfirm }" @tap="confirm">
					<text>确认预约</text>
					<text v-if="selectedServiceData" class="confirm-price">￥{{ selectedServiceData.price }}</text>
				</view>
			</view>
		</view>
	</AzShell>
</template>

<script>
import AzShell from '@/components/AzShell.vue'
import AzIcon from '@/components/AzIcon.vue'
import { companions, serviceTypes } from '@/common/mockData.js'
import { broadcastText, buildBookingBroadcastText } from '@/utils/voice-broadcast.js'
import { extractScheduleSelection } from '@/utils/voice-command.js'
import { getCurrentPatient, getPatientById, initFamilyCareStore, setCurrentPatient } from '@/utils/family-care.js'
import { stopVoicePlayback } from '@/utils/voice-player.js'
import { createOrder } from '@/utils/order-service.js'

const VOICE_STATES = {
	IDLE: 'idle',
	SELECT_SERVICE: 'select_service',
	SELECT_DATETIME: 'select_datetime',
	SELECT_HOSPITAL: 'select_hospital',
	CONFIRM_BOOKING: 'confirm_booking',
	COMPLETED: 'completed'
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const serviceVoiceNames = {
	registration: '挂号陪诊',
	medicine: '取药陪同',
	examination: '检查协助',
	emergency: '紧急陪诊'
}

function getNext7Days() {
	const days = []
	const now = new Date()
	for (let i = 0; i < 7; i += 1) {
		const currentDate = new Date(now)
		currentDate.setDate(now.getDate() + i)
		const month = currentDate.getMonth() + 1
		const day = currentDate.getDate()
		days.push({
			label: `${month}月${day}日`,
			date: `${currentDate.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
			weekDay: i === 0 ? '今天' : `周${weekDays[currentDate.getDay()]}`
		})
	}
	return days
}

export default {
	components: { AzShell, AzIcon },
	data() {
		const dates = getNext7Days()
		return {
			serviceTypes,
			dates,
			selectedService: null,
			selectedDate: dates[0]?.date || '',
			selectedTimePeriod: '',
			timePeriods: [
				{ id: 'morning', label: '上午', range: '06:00-11:00', value: '06:00-11:00', disabled: false },
				{ id: 'noon', label: '中午', range: '11:00-14:00', value: '11:00-14:00', disabled: false },
				{ id: 'afternoon', label: '下午', range: '14:00-17:00', value: '14:00-17:00', disabled: false },
				{ id: 'evening', label: '晚上', range: '17:00-22:00', value: '17:00-22:00', disabled: false },
				{ id: 'midnight', label: '凌晨', range: '23:00-05:00', value: '23:00-05:00', disabled: false }
			],
			hospitals: ['上海市第一人民医院', '华山医院', '瑞金医院', '中山医院'],
			selectedHospital: '上海市第一人民医院',
			voiceState: VOICE_STATES.IDLE,
			voicePromptText: '',
			voiceFlowAutoStart: false,
			voiceFlowTimer: null,
			fromFamilyMode: false
		}
	},
	computed: {
		currentPatient() {
			return getCurrentPatient()
		},
		selectedServiceData() {
			return this.serviceTypes.find(item => item.id === this.selectedService) || null
		},
		selectedTimePeriodData() {
			return this.timePeriods.find(item => item.id === this.selectedTimePeriod) || null
		},
		canConfirm() {
			return Boolean(this.selectedService && this.selectedDate && this.selectedTimePeriod && this.selectedHospital)
		},
		voiceBookingMode() {
			return this.voiceState !== VOICE_STATES.IDLE && this.voiceState !== VOICE_STATES.COMPLETED
		},
		voiceConfig() {
			return {
				panelTitle: '语音预约助手',
				statusText: this.voiceBookingMode ? this.voicePromptText || '请按当前引导完成预约' : '可以直接说：我要预约、返回首页',
				commandHints: this.getVoiceHints(),
				onCommand: (command, meta) => this.handleVoiceCommand(command, meta),
				onUnknownText: (text, meta) => this.handleUnknownVoiceText(text, meta)
			}
		},
		currentStepLabel() {
			const labels = {
				[VOICE_STATES.SELECT_SERVICE]: '正在选择服务类型',
				[VOICE_STATES.SELECT_DATETIME]: '正在选择日期和时间段',
				[VOICE_STATES.SELECT_HOSPITAL]: '正在选择医院',
				[VOICE_STATES.CONFIRM_BOOKING]: '等待确认预约'
			}
			return labels[this.voiceState] || '语音预约模式'
		},
		currentStepActionText() {
			const actions = {
				[VOICE_STATES.SELECT_SERVICE]: '重新说服务序号',
				[VOICE_STATES.SELECT_DATETIME]: '重新说日期时间',
				[VOICE_STATES.SELECT_HOSPITAL]: '重新说医院序号',
				[VOICE_STATES.CONFIRM_BOOKING]: '重新说确认'
			}
			return actions[this.voiceState] || '开始识别'
		}
	},
	onLoad(query) {
		initFamilyCareStore()
		if (query.service) {
			this.selectedService = query.service
		}
		if (query.patientId) {
			const patient = getPatientById(query.patientId)
			if (patient) {
				setCurrentPatient(patient.id)
			}
		}
		this.fromFamilyMode = query.fromFamily === '1'
		this.voiceFlowAutoStart = query.voiceFlow === '1'
	},
	onReady() {
		if (this.voiceFlowAutoStart) {
			this.startVoiceBookingMode()
		}
	},
	onHide() {
		this.clearVoiceFlowTimer()
		stopVoicePlayback()
	},
	onUnload() {
		this.clearVoiceFlowTimer()
		stopVoicePlayback()
	},
	methods: {
		getServiceVoiceName(serviceId) {
			return serviceVoiceNames[serviceId] || this.serviceTypes.find(item => item.id === serviceId)?.name || ''
		},
		getVoiceHints() {
			switch (this.voiceState) {
				case VOICE_STATES.SELECT_SERVICE:
					return ['1', '2', '3', '4']
				case VOICE_STATES.SELECT_DATETIME:
					return ['明天上午', '后天下午', '4月20日晚上']
				case VOICE_STATES.SELECT_HOSPITAL:
					return ['1', '2', '3', '4']
				case VOICE_STATES.CONFIRM_BOOKING:
					return ['确认', '返回首页']
				default:
					return ['我要预约', '返回首页']
			}
		},
		clearVoiceFlowTimer() {
			if (this.voiceFlowTimer) {
				clearTimeout(this.voiceFlowTimer)
				this.voiceFlowTimer = null
			}
		},
		emitVoiceOpen(payload = {}) {
			this.clearVoiceFlowTimer()
			this.voiceFlowTimer = setTimeout(() => {
				uni.$emit('az-voice-open', payload)
			}, payload.delay || 280)
		},
		closeVoiceAssistant() {
			uni.$emit('az-voice-close')
		},
		openVoiceAssistantForSingleRecognition(delay = 280) {
			this.emitVoiceOpen({
				autoListen: true,
				delay,
				silenceFinishDelay: 1000
			})
		},
		async playVoicePrompt(text) {
			this.voicePromptText = text
			this.emitVoiceOpen({
				autoListen: false,
				delay: 80
			})
			try {
				await broadcastText(text, { silent: true })
			} catch (error) {}
		},
		resetVoiceSelections() {
			this.selectedService = null
			this.selectedDate = ''
			this.selectedTimePeriod = ''
			this.selectedHospital = ''
		},
		async moveToVoiceState(state) {
			this.voiceState = state
			let promptText = ''

			if (state === VOICE_STATES.SELECT_SERVICE) {
				promptText = '请选择服务类型。序号1挂号陪诊，序号2取药陪同，序号3检查协助，序号4紧急陪诊。'
			}
			if (state === VOICE_STATES.SELECT_DATETIME) {
				promptText = '请一次说出预约日期和时间段，比如明天上午、后天下午或者4月20日晚上。'
			}
			if (state === VOICE_STATES.SELECT_HOSPITAL) {
				promptText = '请选择医院。序号1上海市第一人民医院，序号2华山医院，序号3瑞金医院，序号4中山医院。'
			}
			if (state === VOICE_STATES.CONFIRM_BOOKING) {
				promptText = this.buildConfirmVoiceText()
			}

			await this.playVoicePrompt(promptText)

			if (state !== VOICE_STATES.COMPLETED && state !== VOICE_STATES.IDLE) {
				this.openVoiceAssistantForSingleRecognition()
			}
		},
		async startVoiceBookingMode() {
			this.resetVoiceSelections()
			await this.moveToVoiceState(VOICE_STATES.SELECT_SERVICE)
			return { handled: true }
		},
		stopVoiceBookingMode() {
			this.voiceState = VOICE_STATES.IDLE
			this.voicePromptText = ''
			this.clearVoiceFlowTimer()
		},
		buildConfirmVoiceText() {
			const summary = buildBookingBroadcastText({
				dateLabel: this.getSelectedDateLabel(),
				periodLabel: this.selectedTimePeriodData?.label,
				hospital: this.selectedHospital,
				serviceType: this.getServiceVoiceName(this.selectedService)
			})
			return summary ? `${summary} 确认请说确认。` : '预约信息已选择完成，确认请说确认。'
		},
		getSelectedDateLabel() {
			return this.dates.find(item => item.date === this.selectedDate)?.label || ''
		},
		resolveDateHint(dateHint) {
			if (!dateHint) return null
			if (dateHint.type === 'relative') {
				return this.dates[dateHint.offset] || null
			}
			if (dateHint.type === 'month_day') {
				return this.dates.find(item => {
					const currentDate = new Date(item.date)
					return currentDate.getMonth() + 1 === dateHint.month && currentDate.getDate() === dateHint.day
				}) || null
			}
			if (dateHint.type === 'day_only') {
				return this.dates.find(item => new Date(item.date).getDate() === dateHint.day) || null
			}
			if (dateHint.type === 'weekday') {
				return this.dates.find(item => new Date(item.date).getDay() === dateHint.weekday) || null
			}
			return null
		},
		selectService(serviceId) {
			this.selectedService = serviceId
			if (this.voiceState === VOICE_STATES.SELECT_SERVICE) {
				this.moveToVoiceState(VOICE_STATES.SELECT_DATETIME)
			}
		},
		selectDate(date) {
			this.selectedDate = date
			if (this.voiceState === VOICE_STATES.SELECT_DATETIME && this.selectedTimePeriod) {
				this.moveToVoiceState(VOICE_STATES.SELECT_HOSPITAL)
			}
		},
		selectTimePeriod(period) {
			if (!period || period.disabled) return
			this.selectedTimePeriod = period.id
			if (this.voiceState === VOICE_STATES.SELECT_DATETIME && this.selectedDate) {
				this.moveToVoiceState(VOICE_STATES.SELECT_HOSPITAL)
			}
		},
		selectHospital(hospital) {
			this.selectedHospital = hospital
			if (this.voiceState === VOICE_STATES.SELECT_HOSPITAL) {
				this.moveToVoiceState(VOICE_STATES.CONFIRM_BOOKING)
			}
		},
		triggerVoiceStepRecognition() {
			if (!this.voiceBookingMode) {
				uni.$emit('az-voice-open', { autoListen: true, silenceFinishDelay: 1000 })
				return
			}
			this.openVoiceAssistantForSingleRecognition(120)
		},
		async broadcastCurrentBookingInfo() {
			const text = buildBookingBroadcastText({
				dateLabel: this.getSelectedDateLabel(),
				periodLabel: this.selectedTimePeriodData?.label,
				hospital: this.selectedHospital,
				serviceType: this.getServiceVoiceName(this.selectedService)
			})
			if (!text) {
				uni.showToast({
					title: '请先完善预约信息',
					icon: 'none'
				})
				return false
			}
			try {
				await broadcastText(text)
				return true
			} catch (error) {
				uni.showToast({
					title: error.message || '语音播报失败',
					icon: 'none'
				})
				return false
			}
		},
		handleServiceOption(index) {
			const target = this.serviceTypes[index - 1]
			if (!target) return { handled: false }
			this.selectService(target.id)
			return { handled: true }
		},
		handleHospitalOption(index) {
			const target = this.hospitals[index - 1]
			if (!target) return { handled: false }
			this.selectHospital(target)
			return { handled: true }
		},
		handleDatetimeSelection(command, meta = {}) {
			const parsed = command.type === 'select_schedule'
				? command
				: extractScheduleSelection(meta.text || '')

			const matchedDate = this.resolveDateHint(parsed.dateHint)
			const matchedPeriod = parsed.periodId
				? this.timePeriods.find(item => item.id === parsed.periodId)
				: null

			if (!matchedDate || !matchedPeriod) {
				uni.showToast({
					title: '请一次说出日期和时间段',
					icon: 'none'
				})
				return { handled: true, keepOpen: true }
			}

			this.selectedDate = matchedDate.date
			this.selectedTimePeriod = matchedPeriod.id
			this.moveToVoiceState(VOICE_STATES.SELECT_HOSPITAL)
			return { handled: true }
		},
		async handleVoiceCommand(command, meta = {}) {
			if (command.type === 'go_home') {
				this.stopVoiceBookingMode()
				uni.reLaunch({ url: '/pages/index/index' })
				return { handled: true }
			}

			if (command.type === 'start_booking') {
				return this.startVoiceBookingMode()
			}

			switch (this.voiceState) {
				case VOICE_STATES.SELECT_SERVICE:
					if (command.type !== 'choose_option') {
						return { handled: false }
					}
					return this.handleServiceOption(command.index)
				case VOICE_STATES.SELECT_DATETIME:
					if (command.type !== 'select_schedule') {
						return this.handleDatetimeSelection(command, meta)
					}
					return this.handleDatetimeSelection(command, meta)
				case VOICE_STATES.SELECT_HOSPITAL:
					if (command.type !== 'choose_option') {
						return { handled: false }
					}
					return this.handleHospitalOption(command.index)
				case VOICE_STATES.CONFIRM_BOOKING:
					if (command.type === 'confirm_booking') {
						this.voiceState = VOICE_STATES.COMPLETED
						this.confirm()
						return { handled: true }
					}
					return { handled: false }
				default:
					return { handled: false }
			}
		},
		async handleUnknownVoiceText() {
			uni.showToast({
				title: '没有听清，请再说一遍',
				icon: 'none'
			})
			return { handled: true, keepOpen: true }
		},
		async confirm() {
			if (!this.canConfirm) return
			if (!this.currentPatient) {
				uni.showToast({
					title: '请先选择就诊人',
					icon: 'none'
				})
				return
			}

			const matchedCompanion = companions
				.filter(item => item.status === 'available')
				.sort((a, b) => a.distanceKm - b.distanceKm)[0] || companions[0]

			try {
				uni.showLoading({
					title: '正在创建订单',
					mask: true
				})
				const order = await createOrder({
					patientId: this.currentPatient.id,
					patientName: this.currentPatient.name,
					patientRelation: this.currentPatient.remarkRelation,
					serviceTypeId: this.selectedService,
					serviceType: this.getServiceVoiceName(this.selectedService),
					hospital: this.selectedHospital,
					date: this.getSelectedDateLabel(),
					time: this.selectedTimePeriodData?.range || '',
					baseFee: this.selectedServiceData?.price || 198,
					totalFee: this.selectedServiceData?.price || 198,
					companionId: matchedCompanion?.id || '1',
					companionName: matchedCompanion?.name || '张护士',
					companionRating: matchedCompanion?.rating || 4.9
				})

				this.stopVoiceBookingMode()
				uni.navigateTo({
					url: `/pages/payment/index?orderId=${order.id}&patientId=${this.currentPatient.id}`
				})
			} catch (error) {
				uni.showToast({
					title: error.message || '创建订单失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding-bottom: calc(var(--bottom-panel-offset, 72px) + 220px + env(safe-area-inset-bottom));
	background: #FAFAF8;
}
.header {
	padding: 30px 20px 16px;
	display: flex;
	flex-direction: column;
}
.patient-banner {
	margin: 0 20px 16px;
	padding: 16px;
	border-radius: 16px;
	background: #FFFFFF;
	box-shadow: 0 2px 12px rgba(45,45,45,.06);
}
.patient-banner-label {
	font-size: 14px;
	color: #9CA3AF;
}
.patient-banner-name {
	display: block;
	margin-top: 6px;
	font-size: 20px;
	font-weight: 800;
	color: #2D2D2D;
}
.patient-banner-desc {
	display: block;
	margin-top: 6px;
	font-size: 15px;
	line-height: 1.55;
	color: #6B7280;
}
.title {
	font-size: 24px;
	font-weight: 800;
	color: #2D2D2D;
}
.sub {
	margin-top: 6px;
	font-size: 18px;
	color: #6B7280;
}
.service-list,
.section {
	padding: 0 20px;
}
.service-card {
	position: relative;
	margin-bottom: 12px;
	padding: 20px;
	border-radius: 16px;
	border: 1px solid #E8E5E0;
	background: #FFFFFF;
	box-shadow: 0 2px 8px rgba(45,45,45,.04);
	display: flex;
	gap: 16px;
}
.service-order {
	position: absolute;
	right: 12px;
	top: 12px;
	padding: 3px 8px;
	border-radius: 999px;
	background: #F3F0EB;
	font-size: 12px;
	font-weight: 700;
	color: #6B7280;
}
.service-card.selected {
	border: 2px solid #2B9A6F;
	background: #F0FAF5;
	box-shadow: 0 4px 16px rgba(43,154,111,.12);
}
.service-card.urgent {
	border-left: 3px solid #E85D4A;
}
.service-icon {
	width: 48px;
	height: 48px;
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.service-main {
	flex: 1;
	min-width: 0;
}
.row {
	display: flex;
	align-items: center;
	gap: 8px;
}
.between {
	justify-content: space-between;
}

.service-card.urgent .between {
	justify-content: flex-start;
	gap: 10px;
	padding-right: 72px;
}
.service-title {
	font-size: 18px;
	font-weight: 700;
	color: #2D2D2D;
}
.urgent-badge {
	padding: 3px 8px;
	border-radius: 6px;
	background: #E85D4A;
	color: #FFFFFF;
	font-size: 14px;
	font-weight: 700;
}
.service-desc {
	display: block;
	margin-top: 8px;
	font-size: 18px;
	line-height: 1.45;
	color: #6B7280;
}
.price-row {
	margin-top: 12px;
	gap: 18px;
}
.price {
	font-size: 18px;
	font-weight: 800;
}
.unit {
	font-size: 15px;
	font-weight: 400;
	color: #9CA3AF;
}
.time {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 15px;
	color: #9CA3AF;
}
.section {
	margin-top: 28px;
}

.section:last-of-type {
	margin-bottom: 16px;
}
.section-heading {
	margin-bottom: 16px;
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 20px;
	font-weight: 800;
	color: #2D2D2D;
}
.date-scroll {
	width: 100%;
	white-space: nowrap;
}
.date-row {
	display: flex;
	gap: 10px;
	padding: 2px 0 8px;
}
.date-pill {
	min-width: 92px;
	height: 84px;
	padding: 10px 8px;
	border-radius: 16px;
	border: 1px solid #E8E5E0;
	background: #FFFFFF;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 6px;
	overflow: hidden;
	color: #2D2D2D;
}
.date-pill.active {
	border: 2px solid #2B9A6F;
	background: #2B9A6F;
	color: #FFFFFF;
}
.week {
	max-width: 100%;
	font-size: 14px;
	font-weight: 600;
	line-height: 1.2;
	color: #6B7280;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	text-align: center;
}
.date-pill.active .week {
	color: rgba(255,255,255,.85);
}
.date {
	max-width: 100%;
	font-size: 17px;
	font-weight: 800;
	line-height: 1.25;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	text-align: center;
}
.time-period-list {
	margin-top: 12px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.time-period-card {
	min-height: 68px;
	padding: 14px 16px;
	border-radius: 16px;
	border: 1px solid #E8E5E0;
	background: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}
.time-period-card.active {
	border: 2px solid #2B9A6F;
	background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%);
	box-shadow: 0 4px 14px rgba(43,154,111,.2);
}
.time-period-card.disabled {
	opacity: .45;
}
.time-period-main {
	display: flex;
	flex-direction: column;
	gap: 6px;
}
.time-period-label {
	font-size: 20px;
	font-weight: 800;
	color: #2D2D2D;
}
.time-period-range {
	font-size: 16px;
	color: #6B7280;
}
.time-period-card.active .time-period-label,
.time-period-card.active .time-period-range {
	color: #FFFFFF;
}
.time-period-check {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: rgba(255,255,255,.24);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.time-period-tip {
	display: block;
	margin-top: 12px;
	padding: 12px 14px;
	border-radius: 12px;
	background: #E8F5EE;
	font-size: 15px;
	line-height: 1.55;
	color: #2B9A6F;
}
.hospital {
	height: 56px;
	margin-bottom: 8px;
	padding: 0 16px;
	border-radius: 14px;
	border: 1px solid #E8E5E0;
	background: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 18px;
	font-weight: 600;
	color: #2D2D2D;
}
.hospital-order {
	padding: 3px 8px;
	border-radius: 999px;
	background: #F3F0EB;
	font-size: 12px;
	font-weight: 700;
	color: #6B7280;
}
.hospital.active {
	border: 2px solid #2B9A6F;
	background: #F0FAF5;
	color: #2B9A6F;
}
.check-mini {
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background: #2B9A6F;
	display: flex;
	align-items: center;
	justify-content: center;
}
.fixed-confirm {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 72px;
	z-index: 30;
	padding: 16px 20px calc(24px + env(safe-area-inset-bottom));
	background: linear-gradient(to top, #FAFAF8 80%, rgba(250,250,248,0));
}
.voice-state-bar {
	margin-bottom: 12px;
	padding: 12px 14px;
	border-radius: 14px;
	background: #FFFFFF;
	border: 1px solid #CFE8DA;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}
.voice-state-text {
	flex: 1;
	font-size: 15px;
	line-height: 1.4;
	color: #2D2D2D;
}
.voice-retry-btn {
	height: 38px;
	padding: 0 12px;
	border-radius: 12px;
	background: #E8F5EE;
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 14px;
	font-weight: 700;
	color: #2B9A6F;
	flex-shrink: 0;
}
.voice-info-btn {
	height: 48px;
	margin-bottom: 12px;
	border-radius: 14px;
	border: 1px solid #CFE8DA;
	background: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	font-size: 16px;
	font-weight: 700;
	color: #2B9A6F;
}
.confirm-btn {
	height: 56px;
	border-radius: 16px;
	background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%);
	box-shadow: 0 4px 16px rgba(43,154,111,.3);
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	color: #FFFFFF;
	font-size: 18px;
	font-weight: 800;
}
.confirm-btn.disabled {
	background: #D1D5DB;
	box-shadow: none;
}
.confirm-price {
	opacity: .9;
}
</style>
