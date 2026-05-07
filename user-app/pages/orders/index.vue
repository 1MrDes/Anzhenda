<template>
	<AzShell active="orders">
		<view class="page">
			<view class="header">
				<text class="title">我的订单</text>
				<text class="sub">共 {{ orders.length }} 个订单</text>
				<text class="refresh-tip">下拉页面可刷新订单状态</text>
			</view>

			<view class="current-card">
				<text class="current-label">当前服务对象</text>
				<text class="current-name">
					{{ currentPatient ? `${currentPatient.name}（${currentPatient.remarkRelation}）` : '暂未设置' }}
				</text>
				<text class="current-desc">订单列表会优先展示与当前就诊人相关的订单</text>
			</view>

			<view class="tabs">
				<view
					v-for="tab in tabs"
					:key="tab.key"
					class="tab"
					:class="{ active: activeTab === tab.key }"
					@tap="activeTab = tab.key"
				>
					<text>{{ tab.label }}</text>
					<text v-if="tabCount(tab.key) > 0" class="count">{{ tabCount(tab.key) }}</text>
				</view>
			</view>

			<view class="list">
				<view v-if="filteredOrders.length === 0" class="empty">
					<AzIcon name="file" :size="48" color="#D1D5DB" />
					<text>暂无{{ currentTabLabel }}订单</text>
				</view>

				<view v-for="order in filteredOrders" :key="order.id" class="order-card">
					<view class="row between">
						<text class="order-id">{{ order.orderNo || order.id }}</text>
						<text
							class="badge"
							:style="{
								background: getStageConfig(order).bg,
								color: getStageConfig(order).color
							}"
						>
							{{ getStageConfig(order).label }}
						</text>
					</view>

					<view class="patient-banner" :class="{ current: currentPatient && currentPatient.id === order.patientId }">
						<text class="patient-text">服务对象：{{ order.patientName }}（{{ order.patientRelation }}）</text>
					</view>

					<text class="service-name">{{ order.serviceType }}</text>
					<view class="info-line">
						<AzIcon name="location" :size="16" color="#9CA3AF" />
						<text>{{ order.hospital }}</text>
					</view>
					<view class="info-line">
						<AzIcon name="clock" :size="16" color="#9CA3AF" />
						<text>{{ order.date }} {{ order.time }}</text>
					</view>

					<view class="progress-box">
						<text class="progress-title">{{ getOrderProgressText(order) }}</text>
						<text v-if="order.pickupProofImage" class="progress-proof">陪诊员已上传接到用户核验图片</text>
					</view>

					<view class="companion">
						<view class="avatar">{{ getCompanionName(order).charAt(0) }}</view>
						<view class="companion-main">
							<text class="companion-name">{{ getCompanionName(order) }}</text>
							<text class="companion-stage">{{ getStageConfig(order).label }}</text>
						</view>
						<view class="score">
							<AzIcon name="star" :size="14" color="#F5A623" />
							<text>{{ order.rating || order.companionRating || '4.9' }}</text>
						</view>
					</view>

					<view v-if="order.status === 'completed' && order.review" class="review-box">
						<view class="small-stars">
							<AzIcon v-for="n in order.rating" :key="n" name="star" :size="14" color="#F5A623" />
						</view>
						<text>{{ order.review }}</text>
					</view>

					<view class="row between footer">
						<view>
							<text class="total-label">合计 </text>
							<text class="total">¥{{ order.totalFee }}</text>
						</view>
						<view v-if="order.canPay" class="outline" @tap="goPay(order)">去支付</view>
						<view v-else-if="order.status === 'completed' && !order.review" class="outline" @tap="openRating(order.id)">去评价</view>
						<view v-else class="primary" @tap="goTracking(order)">
							查看进度
							<AzIcon name="right" :size="16" color="#FFFFFF" />
						</view>
					</view>
				</view>
			</view>

			<view v-if="ratingOpen" class="sheet-mask" @tap="closeRating">
				<view class="sheet" @tap.stop>
					<view class="sheet-handle" />
					<text class="sheet-title">服务评价</text>
					<view v-if="submitted" class="thanks">
						<view class="thanks-icon"><AzIcon name="message" :size="28" color="#2B9A6F" /></view>
						<text>感谢您的评价</text>
					</view>
					<view v-else>
						<view class="rating-row">
							<AzIcon
								v-for="n in 5"
								:key="n"
								name="star"
								:size="36"
								:color="n <= rating ? '#F5A623' : '#E8E5E0'"
								@tap="rating = n"
							/>
						</view>
						<textarea v-model="review" class="textarea" placeholder="分享您的服务体验（选填）" />
						<view class="submit" :class="{ disabled: rating === 0 }" @tap="submitRating">提交评价</view>
					</view>
				</view>
			</view>
		</view>
	</AzShell>
</template>

