<template>
	<AzShell active="">
		<view class="page">
			<view class="nav">
				<view class="back" @tap="back"><AzIcon name="left" :size="24" color="#2D2D2D" /></view>
				<text>确认支付</text>
			</view>

			<view class="content">
				<view class="patient-banner">
					<text class="patient-label">当前支付对象</text>
					<text class="patient-name">{{ currentPatient ? `${currentPatient.name}（${currentPatient.remarkRelation}）` : '暂未设置' }}</text>
					<text class="patient-desc">当前正在为 {{ currentPatient ? currentPatient.name : '家人' }} 处理支付</text>
				</view>

				<view class="card">
					<view class="summary-head">
						<view class="icon-bg"><AzIcon name="clipboard" :size="24" color="#2B9A6F" /></view>
						<view>
							<text class="h2">{{ summary.serviceType }}</text>
							<text class="desc">确认订单信息后，向右滑动完成支付</text>
						</view>
					</view>
					<view class="line"><AzIcon name="location" :size="16" color="#6B7280" /><text>{{ summary.hospital }}</text></view>
					<view class="line"><AzIcon name="clock" :size="16" color="#6B7280" /><text>{{ summary.date }} {{ summary.time }}</text></view>
					<view class="line"><AzIcon name="user" :size="16" color="#6B7280" /><text>服务对象：{{ currentPatient ? `${currentPatient.name}（${currentPatient.remarkRelation}）` : '未选择' }}</text></view>
					<view class="person">
						<view class="avatar">{{ companionName.charAt(0) }}</view>
						<view>
							<text class="person-name">{{ companionName }}</text>
							<view class="score"><AzIcon name="star" :size="14" color="#F5A623" /><text>4.9</text></view>
						</view>
					</view>
				</view>

				<view class="card">
					<view class="section-title"><AzIcon name="receipt" :size="20" color="#2B9A6F" /><text>费用明细</text></view>
					<view class="fee-line"><text>基础服务费</text><text>¥{{ summary.amount }}</text></view>
					<view class="dash" />
					<view class="fee-line" @tap="showExtra = !showExtra">
						<text class="muted">预计附加费</text>
						<view class="row"><text class="muted">¥0</text><AzIcon :name="showExtra ? 'left' : 'right'" :size="16" color="#6B7280" /></view>
					</view>
					<view v-if="showExtra" class="extra">
						<view class="fee-line muted"><text>夜间服务费</text><text>¥0</text></view>
						<view class="fee-line muted"><text>交通补贴</text><text>¥0</text></view>
					</view>
					<view class="total-line"><text>合计</text><text>¥{{ summary.amount }}</text></view>
				</view>

				<view class="card">
					<text class="h2 block">支付方式</text>
					<view
						v-for="method in methods"
						:key="method.id"
						class="pay-method"
						:class="{ active: selectedPayment === method.id }"
						@tap="selectedPayment = method.id"
					>
						<view class="pay-icon" :style="{ background: method.color + '18' }"><AzIcon :name="method.icon" :size="22" :color="method.color" /></view>
						<view class="pay-main">
							<text>{{ method.name }}</text>
							<text v-if="method.id === 'family'" class="pay-desc">适合子女协助为家人缴费</text>
						</view>
						<view class="radio" :class="{ checked: selectedPayment === method.id }"><AzIcon v-if="selectedPayment === method.id" name="check" :size="16" color="#FFFFFF" /></view>
					</view>
				</view>
			</view>

			<view class="pay-fixed">
				<text class="pay-tip">向右滑动确认支付</text>
				<view
					class="swipe"
					@touchmove.stop.prevent="onSwipeMove"
					@touchend.stop.prevent="onSwipeEnd"
					@touchcancel.stop.prevent="onSwipeEnd"
				>
					<view v-if="payStatus !== 'success'" class="progress-track" :style="progressStyle" />
					<text v-if="payStatus === 'idle'" class="swipe-text">向右滑动支付 ¥{{ summary.amount }}</text>
					<text v-else-if="payStatus === 'processing'" class="swipe-text processing">支付中...</text>
					<view
						v-if="payStatus !== 'success'"
						class="handle"
						:class="{ processing: payStatus === 'processing' }"
						:style="handleStyle"
						@touchstart.stop.prevent="onSwipeStart"
						@touchmove.stop.prevent="onSwipeMove"
						@touchend.stop.prevent="onSwipeEnd"
						@touchcancel.stop.prevent="onSwipeEnd"
					>
						<AzIcon :name="payStatus === 'processing' ? 'check' : 'right'" :size="26" color="#FFFFFF" />
					</view>
					<view v-else class="paid"><AzIcon name="check" :size="26" color="#FFFFFF" /><text>支付成功</text></view>
				</view>
			</view>
		</view>
	</AzShell>
