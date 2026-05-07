<template>
	<view class="page">
		<map
			id="fullMap"
			class="real-map"
			:latitude="mapCenter.latitude"
			:longitude="mapCenter.longitude"
			:scale="15"
			:subkey="mapSubKey"
			:markers="mapMarkers"
			:circles="mapCircles"
			:show-location="false"
			:enable-zoom="true"
			:enable-scroll="true"
			:enable-rotate="false"
			:enable-overlooking="false"
			:enable-poi="false"
			:enable-building="false"
			@markertap="handleMarkerTap"
		/>
		<view class="map-tint" />
		<view class="top-status">
			<view class="status-pill">
				<view class="status-dot" :class="{ ready: hasUserLocation }" />
				<text>{{ hasUserLocation ? '已进入大地图模式' : '定位中，准备放大地图' }}</text>
			</view>
			<view v-if="locationError" class="relocate" @tap="loadUserLocation(true)">
				<AzIcon name="locate" :size="14" color="#2B9A6F" />
				<text>重新获取定位</text>
			</view>
		</view>
		<view class="map-legend">
			<view class="legend-item">
				<view class="legend-dot blue" />
				<text>我的位置</text>
			</view>
			<view class="legend-item">
				<view class="legend-dot green" />
				<text>陪诊员</text>
			</view>
		</view>
		<view class="map-meta">
			<text class="map-meta-text">地图已放大，点击陪诊员可指定预约</text>
		</view>

		<view class="entry-sheet" @touchstart="onEntryStart" @touchend="onEntryEnd">
			<view class="entry-handle" />
			<view class="entry-head">
				<view>
					<text class="entry-title">{{ quickOrderTitle }}</text>
					<text class="entry-sub">{{ quickOrderSubtitle }}</text>
				</view>
				<view class="entry-pill">
					<AzIcon name="location" :size="14" color="#2B9A6F" />
					<text>{{ selectedCompanion.distance }}</text>
				</view>
			</view>
			<view class="entry-action" :class="{ disabled: selectedCompanion.status !== 'available' }" @tap="handleQuickOrderTap">
				<AzIcon name="zap" :size="22" color="#FFFFFF" />
				<text>{{ quickOrderTitle }}</text>
			</view>
			<text class="entry-hint">上滑返回默认首页</text>
		</view>

		<view v-if="quickOpen" class="sheet-mask" @tap="closeQuick">
			<view class="quick-sheet" @tap.stop>
				<view class="sheet-handle" />
				<view v-if="locating" class="locating">
					<view class="locate-icon"><AzIcon name="locate" :size="32" color="#2B9A6F" /></view>
					<text class="locating-title">正在获取您的位置...</text>
					<text class="locating-desc">自动匹配最近的陪诊员</text>
				</view>
				<view v-else>
					<view class="quick-sheet-head">
						<view class="sheet-cancel" @tap="cancelQuickFlow">
							<AzIcon name="close" :size="16" color="#6B7280" />
							<text>取消</text>
						</view>
						<view class="match-title">
							<view class="match-check"><AzIcon :name="hasPinnedCompanion ? 'calendar' : 'check'" :size="16" color="#2B9A6F" /></view>
							<text>{{ hasPinnedCompanion ? '确认指定陪诊员预约' : '已为您匹配最近陪诊员' }}</text>
						</view>
					</view>
					<view class="matched-card">
						<view class="avatar"><AzIcon name="user" :size="30" color="#2B9A6F" /></view>
						<view class="preview-main">
							<view class="name-row">
								<text class="card-name">{{ matchedCompanion.name }}</text>
								<text class="status">在线</text>
							</view>
							<view class="meta-row">
								<AzIcon name="star" :size="16" color="#F5A623" />
								<text class="meta-strong">{{ matchedCompanion.rating }}</text>
								<text class="muted">({{ matchedCompanion.reviewCount }})</text>
								<AzIcon name="location" :size="15" color="#9CA3AF" />
								<text class="meta">{{ matchedCompanion.distance }}</text>
							</view>
						</view>
						<view class="sheet-meta">
							<text class="sheet-meta-price">¥{{ quickTotalPrice }}</text>
							<text class="sheet-meta-time">约{{ Math.round(matchedCompanion.distanceKm * 10) }}分钟到达</text>
						</view>
					</view>
					<view v-if="!hasPinnedCompanion" class="compact-summary">
						<text>系统将自动为您匹配最近陪诊员，继续滑动即可下单。</text>
					</view>
					<view v-if="hasPinnedCompanion" class="quick-select-panel">
						<text class="quick-select-title">选择服务</text>
						<view class="quick-service-grid">
							<view
								v-for="service in serviceTypes"
								:key="service.id"
								class="quick-service-chip"
								:class="{ active: quickSelectedService === service.id }"
								@tap="selectQuickService(service.id)"
							>
								<AzIcon :name="service.icon" :size="16" :color="quickSelectedService === service.id ? '#FFFFFF' : service.color" />
								<text>{{ service.name }}</text>
							</view>
						</view>
						<text class="quick-select-title hospital-title">选择医院</text>
						<view class="quick-hospital-list">
							<view
								v-for="hospital in quickHospitals"
								:key="hospital"
								class="quick-hospital-chip"
								:class="{ active: quickSelectedHospital === hospital }"
								@tap="selectQuickHospital(hospital)"
							>
								<AzIcon name="location" :size="15" :color="quickSelectedHospital === hospital ? '#2B9A6F' : '#9CA3AF'" />
								<text>{{ hospital }}</text>
							</view>
						</view>
						<view class="quick-mini-summary">
							<view class="mini-item">
								<text class="mini-label">服务</text>
								<text class="mini-value">{{ quickSelectedServiceData ? quickSelectedServiceData.name : '请选择' }}</text>
							</view>
							<view class="mini-item">
								<text class="mini-label">医院</text>
								<text class="mini-value">{{ quickSelectedHospital || '请选择' }}</text>
							</view>
							<view class="mini-item fee">
								<text class="mini-label">费用</text>
								<text class="mini-value">¥{{ quickTotalPrice }}</text>
							</view>
						</view>
					</view>
					<text class="swipe-tip">
						{{ hasPinnedCompanion ? (canConfirmQuick ? '向右滑动确认下单' : '请先选择服务和医院') : '向右滑动确认下单' }}
					</text>
					<view class="swipe-track" @touchmove.stop.prevent="onSwipeMove" @touchend.stop.prevent="onSwipeEnd" @touchcancel.stop.prevent="onSwipeEnd">
						<view class="swipe-fill" :style="swipeFillStyle" />
						<text class="swipe-label">
							{{ hasPinnedCompanion ? (canConfirmQuick ? '滑动确认下单' : '先完成上方选择') : '滑动确认下单' }}
						</text>
						<view
							class="swipe-handle"
							:class="{ disabled: hasPinnedCompanion && !canConfirmQuick }"
							:style="swipeHandleStyle"
							@touchstart.stop.prevent="onSwipeStart"
							@touchmove.stop.prevent="onSwipeMove"
							@touchend.stop.prevent="onSwipeEnd"
							@touchcancel.stop.prevent="onSwipeEnd"
						>
							<AzIcon name="right" :size="28" color="#FFFFFF" />
						</view>
					</view>
					<text v-if="!hasPinnedCompanion" class="tap-confirm" @tap="confirmQuick">或点击此处确认</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import AzIcon from '@/components/AzIcon.vue'
