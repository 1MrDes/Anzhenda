<template>
	<AzShell active="home" :voice-config="voiceConfig">
		<view class="page" :class="{ 'full-map-active': fullMapMode || fullMapLeaving }">
			<view class="hero">
				<view class="top-row">
					<view class="location">
						<AzIcon name="location" :size="20" color="#2B9A6F" />
						<text class="location-text">上海市浦东新区</text>
					</view>
				</view>
				<view class="greeting">
					<text class="hello">{{ greetingText }}</text>
					<text class="hint">{{ greetingHint }}</text>
				</view>
				<HomeAssistBar
					:current-level="settings.fontSizeLevel"
					@select-size="selectDisplaySize"
					@open-help="goHelpCenter"
				/>
			</view>

			<view class="toggle-row">
				<view class="toggle-btn" :class="{ active: viewMode === 'map' }" @tap="viewMode = 'map'">地图模式</view>
				<view class="toggle-btn" :class="{ active: viewMode === 'list' }" @tap="viewMode = 'list'">列表模式</view>
			</view>

			<view v-if="viewMode === 'map'" class="map-section">
				<view class="map-card">
					<map
						id="homeMap"
						class="real-map"
						:latitude="homeMapCenter.latitude"
						:longitude="homeMapCenter.longitude"
						:scale="homeMapScale"
						:subkey="mapSubKey"
						:markers="homeMapMarkers"
						:circles="homeMapCircles"
						:show-location="false"
						:enable-zoom="true"
						:enable-scroll="true"
						:enable-rotate="false"
					:enable-overlooking="false"
					:enable-poi="false"
					:enable-building="false"
						@markertap="handleHomeMarkerTap"
					/>
					<view class="map-tint" />
					<view v-if="locationError" class="map-error" @tap="loadUserLocation(true)">
						<AzIcon name="locate" :size="14" color="#2B9A6F" />
						<text>重新获取定位</text>
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
					<view class="map-bottom">
						<text class="map-count">附近 <text class="green">{{ availableCount }}</text> 位陪诊员可服务</text>
					</view>
				</view>

				<view class="map-drawer-trigger" @touchstart="onMapDrawerStart" @touchend="onMapDrawerEnd">
					<view class="map-drawer-handle" />
					<text class="map-drawer-text">下滑展开大地图</text>
				</view>

				<view class="quick-order compact" :class="{ disabled: selectedCompanion.status !== 'available' }" @tap="openQuickOrder(selectedCompanion)">
					<AzIcon name="zap" :size="22" color="#FFFFFF" />
					<text class="quick-title">{{ quickOrderTitle }}</text>
					<text class="quick-sub">{{ quickOrderSubtitle }}</text>
				</view>

				<view class="map-preview">
					<view class="avatar" :class="{ busy: selectedCompanion.status === 'busy' }">
						<AzIcon name="user" :size="28" :color="selectedCompanion.status === 'available' ? '#2B9A6F' : '#F5A623'" />
					</view>
					<view class="preview-main">
						<view class="name-row">
							<text class="card-name">{{ selectedCompanion.name }}</text>
							<text class="status" :class="{ busy: selectedCompanion.status === 'busy' }">{{ selectedCompanion.status === 'available' ? '在线' : '忙碌' }}</text>
						</view>
						<view class="meta-row">
							<AzIcon name="star" :size="16" color="#F5A623" />
							<text class="meta-strong">{{ selectedCompanion.rating }}</text>
							<AzIcon name="location" :size="15" color="#9CA3AF" />
							<text class="meta">{{ selectedCompanion.distance }}</text>
							<AzIcon name="clock" :size="15" color="#9CA3AF" />
							<text class="meta">约 {{ Math.round(selectedCompanion.distanceKm * 10) }} 分钟</text>
						</view>
					</view>
					<text class="price">¥{{ selectedCompanion.price }}</text>
					<view class="action-row full">
						<view class="muted-btn" @tap="goDetail(selectedCompanion.id)">查看详情</view>
						<view class="primary-btn" :class="{ disabled: selectedCompanion.status !== 'available' }" @tap="openQuickOrder(selectedCompanion)">
							<AzIcon name="calendar" :size="18" color="#FFFFFF" />
							<text>立即预约</text>
						</view>
					</view>
				</view>
			</view>

			<view v-else class="list-section">
				<view v-for="item in companions" :key="item.id" class="list-card" @tap="goDetail(item.id)">
					<view class="avatar small" :class="{ busy: item.status === 'busy' }">
						<AzIcon name="user" :size="26" :color="item.status === 'available' ? '#2B9A6F' : '#F5A623'" />
						<view class="online-dot" :class="{ busy: item.status === 'busy' }" />
					</view>
					<view class="list-main">
						<view class="name-row">
							<text class="card-name">{{ item.name }}</text>
							<text class="status" :class="{ busy: item.status === 'busy' }">{{ item.status === 'available' ? '可预约' : '忙碌中' }}</text>
						</view>
						<view class="meta-row">
							<AzIcon name="star" :size="15" color="#F5A623" />
							<text class="meta-strong">{{ item.rating }}</text>
							<text class="muted">({{ item.reviewCount }})</text>
							<text class="muted">|</text>
							<AzIcon name="location" :size="14" color="#9CA3AF" />
							<text class="meta">{{ item.distance }}</text>
						</view>
						<view class="tag-row">
							<text v-for="svc in item.services.slice(0, 3)" :key="svc" class="tag">{{ svc }}</text>
						</view>
					</view>
					<AzIcon name="right" :size="24" color="#9CA3AF" />
				</view>
			</view>

			<view class="service-section">
				<text class="section-title">快速预约服务</text>
				<view class="service-grid" :class="{ xlarge: settings.fontSizeLevel === 'xlarge' }">
					<view
						v-for="svc in serviceTypes"
						:key="svc.id"
						class="service-btn"
						:style="{ background: svc.bg }"
						@tap="goBooking(svc.id)"
					>
						<view class="service-icon-wrap">
							<AzIcon :name="svc.icon" :size="28" :color="svc.color" />
						</view>
						<text class="service-name" :style="{ color: svc.color }">{{ svc.name }}</text>
						<text v-if="svc.priority === 'urgent'" class="urgent-badge">紧急</text>
					</view>
				</view>
			</view>

			<view class="active-order" :class="{ empty: !activeOrder }" @tap="goTracking">
				<view class="active-icon">
					<AzIcon :name="activeOrder ? 'navigation' : 'file'" :size="24" color="#FFFFFF" />
				</view>
				<view class="active-main">
					<text class="active-title">{{ activeOrderTitle }}</text>
					<text class="active-desc">{{ activeOrderText }}</text>
				</view>
				<AzIcon v-if="activeOrder" name="right" :size="22" color="rgba(255,255,255,.85)" />
			</view>

			<transition name="full-map-drawer" @before-leave="onFullMapBeforeLeave" @after-leave="onFullMapAfterLeave">
				<view v-if="fullMapMode" class="full-map-layer">
					<map
						id="homeFullMap"
						class="full-real-map"
						:latitude="homeMapCenter.latitude"
						:longitude="homeMapCenter.longitude"
						:scale="15"
						:subkey="mapSubKey"
						:markers="homeMapMarkers"
						:circles="homeMapCircles"
						:show-location="false"
						:enable-zoom="true"
						:enable-scroll="true"
						:enable-rotate="false"
						:enable-overlooking="false"
						:enable-poi="false"
						:enable-building="false"
						@markertap="handleHomeMarkerTap"
						@tap="handleFullMapTap"
					/>
					<view class="full-map-tint" />
					<view class="full-map-back" @tap.stop="closeLargeMapMode">
						<AzIcon name="left" :size="18" color="#2D2D2D" />
						<text>返回</text>
					</view>
					<view v-if="locationError" class="full-map-error" @tap="loadUserLocation(true)">
						<AzIcon name="locate" :size="14" color="#2B9A6F" />
						<text>重新获取定位</text>
					</view>
					<view class="full-entry-sheet" @touchstart="onFullEntryStart" @touchend="onFullEntryEnd">
						<view class="full-entry-handle" />
						<view class="full-entry-head">
							<view>
								<text class="full-entry-title">{{ quickOrderTitle }}</text>
								<text class="full-entry-sub">{{ quickOrderSubtitle }}</text>
							</view>
							<view class="full-entry-pill">
								<AzIcon name="location" :size="14" color="#2B9A6F" />
								<text>{{ selectedCompanion.distance }}</text>
							</view>
						</view>
						<view class="full-entry-action" :class="{ disabled: selectedCompanion.status !== 'available' }" @tap="handleFullQuickTap">
							<AzIcon name="zap" :size="22" color="#FFFFFF" />
							<text>{{ quickOrderTitle }}</text>
						</view>
						<text class="full-entry-hint">上滑收起，点地图空白处返回默认样式</text>
					</view>
				</view>
			</transition>

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
								<text class="sheet-meta-time">约 {{ Math.round(matchedCompanion.distanceKm * 10) }} 分钟到达</text>
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
	</AzShell>