</template>

<script>
import AzShell from '@/components/AzShell.vue'
import AzIcon from '@/components/AzIcon.vue'
import { companions } from '@/common/mockData.js'
import { getCurrentPatient, getPatientById, initFamilyCareStore, setCurrentPatient } from '@/utils/family-care.js'
import { getOrderDetail, payOrder } from '@/utils/order-service.js'

export default {
	components: { AzShell, AzIcon },
	data() {
		return {
			showExtra: false,
			selectedPayment: 'wechat',
			payStatus: 'idle',
			swipeTrackWidth: 280,
			swipeHandleWidth: 48,
			swipeTranslate: 0,
			swipeStartX: 0,
			swipeStartTranslate: 0,
			swipeDragging: false,
			swipeAnimating: false,
			payTimer: null,
			summary: {
				orderId: '',
				companionId: '',
				companionName: '',
				paymentStatus: 'pending',
				serviceType: '挂号陪诊',
				hospital: '上海市第一人民医院',
				date: '2026-04-17',
				time: '09:00',
				amount: 198
			},
			methods: [
				{ id: 'wechat', name: '微信支付', icon: 'wallet', color: '#2B9A6F' },
				{ id: 'alipay', name: '支付宝', icon: 'card', color: '#4A90D9' },
				{ id: 'family', name: '子女代付', icon: 'users', color: '#F5A623' }
			]
		}
	},
	computed: {
		currentPatient() {
			return getCurrentPatient()
		},
		companionProfile() {
			return companions.find(item => item.id === this.summary.companionId || item.name === this.summary.companionName) || companions[0] || {}
		},
		companionName() {
			return this.summary.companionName || this.companionProfile?.name || '张护士'
		},
		swipeMaxTranslate() {
			return Math.max(this.swipeTrackWidth - this.swipeHandleWidth - 8, 0)
		},
		swipeThreshold() {
			const threshold = this.swipeTrackWidth * 0.85 - this.swipeHandleWidth / 2 - 4
			return Math.max(Math.min(threshold, this.swipeMaxTranslate), 0)
		},
		handleStyle() {
			return {
				transform: `translateX(${this.swipeTranslate}px)`,
				transition: this.swipeAnimating ? 'transform 220ms ease' : 'none'
			}
		},
		progressStyle() {
			const baseWidth = this.swipeHandleWidth + 12
			const width = this.payStatus === 'processing'
				? this.swipeTrackWidth
				: Math.min(this.swipeTrackWidth, baseWidth + this.swipeTranslate)
			return {
				width: `${width}px`,
				transition: this.swipeAnimating || this.payStatus === 'processing' ? 'width 240ms ease' : 'none',
				opacity: this.payStatus === 'idle' && this.swipeTranslate === 0 ? 0.78 : 1
			}
		}
	},
	onLoad(query) {
		initFamilyCareStore()
		if (query.patientId) {
			const patient = getPatientById(query.patientId)
			if (patient) setCurrentPatient(patient.id)
		}
		this.initializeOrder(query)
	},
	onReady() {
		this.$nextTick(() => {
			this.measureSwipeTrack()
		})
	},
	methods: {
		async initializeOrder(query = {}) {
			if (query.orderId) {
				try {
					uni.showLoading({
						title: '加载订单中',
						mask: true
					})
					const order = await getOrderDetail(query.orderId)
					this.applyOrderSummary(order)
					this.payStatus = order.paymentStatus === 'paid' ? 'success' : 'idle'
					return
				} catch (error) {
					uni.showToast({
						title: error.message || '订单加载失败',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			}

			if (query.serviceType || query.hospital || query.date || query.time) {
				this.summary = {
					...this.summary,
					orderId: query.orderId || '',
					serviceType: decodeURIComponent(query.serviceType || '挂号陪诊'),
					hospital: decodeURIComponent(query.hospital || '上海市第一人民医院'),
					date: decodeURIComponent(query.date || '2026-04-17'),
					time: decodeURIComponent(query.time || '09:00'),
					amount: Number(query.amount || 198)
				}
			}
		},
		applyOrderSummary(order) {
			this.summary = {
				orderId: order.id,
				companionId: order.companionId || '',
				companionName: order.companionName || '',
				paymentStatus: order.paymentStatus || 'pending',
				serviceType: order.serviceType,
				hospital: order.hospital,
				date: order.date,
				time: order.time,
				amount: Number(order.totalFee || order.amount || 198)
			}
		},
		back() {
			uni.navigateBack()
		},
		measureSwipeTrack() {
			const query = uni.createSelectorQuery().in(this)
			query.select('.swipe').boundingClientRect()
			query.select('.handle').boundingClientRect()
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
			if (this.payStatus !== 'idle') return
			const touch = this.getTouchPoint(event)
			if (!touch) return
			this.swipeDragging = true
			this.swipeAnimating = false
			this.swipeStartX = touch.pageX
			this.swipeStartTranslate = this.swipeTranslate
		},
		onSwipeMove(event) {
			if (!this.swipeDragging || this.payStatus !== 'idle') return
			const touch = this.getTouchPoint(event)
			if (!touch) return
			const deltaX = touch.pageX - this.swipeStartX
			const nextTranslate = this.swipeStartTranslate + deltaX
			this.swipeTranslate = Math.max(0, Math.min(nextTranslate, this.swipeMaxTranslate))
		},
		onSwipeEnd() {
			if (!this.swipeDragging || this.payStatus !== 'idle') return
			this.swipeDragging = false
			this.swipeAnimating = true
			if (this.swipeTranslate >= this.swipeThreshold) {
				this.swipeTranslate = this.swipeMaxTranslate
				this.startPaymentFlow()
				return
			}
			this.swipeTranslate = 0
		},
		startPaymentFlow() {
			if (this.payStatus !== 'idle') return
			this.payStatus = 'processing'
			this.clearPayTimer()
			this.payTimer = setTimeout(() => {
				this.finishPayment()
			}, 450)
		},
		async finishPayment() {
			try {
				if (this.summary.orderId) {
					const order = await payOrder(this.summary.orderId, this.selectedPayment)
					this.applyOrderSummary(order)
				}
				this.payStatus = 'success'
				uni.showToast({ title: '支付成功', icon: 'success' })
				this.clearPayTimer()
				this.payTimer = setTimeout(() => {
					const targetUrl = this.summary.orderId
						? `/pages/tracking/index?orderId=${this.summary.orderId}`
						: '/pages/tracking/index'
					uni.navigateTo({ url: targetUrl })
				}, 900)
			} catch (error) {
				this.payStatus = 'idle'
				this.swipeAnimating = true
				this.swipeTranslate = 0
				uni.showToast({
					title: error.message || '支付失败',
					icon: 'none'
				})
			}
		},
		clearPayTimer() {
			if (this.payTimer) {
				clearTimeout(this.payTimer)
				this.payTimer = null
			}
		}
	},
	beforeUnmount() {
		this.clearPayTimer()
	}
}
</script>

<style scoped>
.page { min-height: 100vh; padding-bottom: 200px; background: #FAFAF8; }
.nav { position: sticky; top: 0; z-index: 10; height: 64px; padding: 0 20px; background: #FFFFFF; box-shadow: 0 1px 8px rgba(0,0,0,.04); display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; color: #2D2D2D; }
.back { width: 40px; height: 40px; border-radius: 12px; background: #F3F0EB; display: flex; align-items: center; justify-content: center; }
.content { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.patient-banner, .card { padding: 20px; border-radius: 16px; background: #FFFFFF; box-shadow: 0 2px 12px rgba(45,45,45,.06); }
.patient-label { font-size: 14px; color: #9CA3AF; }
.patient-name { display: block; margin-top: 8px; font-size: 22px; font-weight: 800; color: #2D2D2D; }
.patient-desc { display: block; margin-top: 6px; font-size: 15px; color: #6B7280; }
.summary-head, .line, .person, .score, .section-title, .fee-line, .total-line, .row, .pay-method, .radio, .pay-icon, .icon-bg { display: flex; align-items: center; }
.summary-head { gap: 12px; margin-bottom: 16px; }
.icon-bg { width: 48px; height: 48px; border-radius: 12px; background: #E8F5EE; justify-content: center; }
.h2 { font-size: 18px; font-weight: 800; color: #2D2D2D; }
.block { display: block; margin-bottom: 12px; }
.desc { display: block; margin-top: 4px; font-size: 16px; color: #6B7280; }
.line { gap: 8px; padding-top: 10px; border-top: 1px solid #F3F0EB; font-size: 16px; color: #2D2D2D; }
.line + .line { border-top: 0; }
.person { gap: 12px; padding-top: 12px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #2B9A6F, #3DB88A); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: 800; }
.person-name { font-size: 16px; font-weight: 700; color: #2D2D2D; }
.score { gap: 4px; font-size: 16px; color: #6B7280; }
.section-title { gap: 8px; margin-bottom: 14px; font-size: 18px; font-weight: 800; color: #2D2D2D; }
.fee-line, .total-line { justify-content: space-between; padding: 10px 0; font-size: 16px; color: #2D2D2D; }
.dash { border-top: 1px dashed #E8E5E0; }
.muted { color: #6B7280; }
.extra { padding-left: 16px; }
.total-line { margin-top: 8px; border-top: 1px solid #E8E5E0; font-size: 18px; font-weight: 800; }
.total-line text:last-child { font-size: 24px; color: #2B9A6F; }
.pay-method { margin-top: 12px; padding: 14px; border-radius: 14px; border: 2px solid transparent; background: #FAFAF8; gap: 14px; font-size: 16px; font-weight: 700; color: #2D2D2D; }
.pay-method.active { border-color: #2B9A6F; background: #E8F5EE; }
.pay-icon { width: 40px; height: 40px; border-radius: 50%; justify-content: center; }
.pay-main { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.pay-desc { font-size: 14px; color: #9CA3AF; }
.radio { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #E8E5E0; justify-content: center; }
.radio.checked { border: 0; background: #2B9A6F; }
.pay-fixed { position: fixed; left: 0; right: 0; bottom: 72px; z-index: 30; padding: 16px 20px calc(16px + env(safe-area-inset-bottom)); background: linear-gradient(to top, #FFFFFF 85%, transparent); }
.pay-tip { display: block; text-align: center; margin-bottom: 12px; font-size: 16px; color: #6B7280; }
.swipe { position: relative; height: 56px; border-radius: 999px; background: #F3F0EB; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.progress-track { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px; background: linear-gradient(90deg, rgba(177, 136, 116, 0.10) 0%, rgba(194, 151, 130, 0.18) 48%, rgba(211, 174, 154, 0.24) 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.18), inset 0 -1px 0 rgba(177, 136, 116, .08); pointer-events: none; z-index: 0; }
.swipe-text { position: relative; z-index: 1; color: #9CA3AF; font-size: 16px; transition: color 220ms ease; }
.swipe-text.processing { color: #2B9A6F; font-weight: 700; }
.handle { position: absolute; left: 4px; top: 4px; width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #2B9A6F, #3DB88A); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(43,154,111,.3); z-index: 2; touch-action: none; }
.handle.processing { box-shadow: 0 4px 14px rgba(43,154,111,.38); }
.paid { position: absolute; inset: 0; background: linear-gradient(135deg, #2B9A6F, #3DB88A); display: flex; align-items: center; justify-content: center; gap: 8px; color: #FFFFFF; font-size: 18px; font-weight: 800; z-index: 3; }
</style>