import { companions, serviceTypes } from '@/common/mockData.js'
import { broadcastText } from '@/utils/voice-broadcast.js'
import { stopVoicePlayback } from '@/utils/voice-player.js'
import { getCurrentPatient, initFamilyCareStore } from '@/utils/family-care.js'
import { createOrder } from '@/utils/order-service.js'
import {
	DEFAULT_MAP_CENTER,
	MAP_STYLE_CONFIG,
	buildCompanionLocations,
	getCurrentLocation
} from '@/utils/map.js'

const QUICK_HOSPITALS = ['上海市第一人民医院', '华山医院', '瑞金医院', '中山医院']

export default {
	components: { AzIcon },
	data() {
		return {
			companions,
			serviceTypes,
			selectedDotId: '1',
			manuallySelectedCompanionId: '',
			userLocation: null,
			locationError: false,
			companionLocations: {},
			mapPulseStep: 0,
			mapPulseTimer: null,
			quickOpen: false,
			locating: false,
			matchedCompanion: companions[0],
			quickHospitals: QUICK_HOSPITALS,
			quickSelectedService: '',
			quickSelectedHospital: '',
			swipeTrackWidth: 280,
			swipeHandleWidth: 56,
			swipeTranslate: 0,
			swipeStartX: 0,
			swipeStartTranslate: 0,
			swipeDragging: false,
			swipeAnimating: false,
			swipeConfirmed: false,
			swipeTimer: null,
			entryTouchStartY: 0,
			entrySwipeHandled: false
		}
	},
	computed: {
		currentPatient() {
			return getCurrentPatient()
		},
		mapSubKey() {
			return MAP_STYLE_CONFIG.subkey || ''
		},
		hasUserLocation() {
			return Boolean(this.userLocation)
		},
		mapCenter() {
			return this.userLocation || DEFAULT_MAP_CENTER
		},
		selectedCompanion() {
			const targetId = this.manuallySelectedCompanionId || this.selectedDotId
			return this.companions.find(item => item.id === targetId) || this.companions[0]
		},
		hasPinnedCompanion() {
			return Boolean(this.manuallySelectedCompanionId)
		},
		quickOrderTitle() {
			return this.hasPinnedCompanion && this.selectedCompanion
				? `现在预约${this.selectedCompanion.name}`
				: '一键下单'
		},
		quickOrderSubtitle() {
			if (!this.hasPinnedCompanion) return '自动匹配最近陪诊员'
			return this.selectedCompanion?.status === 'available'
				? '选择服务和医院后立即下单'
				: '当前陪诊员忙碌中，请重新选择'
		},
		quickSelectedServiceData() {
			return this.serviceTypes.find(item => item.id === this.quickSelectedService) || null
		},
		canConfirmQuick() {
			return Boolean(this.quickSelectedService && this.quickSelectedHospital && this.matchedCompanion)
		},
		quickTotalPrice() {
			const serviceFee = this.quickSelectedServiceData?.price || 0
			return serviceFee || this.matchedCompanion?.price || 0
		},
		mapMarkers() {
			const markers = []
			if (this.userLocation) {
				markers.push({
					id: 1000,
					latitude: this.userLocation.latitude,
					longitude: this.userLocation.longitude,
					width: 48,
					height: 48,
					anchor: { x: 0.5, y: 0.5 },
					iconPath: '/static/map-user-marker.png',
					label: this.buildMapLabel('我的位置', 'blue', 28),
					zIndex: 20
				})
			}
			this.companions.forEach((item, index) => {
				const point = this.companionLocations[item.id]
				if (!point) return
				markers.push({
					id: Number(item.id) || index + 1,
					latitude: point.latitude,
					longitude: point.longitude,
					width: this.selectedDotId === item.id ? 54 : 44,
					height: this.selectedDotId === item.id ? 54 : 44,
					anchor: { x: 0.5, y: 0.5 },
					iconPath: item.status === 'available' ? '/static/map-companion-marker.png' : '/static/map-companion-busy-marker.png',
					label: this.selectedDotId === item.id
						? this.buildMapLabel(item.name, item.status === 'available' ? 'green' : 'orange', 30)
						: null,
					zIndex: this.selectedDotId === item.id ? 18 : 12
				})
			})
			return markers
		},
		mapCircles() {
			const circles = []
			if (this.userLocation) {
				const userOuter = [98, 114, 130][this.mapPulseStep]
				const userInner = [62, 74, 86][this.mapPulseStep]
				circles.push({
					latitude: this.userLocation.latitude,
					longitude: this.userLocation.longitude,
					radius: userOuter,
					color: '#4A90D930',
					fillColor: '#4A90D90E',
					strokeWidth: 2
				})
				circles.push({
					latitude: this.userLocation.latitude,
					longitude: this.userLocation.longitude,
					radius: userInner,
					color: '#4A90D955',
					fillColor: '#4A90D918',
					strokeWidth: 2
				})
			}
			const selectedPoint = this.companionLocations[this.selectedDotId]
			if (selectedPoint) {
				const companionOuter = [112, 128, 144][this.mapPulseStep]
				const companionInner = [72, 84, 96][this.mapPulseStep]
				circles.push({
					latitude: selectedPoint.latitude,
					longitude: selectedPoint.longitude,
					radius: companionOuter,
					color: '#2B9A6F30',
					fillColor: '#2B9A6F0E',
					strokeWidth: 2
				})
				circles.push({
					latitude: selectedPoint.latitude,
					longitude: selectedPoint.longitude,
					radius: companionInner,
					color: '#2B9A6F55',
					fillColor: '#2B9A6F18',
					strokeWidth: 2
				})
			}
			return circles
		},
		swipeMaxTranslate() {
			return Math.max(this.swipeTrackWidth - this.swipeHandleWidth - 8, 0)
		},
		swipeThreshold() {
			const threshold = this.swipeTrackWidth * 0.85 - this.swipeHandleWidth / 2 - 4
			return Math.max(Math.min(threshold, this.swipeMaxTranslate), 0)
		},
		swipeHandleStyle() {
			return {
				transform: `translateX(${this.swipeTranslate}px)`,
				transition: this.swipeAnimating ? 'transform 220ms ease' : 'none'
			}
		},
		swipeFillStyle() {
			const auraWidth = this.swipeHandleWidth + 10
			return {
				width: `${auraWidth}px`,
				transform: `translateX(${Math.max(this.swipeTranslate - 1, 0)}px)`,
				transition: this.swipeAnimating ? 'transform 220ms ease' : 'none'
			}
		}
	},
	onLoad(query) {
		initFamilyCareStore()
		if (query.selectedId) this.selectedDotId = query.selectedId
		if (query.pinnedId) {
			this.manuallySelectedCompanionId = query.pinnedId
			this.selectedDotId = query.pinnedId
		}
		this.companionLocations = buildCompanionLocations(DEFAULT_MAP_CENTER, this.companions)
	},
	onShow() {
		this.startMapPulse()
		this.loadUserLocation()
	},
	onHide() {
		this.stopMapPulse()
		stopVoicePlayback()
	},
	onUnload() {
		this.stopMapPulse()
		stopVoicePlayback()
	},
	methods: {
		startMapPulse() {
			this.stopMapPulse()
			this.mapPulseTimer = setInterval(() => {
				this.mapPulseStep = (this.mapPulseStep + 1) % 3
			}, 700)
		},
		stopMapPulse() {
			if (this.mapPulseTimer) {
				clearInterval(this.mapPulseTimer)
				this.mapPulseTimer = null
			}
			this.mapPulseStep = 0
		},
		buildMapLabel(text, tone = 'green', anchorY = 24) {
			const styles = {
				blue: { bgColor: '#EEF5FF', color: '#3F7DD3' },
				green: { bgColor: '#EDF8F2', color: '#2B8F66' },
				orange: { bgColor: '#FFF4E8', color: '#D88422' },
				red: { bgColor: '#FFF1EE', color: '#D85C49' }
			}
			const palette = styles[tone] || styles.green
			return {
				content: text,
				color: palette.color,
				fontSize: 13,
				bgColor: palette.bgColor,
				borderRadius: 999,
				padding: 7,
				textAlign: 'center',
				anchorX: 0,
				anchorY
			}
		},
		async loadUserLocation(showFeedback = false) {
			try {
				const location = await getCurrentLocation()
				this.userLocation = {
					latitude: location.latitude,
					longitude: location.longitude
				}
				this.locationError = false
				this.companionLocations = buildCompanionLocations(this.userLocation, this.companions)
			} catch (error) {
				this.locationError = true
				if (showFeedback) {
					uni.showToast({ title: '请先允许定位，才能显示真实地图位置', icon: 'none' })
				}
			}
		},
		handleMarkerTap(event) {
			const markerId = String(event.detail.markerId)
			const matched = this.companions.find(item => item.id === markerId)
			if (!matched) return
			if (this.manuallySelectedCompanionId === matched.id) {
				this.manuallySelectedCompanionId = ''
				this.selectedDotId = this.companions[0]?.id || '1'
				return
			}
			this.manuallySelectedCompanionId = matched.id
			this.selectedDotId = matched.id
		},
		onEntryStart(event) {
			const touch = (event.touches && event.touches[0]) || null
			if (!touch) return
			this.entryTouchStartY = touch.clientY
			this.entrySwipeHandled = false
		},
		onEntryEnd(event) {
			const touch = (event.changedTouches && event.changedTouches[0]) || null
			if (!touch) return
			const deltaY = touch.clientY - this.entryTouchStartY
			if (deltaY < -50) {
				this.entrySwipeHandled = true
				uni.navigateBack({
					fail: () => {
						uni.reLaunch({ url: '/pages/index/index' })
					}
				})
			}
		},
		handleQuickOrderTap() {
			if (this.entrySwipeHandled) {
				this.entrySwipeHandled = false
				return
			}
			this.openQuickOrder(this.selectedCompanion)
		},
		buildMatchedOrderVoiceText() {
			if (!this.matchedCompanion) return ''
			if (!this.hasPinnedCompanion) {
				return `系统已为您匹配${this.matchedCompanion.name}，请根据页面提示继续完成下单。`
			}
			return `你选择了${this.matchedCompanion.name}为您陪诊，请根据界面提示选择服务和医院。`
		},
		async broadcastMatchedOrderInfo() {
			const text = this.buildMatchedOrderVoiceText()
			if (!text) return false
			try {
				await broadcastText(text, { silent: true })
				return true
			} catch (error) {
				uni.showToast({ title: error.message || '语音播报失败', icon: 'none' })
				return false
			}
		},
		selectQuickService(serviceId) {
			this.quickSelectedService = serviceId
		},
		selectQuickHospital(hospital) {
			this.quickSelectedHospital = hospital
		},
		openQuickOrder(companion) {
			if (!companion || companion.status !== 'available') return
			this.resetSwipe()
			this.quickOpen = true
			this.locating = true
			this.matchedCompanion = companion
			if (this.hasPinnedCompanion) {
				this.quickSelectedService = ''
				this.quickSelectedHospital = ''
			} else {
				this.quickSelectedService = 'registration'
				this.quickSelectedHospital = '上海市第一人民医院'
			}
			setTimeout(() => {
				this.locating = false
				this.$nextTick(() => this.measureSwipeTrack())
				this.broadcastMatchedOrderInfo()
			}, 500)
		},
		closeQuick() {
			this.quickOpen = false
			this.resetSwipe()
		},
		cancelQuickFlow() {
			this.closeQuick()
			this.manuallySelectedCompanionId = ''
			this.selectedDotId = this.companions[0]?.id || '1'
		},
		async confirmQuick() {
			if (this.hasPinnedCompanion && !this.canConfirmQuick) {
				uni.showToast({ title: '请先选择服务和医院', icon: 'none' })
				return
			}
			if (!this.currentPatient) {
				uni.showToast({ title: '请先选择就诊人', icon: 'none' })
				return
			}
			try {
				uni.showLoading({
					title: '正在创建订单',
					mask: true
				})
				const order = await createOrder({
					patientId: this.currentPatient.id,
					patientName: this.currentPatient.name,
					patientRelation: this.currentPatient.remarkRelation,
					serviceTypeId: this.quickSelectedService || 'registration',
					serviceType: this.quickSelectedServiceData?.name || '挂号陪诊',
					hospital: this.quickSelectedHospital || '上海市第一人民医院',
					date: '尽快安排',
					time: '平台自动协调',
					baseFee: this.quickTotalPrice,
					totalFee: this.quickTotalPrice,
					companionId: this.matchedCompanion.id,
					companionName: this.matchedCompanion.name,
					companionRating: this.matchedCompanion.rating
				})
				uni.showToast({ title: '下单成功', icon: 'success' })
				this.quickOpen = false
				this.resetSwipe()
				setTimeout(() => {
					uni.navigateTo({
						url: `/pages/payment/index?orderId=${order.id}&patientId=${this.currentPatient.id}`
					})
				}, 500)
			} catch (error) {
				this.swipeConfirmed = false
				this.swipeAnimating = true
				this.swipeTranslate = 0
				uni.showToast({
					title: error.message || '下单失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},
		measureSwipeTrack() {
			const query = uni.createSelectorQuery().in(this)
			query.select('.swipe-track').boundingClientRect()
			query.select('.swipe-handle').boundingClientRect()
			query.exec(rects => {
				const trackRect = rects && rects[0]
				const handleRect = rects && rects[1]
				if (trackRect && trackRect.width) this.swipeTrackWidth = trackRect.width
				if (handleRect && handleRect.width) this.swipeHandleWidth = handleRect.width
			})
		},
		getTouchPoint(event) {
			return (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]) || null
		},
		onSwipeStart(event) {
			if (this.locating || this.swipeConfirmed || (this.hasPinnedCompanion && !this.canConfirmQuick)) return
			const touch = this.getTouchPoint(event)
			if (!touch) return
			this.swipeDragging = true
			this.swipeAnimating = false
			this.swipeStartX = touch.clientX
			this.swipeStartTranslate = this.swipeTranslate
		},
		onSwipeMove(event) {
			if (!this.swipeDragging) return
			const touch = this.getTouchPoint(event)
			if (!touch) return
			const deltaX = touch.clientX - this.swipeStartX
			const nextTranslate = this.swipeStartTranslate + deltaX
			this.swipeTranslate = Math.min(Math.max(nextTranslate, 0), this.swipeMaxTranslate)
		},
		onSwipeEnd() {
			if (!this.swipeDragging) return
			this.swipeDragging = false
			if (this.swipeTranslate >= this.swipeThreshold) {
				this.swipeAnimating = true
				this.swipeTranslate = this.swipeMaxTranslate
				this.swipeConfirmed = true
				this.confirmQuick()
				return
			}
			this.swipeAnimating = true
			this.swipeTranslate = 0
		},
		resetSwipe() {
			this.swipeTranslate = 0
			this.swipeStartX = 0
			this.swipeStartTranslate = 0
			this.swipeDragging = false
			this.swipeAnimating = false
			this.swipeConfirmed = false
		}
	}
}
</script>

<style scoped>
.page { min-height: 100vh; background: #EAF4EE; }
.real-map { width: 100%; height: 100vh; }
.map-tint {
	position: fixed;
	inset: 0;
	background:
		linear-gradient(180deg, rgba(236,247,241,.30) 0%, rgba(248,251,249,.10) 36%, rgba(250,250,248,.12) 100%),
		linear-gradient(90deg, rgba(244,250,247,.10) 0%, rgba(255,255,255,0) 40%, rgba(244,250,247,.10) 100%);
	pointer-events: none;
}
.top-status { position: fixed; left: 12px; right: 12px; top: 18px; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.status-pill, .relocate { height: 36px; padding: 0 14px; border-radius: 999px; background: rgba(255,255,255,.86); border: 1px solid rgba(43,154,111,.10); box-shadow: 0 2px 8px rgba(45,45,45,.04); display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #2D2D2D; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #D1D5DB; }
.status-dot.ready { background: #2B9A6F; }
.map-legend { position: fixed; left: 12px; bottom: 176px; z-index: 5; padding: 8px 10px; border-radius: 14px; background: rgba(255,255,255,.80); border: 1px solid rgba(43,154,111,.08); box-shadow: 0 2px 6px rgba(45,45,45,.03); display: flex; flex-direction: column; gap: 6px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: #6B7280; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.legend-dot.blue { background: #4A90D9; }
.legend-dot.green { background: #2B9A6F; }
.map-meta { position: fixed; left: 12px; right: 12px; bottom: 136px; z-index: 5; display: flex; justify-content: center; }
.map-meta-text { padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,.78); border: 1px solid rgba(43,154,111,.08); font-size: 13px; color: #5F6B66; }
.entry-sheet { position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 6; padding: 10px 14px 14px; border-radius: 22px; background: rgba(255,255,255,.96); box-shadow: 0 6px 28px rgba(45,45,45,.14); }
.entry-handle { width: 42px; height: 4px; border-radius: 999px; background: #D8DFDB; margin: 0 auto 10px; }
.entry-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.entry-title { display: block; font-size: 19px; font-weight: 800; color: #2D2D2D; }
.entry-sub { display: block; margin-top: 4px; font-size: 14px; color: #6B7280; }
.entry-pill { min-width: 88px; height: 34px; padding: 0 12px; border-radius: 999px; background: #EDF8F2; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 13px; font-weight: 700; color: #2B9A6F; }
.entry-action { margin-top: 12px; height: 54px; border-radius: 16px; background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%); display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 18px; font-weight: 800; color: #FFFFFF; }
.entry-action.disabled { background: #C7D6CF; }
.entry-hint { display: block; margin-top: 8px; text-align: center; font-size: 13px; color: #8C9892; }
.sheet-mask { position: fixed; inset: 0; z-index: 20; background: rgba(0,0,0,.35); display: flex; align-items: flex-end; }
.quick-sheet { width: 100%; padding: 10px 16px calc(24px + env(safe-area-inset-bottom)); border-radius: 28px 28px 0 0; background: #FFFFFF; }
.sheet-handle { width: 40px; height: 4px; border-radius: 999px; background: #E8E5E0; margin: 0 auto 12px; }
.locating { padding: 28px 0; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.locate-icon { width: 64px; height: 64px; border-radius: 50%; background: #E8F5EE; display: flex; align-items: center; justify-content: center; animation: breathe 1.5s ease-in-out infinite; }
.locating-title { font-size: 18px; font-weight: 800; color: #2D2D2D; }
.locating-desc { font-size: 14px; color: #6B7280; }
.quick-sheet-head { display: flex; align-items: center; gap: 10px; }
.match-title { flex: 1; display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 800; color: #2D2D2D; }
.match-check { width: 32px; height: 32px; border-radius: 50%; background: #E8F5EE; display: flex; align-items: center; justify-content: center; }
.sheet-cancel { min-width: 74px; height: 34px; padding: 0 12px; border-radius: 999px; background: #F3F0EB; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 14px; font-weight: 700; color: #6B7280; }
.matched-card { margin-top: 12px; padding: 16px; border-radius: 20px; background: #FFFFFF; box-shadow: 0 4px 20px rgba(45,45,45,.10); display: flex; align-items: center; gap: 12px; }
.avatar { width: 56px; height: 56px; border-radius: 50%; background: rgba(43,154,111,.10); border: 2.5px solid #2B9A6F; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.preview-main { flex: 1; min-width: 0; }
.name-row { display: flex; align-items: center; gap: 8px; }
.card-name { font-size: 18px; font-weight: 800; color: #2D2D2D; }
.status { padding: 2px 8px; border-radius: 999px; background: rgba(43,154,111,.10); color: #2B9A6F; font-size: 13px; font-weight: 600; }
.meta-row { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 5px; }
.meta, .muted { font-size: 15px; color: #6B7280; }
.muted { color: #9CA3AF; }
.meta-strong { font-size: 15px; font-weight: 700; color: #2D2D2D; }
.sheet-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.sheet-meta-price { font-size: 22px; font-weight: 800; color: #2B9A6F; }
.sheet-meta-time { font-size: 13px; color: #6B7280; }
.compact-summary { margin-top: 12px; padding: 12px 14px; border-radius: 16px; background: #F7FAF8; font-size: 15px; line-height: 1.5; color: #5F6B66; }
.quick-select-panel { margin-top: 10px; padding: 10px 12px; border-radius: 18px; background: #F7FAF8; }
.quick-select-title { display: block; font-size: 15px; font-weight: 800; color: #2D2D2D; }
.hospital-title { margin-top: 10px; }
.quick-service-grid { margin-top: 8px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.quick-service-chip, .quick-hospital-chip { min-height: 50px; padding: 0 12px; border-radius: 14px; border: 1px solid #E2ECE7; background: #FFFFFF; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 16px; font-weight: 800; color: #5F6B66; }
.quick-service-chip.active { background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%); border-color: #2B9A6F; color: #FFFFFF; }
.quick-hospital-list { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px; }
.quick-hospital-chip.active { border-color: #2B9A6F; background: #EAF7F0; color: #2B9A6F; }
.quick-mini-summary { margin-top: 10px; padding-top: 10px; border-top: 1px solid #E2ECE7; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.mini-item { min-width: 0; padding: 8px 10px; border-radius: 12px; background: #FFFFFF; display: flex; flex-direction: column; gap: 4px; }
.mini-item.fee { background: #EDF8F2; }
.mini-label { font-size: 12px; color: #9CA3AF; }
.mini-value { font-size: 14px; font-weight: 800; color: #2D2D2D; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mini-item.fee .mini-value { color: #2B9A6F; }
.swipe-tip, .tap-confirm { display: block; margin-top: 12px; text-align: center; font-size: 14px; font-weight: 600; color: #9CA3AF; }
.swipe-track { position: relative; width: 280px; height: 56px; margin: 10px auto 0; border-radius: 999px; overflow: hidden; background: #E8F5EE; }
.swipe-fill { position: absolute; left: 0; top: 2px; height: 52px; border-radius: 999px; background: linear-gradient(135deg, rgba(43,154,111,.24) 0%, rgba(61,184,138,.18) 100%); box-shadow: 0 2px 8px rgba(43,154,111,.14); pointer-events: none; z-index: 1; }
.swipe-label { position: absolute; left: 0; right: 0; top: 0; height: 56px; display: flex; align-items: center; justify-content: center; color: #2B9A6F; font-size: 15px; font-weight: 700; }
.swipe-handle { position: absolute; left: 4px; top: 4px; width: 56px; height: 48px; border-radius: 999px; background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(43,154,111,.24); z-index: 3; touch-action: none; }
.swipe-handle.disabled { background: #C7D6CF; box-shadow: none; }
.tap-confirm { margin-top: 10px; color: #2B9A6F; text-decoration: underline; }
@keyframes breathe { 0%,100% { transform: scale(1); opacity: .75; } 50% { transform: scale(1.14); opacity: 1; } }
</style>