</template>

<script>
import AzShell from '@/components/AzShell.vue'
import AzIcon from '@/components/AzIcon.vue'
import HomeAssistBar from '@/components/HomeAssistBar.vue'
import { companions, serviceTypes } from '@/common/mockData.js'
import { broadcastText } from '@/utils/voice-broadcast.js'
import { getCurrentPatient, initFamilyCareStore } from '@/utils/family-care.js'
import { accessibilityState, initAccessibilitySettings, setFontSizeLevel } from '@/utils/accessibility.js'
import { stopVoicePlayback } from '@/utils/voice-player.js'
import { createOrder, getOrderProgressText, listOrders } from '@/utils/order-service.js'
import {
	DEFAULT_MAP_CENTER,
	MAP_STYLE_CONFIG,
	buildCompanionLocations,
	formatDistance,
	getCurrentLocation
} from '@/utils/map.js'

const QUICK_HOSPITALS = ['上海市第一人民医院', '华山医院', '瑞金医院', '中山医院']

export default {
	components: { AzShell, AzIcon, HomeAssistBar },
	data() {
		return {
			viewMode: 'map',
			companions,
			serviceTypes,
			selectedDotId: '1',
			manuallySelectedCompanionId: '',
			userLocation: null,
			locationError: false,
			companionLocations: {},
			homeMapScale: 14,
			activeOrder: null,
			mapPulseStep: 0,
			mapPulseTimer: null,
			quickOpen: false,
			locating: false,
			matchedCompanion: companions[0],
			quickHospitals: QUICK_HOSPITALS,
			quickSelectedService: '',
			quickSelectedHospital: '',
			fullMapMode: false,
			fullMapLeaving: false,
			lastMarkerTapAt: 0,
			mapDrawerStartY: 0,
			mapDrawerSwipeHandled: false,
			fullEntryStartY: 0,
			fullEntrySwipeHandled: false,
			swipeTrackWidth: 280,
			swipeHandleWidth: 56,
			swipeTranslate: 0,
			swipeStartX: 0,
			swipeStartTranslate: 0,
			swipeDragging: false,
			swipeAnimating: false,
			swipeConfirmed: false,
			swipeTimer: null
		}
	},
	computed: {
		currentPatient() {
			return getCurrentPatient()
		},
		settings() {
			return accessibilityState
		},
		hasUserLocation() {
			return Boolean(this.userLocation)
		},
		mapSubKey() {
			return MAP_STYLE_CONFIG.subkey || ''
		},
		homeMapCenter() {
			return this.userLocation || DEFAULT_MAP_CENTER
		},
		greetingText() {
			return this.currentPatient ? `${this.currentPatient.name}您好` : '您好'
		},
		greetingHint() {
			return this.currentPatient
				? `今天准备为${this.currentPatient.name}安排什么服务？`
				: '今天需要什么帮助？'
		},
		activeOrderText() {
			if (this.activeOrder) {
				return getOrderProgressText(this.activeOrder)
			}
			return '下单后会在这里显示订单进度'
		},
		activeOrderTitle() {
			return this.activeOrder ? '进行中的订单' : '目前暂无订单'
		},
		availableCount() {
			return this.companions.filter(item => item.status === 'available').length
		},
		nearestCompanion() {
			return this.companions
				.filter(item => item.status === 'available')
				.sort((a, b) => a.distanceKm - b.distanceKm)[0]
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
			if (!this.hasPinnedCompanion) {
				return '自动匹配最近陪诊员'
			}
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
		homeMapMarkers() {
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
						? this.buildMapLabel(
							item.name,
							item.status === 'available' ? 'green' : 'orange',
							30
						)
						: null,
					zIndex: this.selectedDotId === item.id ? 18 : 12
				})
			})
			return markers
		},
		homeMapCircles() {
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
		},
		voiceConfig() {
			return {
				panelTitle: '语音助手',
				statusText: '可以直接说：我要预约、一键下单、返回首页',
				commandHints: ['我要预约', '一键下单', '返回首页'],
				onCommand: command => this.handleVoiceCommand(command)
			}
		}
	},
	created() {
		initFamilyCareStore()
		initAccessibilitySettings()
		this.companionLocations = buildCompanionLocations(DEFAULT_MAP_CENTER, this.companions)
	},
	onShow() {
		this.startMapPulse()
		this.loadUserLocation()
		this.loadActiveOrder()
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
		async loadActiveOrder() {
			try {
				const orders = await listOrders()
				this.activeOrder = orders.find(order => ['in_progress', 'pending_payment'].includes(order.status)) || null
			} catch (error) {
				this.activeOrder = null
			}
		},
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
					uni.showToast({
						title: '请先允许定位，才能显示真实地图位置',
						icon: 'none'
					})
				}
			}
		},
		handleHomeMarkerTap(event) {
			const markerId = String(event.detail.markerId)
			const matched = this.companions.find(item => item.id === markerId)
			if (matched) {
				this.lastMarkerTapAt = Date.now()
				if (this.manuallySelectedCompanionId === matched.id) {
					this.manuallySelectedCompanionId = ''
					this.selectedDotId = this.nearestCompanion?.id || '1'
					return
				}
				this.manuallySelectedCompanionId = matched.id
				this.selectedDotId = matched.id
			}
		},
		onMapDrawerStart(event) {
			const touch = (event.touches && event.touches[0]) || null
			if (!touch) return
			this.mapDrawerStartY = touch.clientY
			this.mapDrawerSwipeHandled = false
		},
		onMapDrawerEnd(event) {
			const touch = (event.changedTouches && event.changedTouches[0]) || null
			if (!touch) return
			const deltaY = touch.clientY - this.mapDrawerStartY
			if (deltaY > 28) {
				this.mapDrawerSwipeHandled = true
				this.openLargeMapMode()
			}
		},
		handleFullMapTap() {
			if (Date.now() - this.lastMarkerTapAt < 260) return
			this.closeLargeMapMode()
		},
		openLargeMapMode() {
			this.fullMapLeaving = false
			this.fullMapMode = true
		},
		closeLargeMapMode() {
			this.fullMapMode = false
			this.mapDrawerSwipeHandled = false
			this.fullEntrySwipeHandled = false
		},
		onFullMapBeforeLeave() {
			this.fullMapLeaving = true
		},
		onFullMapAfterLeave() {
			this.fullMapLeaving = false
		},
		onFullEntryStart(event) {
			const touch = (event.touches && event.touches[0]) || null
			if (!touch) return
			this.fullEntryStartY = touch.clientY
			this.fullEntrySwipeHandled = false
		},
		onFullEntryEnd(event) {
			const touch = (event.changedTouches && event.changedTouches[0]) || null
			if (!touch) return
			const deltaY = touch.clientY - this.fullEntryStartY
			if (deltaY < -40) {
				this.fullEntrySwipeHandled = true
				this.closeLargeMapMode()
			}
		},
		handleFullQuickTap() {
			if (this.fullEntrySwipeHandled) {
				this.fullEntrySwipeHandled = false
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
		async handleVoiceCommand(command) {
			switch (command.type) {
				case 'start_booking':
					uni.navigateTo({ url: '/pages/booking/index?voiceFlow=1' })
					return { handled: true }
				case 'quick_order':
					uni.showToast({ title: '正在为您一键下单', icon: 'none' })
					this.openQuickOrder(this.nearestCompanion)
					return { handled: true }
				case 'go_home':
					this.closeQuick()
					uni.reLaunch({ url: '/pages/index/index' })
					return { handled: true }
				case 'broadcast_booking':
					if (!this.quickOpen || this.locating) return { handled: false }
					return { handled: await this.broadcastMatchedOrderInfo() }
				default:
					return { handled: false }
			}
		},
		goDetail(id) {
			uni.navigateTo({ url: `/pages/companion/detail?id=${id}` })
		},
		goBooking(service) {
			uni.navigateTo({ url: `/pages/booking/index?service=${service}` })
		},
		selectDisplaySize(level) {
			if (this.settings.fontSizeLevel === level) return
			setFontSizeLevel(level)
			uni.showToast({
				title: level === 'xlarge' ? '已切换为超大界面' : '已切换为大界面',
				icon: 'none'
			})
		},
		goHelpCenter() {
			uni.navigateTo({ url: '/pages/help/index' })
		},
		goTracking() {
			if (!this.activeOrder) {
				uni.showToast({
					title: '暂无进行中的订单',
					icon: 'none'
				})
				return
			}
			uni.navigateTo({ url: `/pages/tracking/index?orderId=${this.activeOrder.id}` })
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
			}, 700)
		},
		closeQuick() {
			this.quickOpen = false
			this.resetSwipe()
		},
		cancelQuickFlow() {
			this.closeQuick()
			this.manuallySelectedCompanionId = ''
			this.selectedDotId = this.nearestCompanion?.id || '1'
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
				this.clearSwipeTimer()
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
				this.activeOrder = order
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
			this.swipeStartX = touch.pageX
			this.swipeStartTranslate = this.swipeTranslate
		},
		onSwipeMove(event) {
			if (!this.swipeDragging || this.locating || this.swipeConfirmed) return
			const touch = this.getTouchPoint(event)
			if (!touch) return
			const deltaX = touch.pageX - this.swipeStartX
			const nextTranslate = this.swipeStartTranslate + deltaX
			this.swipeTranslate = Math.max(0, Math.min(nextTranslate, this.swipeMaxTranslate))
		},
		onSwipeEnd() {
			if (!this.swipeDragging || this.locating || this.swipeConfirmed) return
			this.swipeDragging = false
			this.swipeAnimating = true
			if (this.swipeTranslate >= this.swipeThreshold) {
				this.swipeConfirmed = true
				this.swipeTranslate = this.swipeMaxTranslate
				this.swipeTimer = setTimeout(() => {
					this.confirmQuick()
				}, 260)
				return
			}
			this.swipeTranslate = 0
		},
		resetSwipe() {
			this.clearSwipeTimer()
			this.swipeDragging = false
			this.swipeAnimating = false
			this.swipeConfirmed = false
			this.swipeTranslate = 0
			this.swipeStartX = 0
			this.swipeStartTranslate = 0
		},
		clearSwipeTimer() {
			if (this.swipeTimer) {
				clearTimeout(this.swipeTimer)
				this.swipeTimer = null
			}
		}
	},
	beforeUnmount() {
		this.stopMapPulse()
		this.clearSwipeTimer()
		stopVoicePlayback()
	}
}
</script>

