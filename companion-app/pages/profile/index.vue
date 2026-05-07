<template>
	<view class="page">
		<view class="page-header" :style="{ paddingTop: statusBarHeight + 14 + 'px' }">
			<view>
				<text class="page-title">{{ texts.pageTitle }}</text>
				<text class="page-subtitle">{{ texts.pageSubtitle }}</text>
			</view>
		</view>

		<view class="profile-card">
			<view class="profile-left">
				<view class="avatar">{{ profile.avatarText }}</view>
				<view>
					<text class="profile-name">{{ profile.name }}</text>
					<text class="profile-role">{{ profile.role }}</text>
					<text class="profile-verify">{{ profile.verified ? texts.verified : texts.unverified }}</text>
				</view>
			</view>
			<view class="rating-box">
				<text class="rating-value">{{ profile.rating }}</text>
				<text class="rating-label">{{ texts.rating }}</text>
			</view>
		</view>

		<view class="status-card">
			<text class="card-title">{{ texts.statusTitle }}</text>
			<view class="status-switch">
				<view
					v-for="item in statusOptions"
					:key="item.value"
					class="status-chip"
					:class="{ active: profile.status === item.value }"
					@tap="changeStatus(item.value)"
				>
					{{ item.label }}
				</view>
			</view>
		</view>

		<view class="stats-grid">
			<view class="stats-card">
				<text class="stats-label">{{ texts.doneCount }}</text>
				<text class="stats-value">{{ completedCount }} {{ texts.unitOrder }}</text>
			</view>
			<view class="stats-card">
				<text class="stats-label">{{ texts.totalIncome }}</text>
				<text class="stats-value">{{ texts.currency }}{{ totalIncome }}</text>
			</view>
		</view>

		<view class="section">
			<view class="section-head">
				<text class="section-title">{{ texts.historyTitle }}</text>
				<text class="section-link" @tap="loadHistory">{{ texts.refresh }}</text>
			</view>

			<view v-if="historyOrders.length">
				<view v-for="item in historyOrders" :key="item.id" class="history-card" @tap="viewDetail(item.id)">
					<view class="history-row">
						<text class="history-name">{{ item.patientName }}</text>
						<text class="history-price">{{ texts.currency }}{{ item.totalFee }}</text>
					</view>
					<text class="history-main">{{ item.serviceType }} / {{ item.hospital }}</text>
					<text class="history-meta">{{ item.date }} {{ item.time }} / {{ item.stageLabel }}</text>
				</view>
			</view>

			<view v-else class="empty-card">
				<text class="empty-text">{{ texts.emptyHistory }}</text>
			</view>
		</view>

		<view class="logout-btn" @tap="logout">{{ texts.logout }}</view>

		<CompanionTabBar current="/pages/profile/index" />
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CompanionTabBar from '@/components/CompanionTabBar.vue'
import { fetchMyOrders } from '@/utils/companion-api'
import { companionSession, setCompanionStatus, WORK_STATUS_OPTIONS } from '@/utils/companion-session'

const texts = {
	pageTitle: '\u6211\u7684',
	pageSubtitle: '\u4e2a\u4eba\u8d44\u6599\u3001\u8ba4\u8bc1\u72b6\u6001\u3001\u6536\u5165\u548c\u5386\u53f2\u8ba2\u5355\u90fd\u5728\u8fd9\u91cc',
	verified: '\u5df2\u8ba4\u8bc1\u966a\u8bca\u5458',
	unverified: '\u5f85\u8ba4\u8bc1',
	rating: '\u670d\u52a1\u8bc4\u5206',
	statusTitle: '\u5728\u7ebf\u72b6\u6001',
	doneCount: '\u7d2f\u8ba1\u5b8c\u6210',
	unitOrder: '\u5355',
	totalIncome: '\u5386\u53f2\u6536\u5165',
	historyTitle: '\u5386\u53f2\u8ba2\u5355',
	refresh: '\u5237\u65b0',
	emptyHistory: '\u8fd8\u6ca1\u6709\u5386\u53f2\u8ba2\u5355\uff0c\u5b8c\u6210\u670d\u52a1\u540e\u4f1a\u5728\u8fd9\u91cc\u5c55\u793a',
	logout: '\u9000\u51fa\u767b\u5f55',
	currency: '\u00a5',
	loadFail: '\u5386\u53f2\u8ba2\u5355\u52a0\u8f7d\u5931\u8d25',
	logoutToast: '\u5f53\u524d\u7248\u672c\u9ed8\u8ba4\u514d\u767b\u5f55\uff0c\u5df2\u5207\u6362\u4e3a\u4f11\u606f'
}

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20
const profile = companionSession
const statusOptions = WORK_STATUS_OPTIONS
const historyOrders = ref([])

