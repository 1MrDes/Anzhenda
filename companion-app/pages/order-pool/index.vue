<template>
	<view class="page">
		<view class="page-header" :style="{ paddingTop: statusBarHeight + 14 + 'px' }">
			<view>
				<text class="page-title">{{ texts.pageTitle }}</text>
				<text class="page-subtitle">{{ texts.pageSubtitle }}</text>
			</view>
			<view class="refresh-btn" @tap="loadOrders">{{ texts.refresh }}</view>
		</view>

		<view class="mode-switch">
			<view
				v-for="item in modes"
				:key="item.value"
				class="mode-chip"
				:class="{ active: currentMode === item.value }"
				@tap="setMode(item.value)"
			>
				{{ item.label }}
			</view>
		</view>

		<view v-if="displayOrders.length" class="list">
			<view
				v-for="item in displayOrders"
				:key="item.id"
				class="order-card"
			>
				<view class="top-row">
					<view class="patient-box">
						<text class="patient-name">{{ item.patientName }}</text>
						<text class="patient-meta">{{ item.patientGender }} / {{ item.patientAge }}{{ texts.ageUnit }}</text>
					</view>
					<view class="badge-row">
						<text v-if="item.isUrgent" class="urgent-badge">{{ texts.urgent }}</text>
						<text class="price-text">{{ texts.currency }}{{ item.totalFee }}</text>
					</view>
				</view>

				<text class="order-line">{{ item.serviceType }} / {{ item.hospital }}</text>
				<text class="order-line light">{{ item.date }} {{ item.time }} / {{ texts.distancePrefix }} {{ item.distanceText }}</text>

				<view class="action-row">
					<view class="ghost-btn" @tap="viewDetail(item.id)">{{ texts.detail }}</view>
					<view class="primary-btn" @tap="handleClaim(item)">{{ texts.claim }}</view>
				</view>
			</view>
		</view>

		<view v-else class="empty-card">
			<text class="empty-title">{{ texts.emptyTitle }}</text>
			<text class="empty-text">{{ texts.emptyText }}</text>
		</view>

		<CompanionTabBar current="/pages/order-pool/index" />
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CompanionTabBar from '@/components/CompanionTabBar.vue'
import { claimOrder, fetchAvailableOrders } from '@/utils/companion-api'

const texts = {
	pageTitle: '\u5f85\u63a5\u5355',
	pageSubtitle: '\u5148\u770b\u8ddd\u79bb\u8fd1\u3001\u4fe1\u606f\u6e05\u695a\u3001\u80fd\u9a6c\u4e0a\u5904\u7406\u7684\u8ba2\u5355',
	refresh: '\u5237\u65b0',
	ageUnit: '\u5c81',
	urgent: '\u7d27\u6025',
	currency: '\u00a5',
	distancePrefix: '\u8ddd\u79bb',
	detail: '\u67e5\u770b\u8be6\u60c5',
	claim: '\u62a2\u5355',
	emptyTitle: '\u6682\u65f6\u6ca1\u6709\u65b0\u7684\u5f85\u63a5\u5355',
	emptyText: '\u7a0d\u540e\u5237\u65b0\u770b\u770b\uff0c\u6216\u8005\u5148\u53bb\u5904\u7406\u8fdb\u884c\u4e2d\u7684\u8ba2\u5355',
	loadFail: '\u5f85\u63a5\u5355\u52a0\u8f7d\u5931\u8d25',
	claimSuccess: '\u62a2\u5355\u6210\u529f',
	claimFail: '\u62a2\u5355\u5931\u8d25'
}

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20
const currentMode = ref('manual')
const sourceOrders = ref([])

const modes = [
	{ value: 'manual', label: '\u966a\u8bca\u5458\u62a2\u5355' },
	{ value: 'smart', label: '\u81ea\u52a8\u6d3e\u5355' }
]

const displayOrders = computed(() => {
	const list = [...sourceOrders.value]
	if (currentMode.value === 'smart') {
		return list.sort((a, b) => {
			if (a.isUrgent !== b.isUrgent) {
				return a.isUrgent ? -1 : 1
			}
			return (a.distanceKm || 999) - (b.distanceKm || 999)
		})
	}
	return list
})

