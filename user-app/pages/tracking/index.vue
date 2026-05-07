<template>
	<AzShell active="">
		<view class="page">
			<view class="back" @tap="back"><AzIcon name="left" :size="24" color="#2D2D2D" /></view>

			<view class="map-wrap">
				<map
					id="trackingMap"
					class="real-map"
					:latitude="mapCenter.latitude"
					:longitude="mapCenter.longitude"
					:scale="15"
					:subkey="mapSubKey"
					:markers="trackingMarkers"
					:circles="trackingCircles"
					:polyline="trackingPolyline"
					:show-location="false"
					:enable-zoom="true"
					:enable-scroll="true"
					:enable-rotate="false"
					:enable-overlooking="false"
					:enable-poi="false"
					:enable-building="false"
				/>
				<view class="map-tint" />
				<view class="distance-chip">
					<AzIcon name="location" :size="16" color="#2B9A6F" />
					<text>{{ userLocation ? `相距 ${liveDistanceText}` : '授权定位后可查看实时距离' }}</text>
				</view>
				<view v-if="locationError" class="map-error" @tap="loadTrackingLocation(true)">
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
					<view class="legend-item">
						<view class="legend-dot red" />
						<text>医院</text>
					</view>
				</view>
			</view>

			<view class="companion-card">
				<view class="avatar">{{ companion.name.charAt(0) }}</view>
				<view class="grow">
					<view class="row">
						<text class="name">{{ companion.name }}</text>
						<view class="status"><view class="blink" />{{ stageStatusText }}</view>
					</view>
					<view class="score">
						<AzIcon name="star" :size="16" color="#F5A623" />
						<text>{{ companion.rating }}</text>
						<text class="muted">（{{ companion.reviewCount }}条评价）</text>
					</view>
				</view>
				<view class="actions">
					<view class="phone"><AzIcon name="phone" :size="20" color="#FFFFFF" /><text>拨打电话</text></view>
					<view class="msg"><AzIcon name="message" :size="20" color="#2D2D2D" /><text>发送消息</text></view>
				</view>
			</view>

			<view class="eta-panel">
				<AzIcon name="clock" :size="18" color="#2B9A6F" />
				<text>预计 {{ etaText }} 到达</text>
			</view>

			<view class="section">
				<text class="section-title">订单进度</text>
				<view class="timeline">
					<view v-for="(step, index) in steps" :key="step.label" class="step">
						<view v-if="index < steps.length - 1" class="connector" :class="{ done: step.status === 'completed' }" />
						<view class="step-icon" :class="step.status">
							<AzIcon v-if="step.status === 'completed'" name="check" :size="16" color="#FFFFFF" />
							<AzIcon v-else-if="step.status === 'active'" name="navigation" :size="16" color="#FFFFFF" />
							<view v-else class="dot" />
						</view>
						<view>
							<text class="step-label" :class="{ pending: step.status === 'pending' }">{{ step.label }}</text>
							<text class="step-time">{{ step.time }}</text>
						</view>
					</view>
				</view>
			</view>

			<view v-if="currentOrder && currentOrder.pickupProofImage" class="proof-card">
				<text class="section-title">接到用户核验</text>
				<text class="proof-desc">陪诊员已上传接到您的现场核验图片</text>
				<image class="proof-image" :src="currentOrder.pickupProofImage" mode="aspectFill" @tap="previewPickupProof" />
			</view>

			<view class="detail-card">
				<text class="section-title">订单详情</text>
				<view class="detail-line">
					<view class="detail-icon green-bg"><AzIcon name="clock" :size="16" color="#2B9A6F" /></view>
					<view>
						<text class="label">预约时间</text>
						<text class="value">{{ orderSummary.date }} {{ orderSummary.time }}</text>
					</view>
				</view>
				<view class="detail-line">
					<view class="detail-icon blue-bg"><AzIcon name="location" :size="16" color="#4A90D9" /></view>
					<view>
						<text class="label">就诊医院</text>
						<text class="value">{{ orderSummary.hospital }}</text>
					</view>
				</view>
				<view class="detail-line">
					<view class="detail-icon purple-bg"><AzIcon name="navigation" :size="16" color="#7C6BC4" /></view>
					<view>
						<text class="label">服务类型</text>
						<text class="value">{{ orderSummary.serviceType }}</text>
					</view>
				</view>
			</view>
		</view>
	</AzShell>