<script>
import AzShell from '@/components/AzShell.vue'
import AzIcon from '@/components/AzIcon.vue'
import { getCurrentPatient, initFamilyCareStore, setCurrentPatient } from '@/utils/family-care.js'
import {
	getOrderCompanionName,
	getOrderProgressText,
	getOrderStage,
	getOrderStageLabel,
	listOrders,
	reviewOrder
} from '@/utils/order-service.js'

export default {
	components: { AzShell, AzIcon },
	data() {
		return {
			orders: [],
			activeTab: 'in_progress',
			ratingOpen: false,
			rating: 0,
			review: '',
			submitted: false,
			activeOrderId: '',
			tabs: [
				{ key: 'in_progress', label: '进行中' },
				{ key: 'completed', label: '已完成' },
				{ key: 'cancelled', label: '已取消' }
			],
			stageConfig: {
				pending_payment: { bg: '#FFF5E0', color: '#F5A623' },
				waiting_accept: { bg: '#FFF5E0', color: '#D88422' },
				accepted: { bg: '#EBF3FC', color: '#4A90D9' },
				on_the_way: { bg: '#E8F5EE', color: '#2B9A6F' },
				picked_up: { bg: '#E8F5EE', color: '#2B9A6F' },
				arrived: { bg: '#E8F5EE', color: '#2B9A6F' },
				serving: { bg: '#E8F5EE', color: '#2B9A6F' },
				completed: { bg: '#EBF3FC', color: '#4A90D9' },
				cancelled: { bg: '#F3F0EB', color: '#9CA3AF' }
			}
		}
	},
	computed: {
		currentPatient() {
			return getCurrentPatient()
		},
		filteredOrders() {
			const currentId = this.currentPatient?.id
			return this.orders
				.filter(order => this.inTab(order, this.activeTab))
				.sort((a, b) => {
					const aWeight = currentId && a.patientId === currentId ? 1 : 0
					const bWeight = currentId && b.patientId === currentId ? 1 : 0
					return bWeight - aWeight
				})
		},
		currentTabLabel() {
			return this.tabs.find(item => item.key === this.activeTab)?.label || ''
		}
	},
	created() {
		initFamilyCareStore()
	},
	onShow() {
		this.loadOrders()
	},
	onPullDownRefresh() {
		this.loadOrders().finally(() => {
			uni.stopPullDownRefresh()
		})
	},
	methods: {
		async loadOrders() {
			try {
				this.orders = await listOrders()
			} catch (error) {
				uni.showToast({
					title: error.message || '获取订单失败',
					icon: 'none'
				})
			}
		},
		inTab(order, key) {
			if (key === 'in_progress') {
				return !['completed', 'cancelled'].includes(order.status)
			}
			return order.status === key
		},
		tabCount(key) {
			return this.orders.filter(order => this.inTab(order, key)).length
		},
		getStageConfig(order) {
			const stage = getOrderStage(order)
			return {
				label: getOrderStageLabel(order),
				...(this.stageConfig[stage] || { bg: '#F3F0EB', color: '#9CA3AF' })
			}
		},
		getCompanionName(order) {
			return getOrderCompanionName(order)
		},
		getOrderProgressText,
		goTracking(order) {
			uni.navigateTo({ url: `/pages/tracking/index?orderId=${order.id}` })
		},
		goPay(order) {
			setCurrentPatient(order.patientId)
			const query = [
				`patientId=${order.patientId}`,
				`orderId=${order.id}`
			].join('&')
			uni.navigateTo({ url: `/pages/payment/index?${query}` })
		},
		openRating(orderId) {
			this.activeOrderId = orderId
			this.ratingOpen = true
			this.rating = 0
			this.review = ''
			this.submitted = false
		},
		closeRating() {
			this.ratingOpen = false
			this.submitted = false
			this.activeOrderId = ''
		},
		async submitRating() {
			if (!this.rating) return
			try {
				const updatedOrder = await reviewOrder(this.activeOrderId, {
					rating: this.rating,
					review: this.review
				})
				const targetIndex = this.orders.findIndex(item => item.id === this.activeOrderId)
				if (targetIndex !== -1) {
					this.orders.splice(targetIndex, 1, updatedOrder)
				}
				this.submitted = true
				setTimeout(() => {
					this.closeRating()
				}, 1000)
			} catch (error) {
				uni.showToast({
					title: error.message || '提交评价失败',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style scoped>
.page { min-height: 100vh; padding-bottom: 110px; background: #FAFAF8; }
.header { padding: 30px 20px 10px; display: flex; flex-direction: column; }
.title { font-size: 24px; font-weight: 800; color: #2D2D2D; }
.sub { margin-top: 6px; font-size: 18px; color: #9CA3AF; }
.refresh-tip { margin-top: 4px; font-size: 14px; color: #9CA3AF; }
.current-card { margin: 0 20px; padding: 16px; border-radius: 16px; background: #FFFFFF; box-shadow: 0 2px 12px rgba(45,45,45,.06); }
.current-label { font-size: 14px; color: #9CA3AF; }
.current-name { display: block; margin-top: 6px; font-size: 20px; font-weight: 800; color: #2D2D2D; }
.current-desc { display: block; margin-top: 6px; font-size: 14px; line-height: 1.55; color: #6B7280; }
.tabs { padding: 12px 20px; display: flex; gap: 12px; }
.tab { height: 44px; min-width: 80px; padding: 0 18px; border-radius: 22px; background: #F3F0EB; display: flex; align-items: center; justify-content: center; gap: 6px; color: #6B7280; font-size: 18px; font-weight: 800; }
.tab.active { background: #2B9A6F; color: #FFFFFF; box-shadow: 0 4px 12px rgba(43,154,111,.25); }
.count { padding: 2px 6px; border-radius: 999px; background: rgba(255,255,255,.24); font-size: 14px; }
.list { padding: 0 20px; }
.empty { padding: 64px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; color: #9CA3AF; font-size: 18px; }
.order-card { margin-bottom: 16px; padding: 20px; border-radius: 20px; background: #FFFFFF; box-shadow: 0 2px 12px rgba(45,45,45,.06), 0 1px 4px rgba(45,45,45,.04); }
.row, .info-line, .companion, .score, .small-stars { display: flex; align-items: center; }
.between { justify-content: space-between; }
.order-id { font-size: 16px; color: #9CA3AF; }
.badge { padding: 5px 12px; border-radius: 20px; font-size: 15px; font-weight: 700; }
.patient-banner { margin-top: 14px; padding: 10px 12px; border-radius: 12px; background: #F3F0EB; }
.patient-banner.current { background: #E8F5EE; }
.patient-text { font-size: 15px; font-weight: 700; color: #2D2D2D; }
.service-name { display: block; margin-top: 14px; font-size: 18px; font-weight: 800; color: #2D2D2D; }
.info-line { margin-top: 8px; gap: 6px; font-size: 18px; color: #6B7280; }
.progress-box { margin-top: 12px; padding: 12px; border-radius: 14px; background: #F7FAF8; }
.progress-title { display: block; font-size: 16px; font-weight: 800; color: #2B9A6F; }
.progress-proof { display: block; margin-top: 4px; font-size: 14px; color: #6B7280; }
.companion { margin-top: 14px; padding: 12px; border-radius: 14px; background: #F3F0EB; gap: 12px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #E8F5EE 0%, #D4EDE2 100%); color: #2B9A6F; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.companion-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.companion-name { font-size: 18px; font-weight: 800; color: #2D2D2D; }
.companion-stage { margin-top: 3px; font-size: 14px; color: #6B7280; }
.score { gap: 3px; font-size: 16px; font-weight: 700; color: #2D2D2D; }
.review-box { margin-top: 12px; padding: 12px; border-radius: 14px; background: #FFF9F0; font-size: 16px; line-height: 1.5; color: #6B7280; }
.small-stars { gap: 2px; margin-bottom: 6px; }
.footer { padding-top: 12px; }
.total-label { font-size: 16px; color: #9CA3AF; }
.total { font-size: 22px; font-weight: 800; color: #2B9A6F; }
.primary, .outline { height: 44px; padding: 0 18px; border-radius: 14px; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 18px; font-weight: 800; }
.primary { background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%); color: #FFFFFF; }
.outline { border: 1px solid #2B9A6F; color: #2B9A6F; }
.sheet-mask { position: fixed; inset: 0; z-index: 80; background: rgba(0,0,0,.35); display: flex; align-items: flex-end; }
.sheet { width: 100%; padding: 12px 24px calc(40px + env(safe-area-inset-bottom)); border-radius: 28px 28px 0 0; background: #FFFFFF; }
.sheet-handle { width: 40px; height: 4px; margin: 0 auto 18px; border-radius: 999px; background: #E8E5E0; }
.sheet-title { display: block; text-align: center; font-size: 20px; font-weight: 800; color: #2D2D2D; }
.rating-row { margin: 24px 0; display: flex; justify-content: center; gap: 12px; }
.textarea { width: 100%; min-height: 120px; padding: 16px; border-radius: 16px; background: #F3F0EB; font-size: 16px; color: #2D2D2D; }
.submit { margin-top: 18px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 18px; font-weight: 800; }
.submit.disabled { background: #E8E5E0; }
.thanks { padding: 36px 0; display: flex; flex-direction: column; align-items: center; gap: 14px; font-size: 18px; font-weight: 800; color: #2D2D2D; }
.thanks-icon { width: 64px; height: 64px; border-radius: 50%; background: #E8F5EE; display: flex; align-items: center; justify-content: center; }
</style>