async function loadOrders() {
	try {
		sourceOrders.value = await fetchAvailableOrders()
	} catch (error) {
		uni.showToast({
			title: error.message || texts.loadFail,
			icon: 'none'
		})
	}
}

function setMode(mode) {
	currentMode.value = mode
}

function viewDetail(id) {
	uni.navigateTo({
		url: `/pages/order-detail/index?id=${id}`
	})
}

async function handleClaim(item) {
	try {
		await claimOrder(item.id)
		uni.showToast({
			title: texts.claimSuccess,
			icon: 'success'
		})
		setTimeout(() => {
			uni.reLaunch({ url: '/pages/active/index' })
		}, 400)
	} catch (error) {
		uni.showToast({
			title: error.message || texts.claimFail,
			icon: 'none'
		})
	}
}

onShow(() => {
	loadOrders()
})
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding: 0 24rpx 0;
}

.page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 22rpx;
}

.page-title {
	display: block;
	font-size: 42rpx;
	font-weight: 700;
	color: #213547;
}

.page-subtitle {
	display: block;
	margin-top: 10rpx;
	font-size: 24rpx;
	color: #7d8b99;
}

.refresh-btn {
	padding: 16rpx 22rpx;
	border-radius: 18rpx;
	background: #edf6f1;
	font-size: 24rpx;
	font-weight: 600;
	color: #2b9a6f;
}

.mode-switch {
	display: flex;
	gap: 14rpx;
	margin-bottom: 20rpx;
}

.mode-chip {
	flex: 1;
	height: 86rpx;
	border-radius: 20rpx;
	background: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: 700;
	color: #6c7a88;
	box-shadow: 0 12rpx 30rpx rgba(31, 90, 66, 0.05);
}

.mode-chip.active {
	background: linear-gradient(135deg, #2b9a6f, #49bb8f);
	color: #fff;
}

.list {
	padding-bottom: 18rpx;
}

.order-card,
.empty-card {
	background: #fff;
	border-radius: 24rpx;
	padding: 28rpx;
	margin-bottom: 18rpx;
	box-shadow: 0 16rpx 40rpx rgba(31, 90, 66, 0.06);
}

.top-row,
.action-row,
.badge-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.patient-name {
	display: block;
	font-size: 34rpx;
	font-weight: 700;
	color: #213547;
}

.patient-meta,
.order-line {
	display: block;
}

.patient-meta {
	margin-top: 10rpx;
	font-size: 24rpx;
	color: #8391a0;
}

.badge-row {
	flex-direction: column;
	align-items: flex-end;
	gap: 10rpx;
}

.urgent-badge {
	padding: 8rpx 16rpx;
	border-radius: 14rpx;
	font-size: 22rpx;
	font-weight: 700;
	color: #ff6b4a;
	background: rgba(255, 107, 74, 0.12);
}

.price-text {
	font-size: 38rpx;
	font-weight: 700;
	color: #2b9a6f;
}

.order-line {
	margin-top: 14rpx;
	font-size: 28rpx;
	font-weight: 600;
	color: #31485a;
	line-height: 1.5;
}

.order-line.light {
	font-size: 24rpx;
	font-weight: 400;
	color: #8391a0;
}

.action-row {
	gap: 16rpx;
	margin-top: 22rpx;
}

.ghost-btn,
.primary-btn {
	height: 84rpx;
	border-radius: 18rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	font-size: 28rpx;
	font-weight: 700;
}

.ghost-btn {
	background: #f2f5f4;
	color: #60707d;
}

.primary-btn {
	background: linear-gradient(135deg, #2b9a6f, #49bb8f);
	color: #fff;
}

.empty-title {
	display: block;
	font-size: 32rpx;
	font-weight: 700;
	color: #213547;
}

.empty-text {
	display: block;
	margin-top: 12rpx;
	font-size: 24rpx;
	line-height: 1.5;
	color: #8391a0;
}
</style>