</template>

<script>
import AzShell from '@/components/AzShell.vue'
import AzIcon from '@/components/AzIcon.vue'
import { companions } from '@/common/mockData.js'
import {
	DEFAULT_MAP_CENTER,
	MAP_STYLE_CONFIG,
	calculateDistanceKm,
	formatDistance,
	getCurrentLocation,
	offsetCoordinate
} from '@/utils/map.js'
import { getOrderCompanionName, getOrderDetail } from '@/utils/order-service.js'

function formatTimeLabel(timestamp, fallback) {
	if (!timestamp) return fallback
	const date = new Date(timestamp)
	return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function buildTrackingSteps(order) {
	const createdAt = formatTimeLabel(order?.createdAt, '待更新')
	const paidAt = formatTimeLabel(order?.paidAt, createdAt)
	const stage = order?.serviceStage || (order?.paymentStatus === 'paid' ? 'waiting_accept' : 'pending_payment')
	const stageFlow = ['pending_payment', 'waiting_accept', 'accepted', 'on_the_way', 'picked_up', 'arrived', 'serving', 'completed']
	const currentIndex = stageFlow.indexOf(stage)
	const resolveStatus = (targetStage) => {
		const targetIndex = stageFlow.indexOf(targetStage)
		if (targetIndex === -1 || currentIndex === -1) return 'pending'
		if (currentIndex > targetIndex) return 'completed'
		if (currentIndex === targetIndex) return 'active'
		return 'pending'
	}

	return [
		{ label: '已下单', time: createdAt, status: 'completed' },
		{ label: '支付完成', time: order?.paymentStatus === 'paid' ? paidAt : '待支付', status: order?.paymentStatus === 'paid' ? 'completed' : 'active' },
		{ label: '陪诊员已接单', time: formatTimeLabel(order?.acceptedAt, '待接单'), status: resolveStatus('accepted') },
		{ label: '正在前往', time: formatTimeLabel(order?.onTheWayAt, '待出发'), status: resolveStatus('on_the_way') },
		{ label: '已接到您', time: formatTimeLabel(order?.pickedUpAt, '待更新'), status: resolveStatus('picked_up') },
		{ label: '已到达医院', time: formatTimeLabel(order?.arrivedAt, '待更新'), status: resolveStatus('arrived') },
		{ label: '陪诊服务中', time: formatTimeLabel(order?.serviceStartedAt, '待开始'), status: resolveStatus('serving') },
		{ label: '服务完成', time: formatTimeLabel(order?.completedAt, '待完成'), status: resolveStatus('completed') }
	]
}

export default {
	components: { AzShell, AzIcon },
	data() {
		return {
			companion: companions[0],
			orderId: '',
			orderSummary: {
				hospital: '上海市第一人民医院',
				serviceType: '挂号陪诊',
				date: '2026-04-18',
				time: '09:00'
			},
			currentOrder: null,
			steps: buildTrackingSteps(),
			userLocation: null,
			locationError: false,
			mapPulseStep: 0,
			mapPulseTimer: null
		}
	},
	computed: {
		mapSubKey() {
			return MAP_STYLE_CONFIG.subkey || ''
		},
		companionLocation() {
			const base = this.userLocation || DEFAULT_MAP_CENTER
			return offsetCoordinate(base, this.companion.distanceKm || 0.8, 38)
		},
		hospitalLocation() {
			const base = this.userLocation || DEFAULT_MAP_CENTER
			return offsetCoordinate(base, 1.6, 72)
		},
		mapCenter() {
			if (!this.userLocation) return this.companionLocation
			return {
				latitude: Number(((this.userLocation.latitude + this.companionLocation.latitude) / 2).toFixed(6)),
				longitude: Number(((this.userLocation.longitude + this.companionLocation.longitude) / 2).toFixed(6))
			}
		},
		liveDistanceKm() {
			if (!this.userLocation) return this.companion.distanceKm || 0
			return calculateDistanceKm(this.userLocation, this.companionLocation)
		},
		liveDistanceText() {
			return formatDistance(this.liveDistanceKm)
		},
		etaText() {
			const minutes = Math.max(3, Math.round(this.liveDistanceKm * 10))
			return `${minutes}分钟`
		},
		stageStatusText() {
			const stage = this.currentOrder?.serviceStage || 'on_the_way'
			const companionName = getOrderCompanionName(this.currentOrder || { companionName: this.companion.name })
			const labels = {
				pending_payment: '待支付',
				waiting_accept: '等待陪诊员接单',
				accepted: `${companionName}已接单`,
				on_the_way: '陪诊员正在前往',
				picked_up: '已接到您，前往医院',
				arrived: '已到达医院',
				serving: '陪诊服务中',
				completed: '服务已完成',
				cancelled: '订单已取消'
			}
			return labels[stage] || '订单处理中'
		},
		trackingMarkers() {
			const markers = []
			if (this.userLocation) {
				markers.push({
					id: 1,
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
			markers.push(
				{
					id: 2,
					latitude: this.companionLocation.latitude,
					longitude: this.companionLocation.longitude,
					width: 54,
					height: 54,
					anchor: { x: 0.5, y: 0.5 },
					iconPath: '/static/map-companion-marker.png',
					label: this.buildMapLabel(this.companion.name, 'green', 30),
					zIndex: 18
				},
				{
					id: 3,
					latitude: this.hospitalLocation.latitude,
					longitude: this.hospitalLocation.longitude,
					width: 48,
					height: 48,
					anchor: { x: 0.5, y: 0.5 },
					iconPath: '/static/map-hospital-marker.png',
					label: this.buildMapLabel('就诊医院', 'red', 28),
					zIndex: 12
				}
			)
			return markers
		},
		trackingPolyline() {
			return [
				{
					points: this.userLocation
						? [this.userLocation, this.companionLocation, this.hospitalLocation]
						: [this.companionLocation, this.hospitalLocation],
					color: '#2B9A6F',
					width: 5,
					dottedLine: true,
					borderColor: '#BFE6D6',
					borderWidth: 1
				}
			]
		},
		trackingCircles() {
			const companionOuter = [118, 136, 154][this.mapPulseStep]
			const companionInner = [76, 90, 104][this.mapPulseStep]
			const markerOuter = [98, 114, 130][this.mapPulseStep]
			const markerInner = [62, 74, 86][this.mapPulseStep]
			const circles = [
				{
					latitude: this.companionLocation.latitude,
					longitude: this.companionLocation.longitude,
					radius: companionOuter,
					color: '#2B9A6F30',
					fillColor: '#2B9A6F0E',
					strokeWidth: 2
				},
				{
					latitude: this.hospitalLocation.latitude,
					longitude: this.hospitalLocation.longitude,
					radius: markerOuter,
					color: '#E85D4A30',
					fillColor: '#E85D4A0E',
					strokeWidth: 2
				},
				{
					latitude: this.hospitalLocation.latitude,
					longitude: this.hospitalLocation.longitude,
					radius: markerInner,
					color: '#E85D4A55',
					fillColor: '#E85D4A18',
					strokeWidth: 2
				},
				{
					latitude: this.companionLocation.latitude,
					longitude: this.companionLocation.longitude,
					radius: companionInner,
					color: '#2B9A6F55',
					fillColor: '#2B9A6F18',
					strokeWidth: 2
				}
			]
			if (this.userLocation) {
				circles.unshift({
					latitude: this.userLocation.latitude,
					longitude: this.userLocation.longitude,
					radius: markerInner,
					color: '#4A90D955',
					fillColor: '#4A90D918',
					strokeWidth: 2
				})
				circles.unshift({
					latitude: this.userLocation.latitude,
					longitude: this.userLocation.longitude,
					radius: markerOuter,
					color: '#4A90D930',
					fillColor: '#4A90D90E',
					strokeWidth: 2
				})
			}
			return circles
		}
	},
	onLoad(query) {
		this.orderId = query.orderId || ''
		if (query.companionId) {
			const matchedCompanion = companions.find(item => item.id === query.companionId)
			if (matchedCompanion) this.companion = matchedCompanion
		}
		if (query.hospital) {
			this.orderSummary.hospital = decodeURIComponent(query.hospital)
		}
		if (query.serviceType) {
			this.orderSummary.serviceType = decodeURIComponent(query.serviceType)
		}
	},
	onShow() {
		this.startMapPulse()
		this.loadTrackingLocation()
		if (this.orderId) {
			this.loadOrderDetail()
		}
	},
	onPullDownRefresh() {
		Promise.all([
			this.loadTrackingLocation(),
			this.orderId ? this.loadOrderDetail() : Promise.resolve()
		]).finally(() => {
			uni.stopPullDownRefresh()
		})
	},
	onHide() {
		this.stopMapPulse()
	},
	onUnload() {
		this.stopMapPulse()
	},
	methods: {
		async loadOrderDetail() {
			if (!this.orderId) return
			try {
				const order = await getOrderDetail(this.orderId)
				this.currentOrder = order
				this.orderSummary = {
					hospital: order.hospital,
					serviceType: order.serviceType,
					date: order.date,
					time: order.time
				}
				this.steps = buildTrackingSteps(order)
				const matchedCompanion = companions.find(item => item.id === order.companionId || item.name === order.companionName)
				if (matchedCompanion) {
					this.companion = {
						...matchedCompanion,
						name: getOrderCompanionName(order) || matchedCompanion.name
					}
				} else {
					this.companion = {
						...this.companion,
						name: getOrderCompanionName(order)
					}
				}
			} catch (error) {
				uni.showToast({
					title: error.message || '订单详情加载失败',
					icon: 'none'
				})
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
		back() {
			uni.navigateBack({
				fail: () => {
					uni.reLaunch({ url: '/pages/index/index' })
				}
			})
		},
		async loadTrackingLocation(showFeedback = false) {
			try {
				const location = await getCurrentLocation()
				this.userLocation = {
					latitude: location.latitude,
					longitude: location.longitude
				}
				this.locationError = false
			} catch (error) {
				this.locationError = true
				if (showFeedback) {
					uni.showToast({
						title: '请先允许定位，才能显示实时距离',
						icon: 'none'
					})
				}
			}
		},
		previewPickupProof() {
			if (!this.currentOrder?.pickupProofImage) return
			uni.previewImage({
				urls: [this.currentOrder.pickupProofImage],
				current: this.currentOrder.pickupProofImage
			})
		}
	}
}
</script>

<style scoped>
.page { min-height: 100vh; padding-bottom: 110px; background: #FAFAF8; }
.back { position: absolute; top: 16px; left: 16px; z-index: 20; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.92); box-shadow: 0 2px 8px rgba(0,0,0,.08); display: flex; align-items: center; justify-content: center; }
.map-wrap { position: relative; height: 318px; border-radius: 0 0 24px 24px; overflow: hidden; background: #E8F5EE; }
.real-map { width: 100%; height: 100%; }
.map-tint {
	position: absolute;
	inset: 0;
	background:
		linear-gradient(180deg, rgba(236,247,241,.28) 0%, rgba(248,251,249,.10) 34%, rgba(250,250,248,.16) 100%),
		linear-gradient(90deg, rgba(244,250,247,.10) 0%, rgba(255,255,255,0) 40%, rgba(244,250,247,.10) 100%);
	pointer-events: none;
}
.distance-chip, .map-error { position: absolute; z-index: 3; border-radius: 999px; background: rgba(255,255,255,.86); border: 1px solid rgba(43,154,111,.10); box-shadow: 0 2px 8px rgba(0,0,0,.04); display: flex; align-items: center; gap: 8px; }
.distance-chip { left: 16px; bottom: 16px; padding: 8px 14px; font-size: 13px; font-weight: 700; color: #2D2D2D; }
.map-error { right: 16px; top: 16px; height: 34px; padding: 0 12px; font-size: 13px; font-weight: 700; color: #2B9A6F; }
.map-legend {
	position: absolute;
	left: 16px;
	bottom: 58px;
	padding: 7px 9px;
	border-radius: 12px;
	background: rgba(255,255,255,.78);
	border: 1px solid rgba(43,154,111,.08);
	box-shadow: 0 2px 6px rgba(45,45,45,.03);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: flex-start;
	gap: 5px;
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
.companion-card, .detail-card { margin: -24px 20px 0; position: relative; z-index: 10; padding: 20px; border-radius: 20px; background: #FFFFFF; box-shadow: 0 8px 32px rgba(45,45,45,.10), 0 2px 8px rgba(45,45,45,.06); }
.companion-card { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }
.eta-panel {
	margin: 12px 20px 0;
	padding: 12px 16px;
	border-radius: 16px;
	background: rgba(255,255,255,.92);
	border: 1px solid rgba(43,154,111,.10);
	box-shadow: 0 2px 8px rgba(45,45,45,.04);
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 15px;
	font-weight: 700;
	color: #2D2D2D;
}
.avatar { width: 56px; height: 56px; border-radius: 50%; border: 2px solid #2B9A6F; background: linear-gradient(135deg, #E8F5EE, #D4EDE2); display: flex; align-items: center; justify-content: center; color: #2B9A6F; font-size: 20px; font-weight: 800; }
.grow { flex: 1; min-width: 0; }
.row, .score, .actions, .phone, .msg, .detail-line { display: flex; align-items: center; }
.row { gap: 8px; }
.name { font-size: 18px; font-weight: 800; color: #2D2D2D; }
.status { padding: 3px 8px; border-radius: 999px; background: #E8F5EE; color: #2B9A6F; font-size: 13px; display: flex; align-items: center; gap: 4px; }
.blink { width: 6px; height: 6px; border-radius: 50%; background: #2B9A6F; animation: blink 1.5s infinite; }
.score { margin-top: 6px; gap: 4px; font-size: 16px; font-weight: 700; color: #2D2D2D; }
.muted { font-size: 14px; color: #9CA3AF; }
.actions { width: 100%; gap: 12px; margin-top: 6px; }
.phone, .msg { flex: 1; height: 48px; border-radius: 14px; justify-content: center; gap: 8px; font-size: 16px; font-weight: 800; }
.phone { background: linear-gradient(135deg, #4A90D9, #6BA8E8); color: #FFFFFF; }
.msg { border: 1px solid #E8E5E0; color: #2D2D2D; }
.section { margin: 24px 20px 0; }
.section-title { display: block; margin-bottom: 16px; font-size: 18px; font-weight: 800; color: #2D2D2D; }
.timeline { position: relative; }
.step { position: relative; display: flex; gap: 16px; padding-bottom: 24px; }
.connector { position: absolute; left: 15px; top: 34px; bottom: -2px; width: 2px; background: #E8E5E0; }
.connector.done { background: #2B9A6F; }
.step-icon { position: relative; z-index: 2; width: 32px; height: 32px; border-radius: 50%; background: #F3F0EB; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.step-icon.completed { background: #2B9A6F; }
.step-icon.active { background: linear-gradient(135deg, #2B9A6F, #3DB88A); box-shadow: 0 2px 8px rgba(43,154,111,.35); }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #9CA3AF; }
.step-label, .step-time, .label, .value { display: block; }
.step-label { padding-top: 4px; font-size: 18px; font-weight: 800; color: #2D2D2D; }
.step-label.pending { color: #9CA3AF; }
.step-time { margin-top: 4px; font-size: 16px; color: #9CA3AF; }
.detail-card { margin-top: 0; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(45,45,45,.06); }
.proof-card { margin: 0 20px 18px; padding: 18px; border-radius: 20px; background: #FFFFFF; box-shadow: 0 2px 12px rgba(45,45,45,.06); }
.proof-desc { display: block; margin-bottom: 12px; font-size: 15px; line-height: 1.5; color: #6B7280; }
.proof-image { width: 100%; height: 180px; border-radius: 16px; background: #E8F5EE; }
.detail-line { gap: 12px; margin-top: 14px; }
.detail-icon { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.green-bg { background: #E8F5EE; }
.blue-bg { background: #EBF3FC; }
.purple-bg { background: #F3EEFB; }
.label { font-size: 16px; color: #9CA3AF; }
.value { margin-top: 4px; font-size: 18px; font-weight: 700; color: #2D2D2D; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
</style>