const completedCount = computed(() => historyOrders.value.length || profile.completedCount)
const totalIncome = computed(() => {
	if (!historyOrders.value.length) {
		return profile.todayIncome * 8
	}
	return historyOrders.value.reduce((sum, item) => sum + Number(item.totalFee || 0), 0)
})

async function loadHistory() {
	try {
		historyOrders.value = await fetchMyOrders('history')
	} catch (error) {
		uni.showToast({
			title: error.message || texts.loadFail,
			icon: 'none'
		})
	}
}

function changeStatus(status) {
	setCompanionStatus(status)
}

function logout() {
	setCompanionStatus('rest')
	uni.showToast({
		title: texts.logoutToast,
		icon: 'none'
	})
}

function viewDetail(id) {
	uni.navigateTo({
		url: `/pages/order-detail/index?id=${id}`
	})
}

onShow(() => {
	loadHistory()
})
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding: 0 24rpx 0;
}

.page-header {
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
	line-height: 1.5;
	color: #7d8b99;
}

.profile-card,
.status-card,
.stats-card,
.history-card,
.empty-card {
	background: #fff;
	border-radius: 24rpx;
	box-shadow: 0 16rpx 40rpx rgba(31, 90, 66, 0.06);
}

.profile-card {
	padding: 28rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.profile-left {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.avatar {
	width: 92rpx;
	height: 92rpx;
	border-radius: 46rpx;
	background: linear-gradient(135deg, #2b9a6f, #51c490);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 34rpx;
	font-weight: 700;
	color: #fff;
}

.profile-name {
	display: block;
	font-size: 34rpx;
	font-weight: 700;
	color: #213547;
}

.profile-role,
.profile-verify {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #8391a0;
}

.rating-box {
	padding: 20rpx;
	border-radius: 20rpx;
	background: #f7faf8;
	text-align: center;
}

.rating-value {
	display: block;
	font-size: 40rpx;
	font-weight: 700;
	color: #2b9a6f;
}

.rating-label {
	display: block;
	margin-top: 6rpx;
	font-size: 22rpx;
	color: #8b97a6;
}

.status-card {
	margin-top: 18rpx;
	padding: 28rpx;
}

.card-title,
.section-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #213547;
}

.status-switch {
	display: flex;
	gap: 14rpx;
	margin-top: 18rpx;
}

.status-chip {
	flex: 1;
	height: 84rpx;
	border-radius: 18rpx;
	background: #f1f5f3;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 26rpx;
	font-weight: 700;
	color: #6f7d8c;
}

.status-chip.active {
	background: #2b9a6f;
	color: #fff;
}

.stats-grid {
	display: flex;
	gap: 18rpx;
	margin-top: 18rpx;
}

.stats-card {
	flex: 1;
	padding: 26rpx;
}

.stats-label {
	display: block;
	font-size: 24rpx;
	color: #7d8b99;
}

.stats-value {
	display: block;
	margin-top: 16rpx;
	font-size: 40rpx;
	font-weight: 700;
	color: #213547;
}

.section {
	margin-top: 24rpx;
}

.section-head,
.history-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.section-link {
	font-size: 24rpx;
	font-weight: 600;
	color: #2b9a6f;
}

.history-card,
.empty-card {
	padding: 24rpx;
	margin-top: 16rpx;
}

.history-name {
	font-size: 30rpx;
	font-weight: 700;
	color: #213547;
}

.history-price {
	font-size: 34rpx;
	font-weight: 700;
	color: #2b9a6f;
}

.history-main,
.history-meta,
.empty-text {
	display: block;
	margin-top: 10rpx;
	font-size: 24rpx;
	line-height: 1.5;
	color: #8391a0;
}

.history-main {
	font-size: 28rpx;
	font-weight: 600;
	color: #31485a;
}

.logout-btn {
	height: 88rpx;
	border-radius: 20rpx;
	background: #eef5f2;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: 700;
	color: #2b9a6f;
	margin-top: 24rpx;
}
</style>