<style scoped>
.page { min-height: 100vh; padding-bottom: calc(var(--bottom-panel-offset, 72px) + 46px); background: #FAFAF8; }
.hero { padding: 42px 20px 18px; background: linear-gradient(180deg, #E8F5EE 0%, #FAFAF8 100%); }
.top-row, .location, .name-row, .meta-row, .action-row, .match-title, .detail-line { display: flex; align-items: center; }
.top-row { justify-content: space-between; }
.location { gap: 6px; }
.location-text { font-size: 18px; font-weight: 600; color: #2D2D2D; }
.greeting { margin-top: 16px; display: flex; flex-direction: column; }
.hello { font-size: 28px; font-weight: 800; color: #2D2D2D; line-height: 1.25; }
.hint { margin-top: 4px; font-size: 16px; color: #6B7280; }
.toggle-row { padding: 0 20px 12px; display: flex; gap: 12px; }
.toggle-btn { flex: 1; height: 44px; border-radius: 12px; border: 1.5px solid #E8E5E0; background: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 600; color: #6B7280; }
.toggle-btn.active { border-color: #2B9A6F; background: #2B9A6F; color: #FFFFFF; box-shadow: 0 4px 12px rgba(43,154,111,.25); }
.map-section, .list-section, .service-section { padding: 0 20px; }
.map-card { position: relative; height: 228px; border-radius: 20px; overflow: hidden; background: #E8F5EE; }
.real-map { width: 100%; height: 100%; }
.map-tint {
	position: absolute;
	inset: 0;
	background:
		linear-gradient(180deg, rgba(236,247,241,.30) 0%, rgba(248,251,249,.12) 30%, rgba(250,250,248,.18) 100%),
		linear-gradient(90deg, rgba(244,250,247,.10) 0%, rgba(255,255,255,0) 40%, rgba(244,250,247,.10) 100%);
	pointer-events: none;
}
.map-legend {
	position: absolute;
	left: 12px;
	bottom: 54px;
	padding: 7px 9px;
	border-radius: 12px;
	background: rgba(255,255,255,.78);
	border: 1px solid rgba(43,154,111,.08);
	box-shadow: 0 2px 6px rgba(45,45,45,.03);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 5px;
	justify-content: flex-start;
}
.legend-item {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 11px;
	font-weight: 600;
	color: #6B7280;
}
.legend-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
}
.legend-dot.blue { background: #4A90D9; }
.legend-dot.green { background: #2B9A6F; }
.legend-dot.red { background: #E85D4A; }
.map-error {
	position: absolute;
	right: 12px;
	top: 12px;
	height: 34px;
	padding: 0 12px;
	border-radius: 999px;
	background: rgba(255,255,255,.86);
	border: 1px solid rgba(43,154,111,.10);
	box-shadow: 0 2px 8px rgba(45,45,45,.04);
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 13px;
	font-weight: 700;
	color: #2B9A6F;
}
.map-bottom { position: absolute; left: 0; right: 0; bottom: 0; padding: 26px 16px 12px; background: linear-gradient(to top, rgba(248,250,249,.92), rgba(255,255,255,0)); }
.map-count { font-size: 16px; font-weight: 700; color: #2D2D2D; }
.green { color: #2B9A6F; }
.map-drawer-trigger { margin-top: 6px; height: 38px; border-radius: 18px 18px 14px 14px; background: rgba(255,255,255,.94); box-shadow: 0 4px 14px rgba(45,45,45,.06); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
.map-drawer-handle { width: 44px; height: 4px; border-radius: 999px; background: #D6DED9; }
.map-drawer-text { font-size: 13px; font-weight: 700; color: #8B9791; }
.quick-order { position: relative; margin-top: 12px; min-height: 60px; border-radius: 18px; background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 50%, #2B9A6F 100%); display: flex; align-items: center; justify-content: center; gap: 10px; color: #FFFFFF; overflow: hidden; }
.quick-order.compact { margin-top: 10px; min-height: 52px; border-radius: 16px; }
.quick-order.compact .quick-title { font-size: 17px; }
.quick-order.compact .quick-sub { font-size: 13px; }
.quick-order.disabled { background: #C7D6CF; }
.quick-title { font-size: 18px; font-weight: 800; color: #FFFFFF; }
.quick-sub { font-size: 14px; color: rgba(255,255,255,.82); }
.map-preview, .list-card, .matched-card { margin-top: 8px; padding: 12px 14px 10px; border-radius: 20px; background: #FFFFFF; box-shadow: 0 4px 20px rgba(45,45,45,.10); display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.list-card { margin-top: 0; margin-bottom: 12px; box-shadow: 0 2px 12px rgba(45,45,45,.06); }
.avatar { width: 56px; height: 56px; border-radius: 50%; background: rgba(43,154,111,.10); border: 2.5px solid #2B9A6F; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar.small { width: 56px; height: 56px; position: relative; }
.avatar.busy { background: rgba(245,166,35,.10); border-color: #F5A623; }
.preview-main, .list-main { flex: 1; min-width: 0; }
.name-row { gap: 8px; }
.card-name { font-size: 18px; font-weight: 800; color: #2D2D2D; }
.status { padding: 2px 8px; border-radius: 999px; background: rgba(43,154,111,.10); color: #2B9A6F; font-size: 13px; font-weight: 600; }
.status.busy { background: rgba(245,166,35,.12); color: #F5A623; }
.meta-row { margin-top: 4px; gap: 5px; flex-wrap: wrap; }
.meta, .muted { font-size: 15px; color: #6B7280; }
.muted { color: #9CA3AF; }
.meta-strong { font-size: 15px; font-weight: 700; color: #2D2D2D; }
.price { font-size: 20px; font-weight: 800; color: #2B9A6F; }
.tag-row { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 6px; }
.tag-row.full, .action-row.full { width: 100%; }
.tag { padding: 4px 8px; border-radius: 8px; background: #E8F5EE; color: #2B9A6F; font-size: 13px; font-weight: 600; }
.action-row { margin-top: 0; gap: 8px; }
.muted-btn, .primary-btn { flex: 1; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 17px; font-weight: 700; }
.muted-btn { background: #F3F0EB; color: #6B7280; }
.primary-btn { background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%); color: #FFFFFF; }
.primary-btn.disabled { background: #D1D5DB; }
.online-dot { position: absolute; right: 0; bottom: 0; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #FFFFFF; background: #2B9A6F; }
.online-dot.busy { background: #F5A623; }
.section-title { display: block; margin: 24px 0 16px; font-size: 20px; font-weight: 800; color: #2D2D2D; }
.service-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.service-btn { position: relative; height: 80px; border-radius: 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
.service-icon-wrap { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.service-name { font-size: 16px; font-weight: 800; }
.urgent-badge { position: absolute; right: 8px; top: 8px; padding: 2px 8px; border-radius: 999px; background: #E85D4A; color: #FFFFFF; font-size: 12px; font-weight: 800; }
.service-grid.xlarge { gap: 14px; }
.service-grid.xlarge .service-btn {
	height: 96px;
	padding: 10px 8px 8px;
	gap: 6px;
	overflow: hidden;
}
.service-grid.xlarge .service-icon-wrap {
	transform: scale(0.86);
	transform-origin: center center;
}
.service-grid.xlarge .service-name {
	font-size: 15px;
	line-height: 1.2;
	text-align: center;
}
.service-grid.xlarge .urgent-badge {
	right: 6px;
	top: 6px;
	padding: 2px 6px;
	font-size: 11px;
}
.active-order { margin: 24px 20px 0; padding: 16px; border-radius: 18px; background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%); box-shadow: 0 4px 16px rgba(43,154,111,.3); display: flex; align-items: center; gap: 14px; }
.active-order.empty { background: linear-gradient(135deg, #AEBBB5 0%, #C6D1CC 100%); box-shadow: 0 3px 12px rgba(96,112,104,.16); }
.active-icon { width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,.20); display: flex; align-items: center; justify-content: center; }
.active-main { flex: 1; display: flex; flex-direction: column; }
.active-title { font-size: 16px; font-weight: 800; color: #FFFFFF; }
.active-desc { margin-top: 4px; font-size: 14px; color: rgba(255,255,255,.82); }
.full-map-layer { position: fixed; inset: 0; z-index: 35; background: #EAF4EE; }
.full-real-map { width: 100%; height: 100%; }
.map-card {
	transition: transform .42s cubic-bezier(.2, .82, .22, 1), border-radius .42s cubic-bezier(.2, .82, .22, 1), box-shadow .38s ease, opacity .26s ease;
	transform-origin: center top;
}
.page.full-map-active .map-card {
	transform: scale(1.02);
	border-radius: 28px;
	box-shadow: 0 10px 28px rgba(45,45,45,.12);
}
.full-map-drawer-enter-active {
	transition: opacity .28s ease, transform .42s cubic-bezier(.2, .82, .22, 1);
}
.full-map-drawer-leave-active {
	transition: opacity .34s ease, transform .48s cubic-bezier(.16, .78, .2, 1);
}
.full-map-drawer-enter-from,
.full-map-drawer-leave-to {
	opacity: 0;
	transform: translateY(13%) scale(1.008);
}
.full-map-drawer-enter-to,
.full-map-drawer-leave-from {
	opacity: 1;
	transform: translateY(0);
}
.full-map-tint {
	position: absolute;
	inset: 0;
	background:
		linear-gradient(180deg, rgba(236,247,241,.28) 0%, rgba(248,251,249,.10) 34%, rgba(250,250,248,.14) 100%),
		linear-gradient(90deg, rgba(244,250,247,.10) 0%, rgba(255,255,255,0) 40%, rgba(244,250,247,.10) 100%);
	pointer-events: none;
}
.full-map-back {
	position: absolute;
	top: 16px;
	left: 12px;
	z-index: 4;
	height: 38px;
	padding: 0 14px 0 12px;
	border-radius: 999px;
	background: rgba(255,255,255,.9);
	border: 1px solid rgba(43,154,111,.10);
	box-shadow: 0 2px 8px rgba(45,45,45,.05);
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 14px;
	font-weight: 700;
	color: #2D2D2D;
}
.full-map-error { position: absolute; top: 16px; right: 12px; z-index: 3; height: 34px; padding: 0 12px; border-radius: 999px; background: rgba(255,255,255,.86); border: 1px solid rgba(43,154,111,.10); box-shadow: 0 2px 8px rgba(45,45,45,.04); display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #2B9A6F; }
.full-entry-sheet { position: absolute; left: 12px; right: 12px; bottom: calc(var(--bottom-panel-offset, 72px) + 42px); z-index: 3; padding: 10px 14px 14px; border-radius: 22px; background: rgba(255,255,255,.96); box-shadow: 0 10px 32px rgba(45,45,45,.16); }
.full-map-drawer-enter-active .full-entry-sheet {
	transition: transform .44s cubic-bezier(.2, .85, .25, 1), opacity .28s ease;
}
.full-map-drawer-leave-active .full-entry-sheet {
	transition: transform .52s cubic-bezier(.16, .78, .2, 1), opacity .32s ease;
}
.full-map-drawer-enter-from .full-entry-sheet,
.full-map-drawer-leave-to .full-entry-sheet {
	transform: translateY(46px) scale(.985);
	opacity: 0;
}
.full-map-drawer-enter-to .full-entry-sheet,
.full-map-drawer-leave-from .full-entry-sheet {
	transform: translateY(0);
	opacity: 1;
}
.full-entry-handle { width: 42px; height: 4px; border-radius: 999px; background: #D8DFDB; margin: 0 auto 10px; }
.full-entry-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.full-entry-title { display: block; font-size: 19px; font-weight: 800; color: #2D2D2D; }
.full-entry-sub { display: block; margin-top: 4px; font-size: 14px; color: #6B7280; }
.full-entry-pill { min-width: 88px; height: 34px; padding: 0 12px; border-radius: 999px; background: #EDF8F2; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 13px; font-weight: 700; color: #2B9A6F; }
.full-entry-action { margin-top: 12px; height: 54px; border-radius: 16px; background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%); display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 18px; font-weight: 800; color: #FFFFFF; }
.full-entry-action.disabled { background: #C7D6CF; }
.full-entry-hint { display: block; margin-top: 8px; text-align: center; font-size: 13px; color: #8C9892; }
.sheet-mask { position: fixed; inset: 0; z-index: 70; background: rgba(0,0,0,.35); display: flex; align-items: flex-end; }
.quick-sheet { width: 100%; padding: 10px 16px calc(24px + env(safe-area-inset-bottom)); border-radius: 28px 28px 0 0; background: #FFFFFF; }
.sheet-handle { width: 40px; height: 4px; border-radius: 999px; background: #E8E5E0; margin: 0 auto 12px; }
.locating { padding: 28px 0; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.locate-icon { width: 64px; height: 64px; border-radius: 50%; background: #E8F5EE; display: flex; align-items: center; justify-content: center; animation: breathe 1.5s ease-in-out infinite; }
.locating-title { font-size: 18px; font-weight: 800; color: #2D2D2D; }
.locating-desc { font-size: 14px; color: #6B7280; }
.quick-sheet-head { display: flex; align-items: center; gap: 10px; }
.match-title { flex: 1; gap: 8px; font-size: 17px; font-weight: 800; color: #2D2D2D; }
.match-check { width: 32px; height: 32px; border-radius: 50%; background: #E8F5EE; display: flex; align-items: center; justify-content: center; }
.sheet-cancel { min-width: 74px; height: 34px; padding: 0 12px; border-radius: 999px; background: #F3F0EB; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 14px; font-weight: 700; color: #6B7280; }
.order-detail { margin-top: 10px; padding: 8px 12px; border-radius: 16px; background: #FAFAF8; }
.summary-panel { margin-top: 12px; }
.summary-panel.compact .detail-line { padding: 8px 0; }
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
.sheet-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.sheet-meta-price { font-size: 22px; font-weight: 800; color: #2B9A6F; }
.sheet-meta-time { font-size: 13px; color: #6B7280; }
.compact-summary { margin-top: 12px; padding: 12px 14px; border-radius: 16px; background: #F7FAF8; font-size: 15px; line-height: 1.5; color: #5F6B66; }
.detail-line { justify-content: space-between; padding: 8px 0; font-size: 15px; color: #6B7280; }
.detail-line text:last-child { font-weight: 700; color: #2D2D2D; }
.detail-line.border { border-top: 1px solid #E8E5E0; }
.detail-line .fee { font-size: 22px; color: #2B9A6F !important; }
.swipe-tip, .tap-confirm { display: block; margin-top: 12px; text-align: center; font-size: 14px; font-weight: 600; color: #9CA3AF; }
.swipe-track { position: relative; width: 280px; height: 56px; margin: 10px auto 0; border-radius: 999px; overflow: hidden; background: #E8F5EE; }
.swipe-fill { position: absolute; left: 0; top: 2px; height: 52px; border-radius: 999px; background: linear-gradient(135deg, rgba(43,154,111,.24) 0%, rgba(61,184,138,.18) 100%); box-shadow: 0 2px 8px rgba(43,154,111,.14); pointer-events: none; z-index: 1; }
.swipe-label { position: absolute; left: 0; right: 0; top: 0; height: 56px; display: flex; align-items: center; justify-content: center; color: #2B9A6F; font-size: 15px; font-weight: 700; }
.swipe-handle { position: absolute; left: 4px; top: 4px; width: 56px; height: 48px; border-radius: 999px; background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(43,154,111,.24); z-index: 3; touch-action: none; }
.swipe-handle.disabled { background: #C7D6CF; box-shadow: none; }
.tap-confirm { margin-top: 10px; color: #2B9A6F; text-decoration: underline; }
@keyframes ping { 0% { transform: scale(1); opacity: .45; } 100% { transform: scale(1.8); opacity: 0; } }
@keyframes breathe { 0%,100% { transform: scale(1); opacity: .75; } 50% { transform: scale(1.14); opacity: 1; } }
</style>



