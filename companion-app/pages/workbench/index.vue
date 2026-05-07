<template>
	<view class="page">
		<view class="page-header" :style="{ paddingTop: statusBarHeight + 14 + 'px' }">
			<view>
				<text class="page-title">{{ texts.pageTitle }}</text>
				<text class="page-subtitle">{{ texts.pageSubtitle }}</text>
			</view>
			<view class="avatar">{{ profile.avatarText }}</view>
		</view>

		<view class="profile-card">
			<view>
				<text class="profile-name">{{ profile.name }}</text>
				<text class="profile-role">{{ profile.role }}</text>
			</view>
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

		<view class="summary-grid">
			<view class="summary-card">
				<text class="summary-label">{{ texts.todayPending }}</text>
				<text class="summary-value">{{ dashboard.todayPendingCount }}</text>
				<text class="summary-hint">{{ texts.todayPendingHint }}</text>
			</view>
			<view class="summary-card">
				<text class="summary-label">{{ texts.nearbyOrders }}</text>
				<text class="summary-value">{{ dashboard.nearbyOrderCount }}</text>
				<text class="summary-link" @tap="goOrderPool">{{ texts.goClaim }}</text>
			</view>
		</view>

		<view class="income-grid">
			<view class="income-card">
				<text class="income-label">{{ texts.todayIncome }}</text>
				<text class="income-value">{{ texts.currency }}{{ dashboard.todayIncome || 0 }}</text>
			</view>
			<view class="income-card">
				<text class="income-label">{{ texts.weekDone }}</text>
				<text class="income-value">{{ dashboard.weekCompletedCount || 0 }} {{ texts.unitOrder }}</text>
			</view>
		</view>

		<view class="section">
			<view class="section-head">
				<text class="section-title">{{ texts.activeSection }}</text>
				<text class="section-link" @tap="goActive">{{ texts.viewAll }}</text>
			</view>

			<view v-if="dashboard.activeOrder" class="order-card" @tap="viewOrder(dashboard.activeOrder.id)">
				<view class="order-row">
					<text class="order-patient">{{ dashboard.activeOrder.patientName }}</text>
					<text class="order-stage">{{ dashboard.activeOrder.stageLabel }}</text>
				</view>
				<text class="order-main">{{ dashboard.activeOrder.serviceType }} / {{ dashboard.activeOrder.hospital }}</text>
				<text class="order-meta">{{ dashboard.activeOrder.date }} {{ dashboard.activeOrder.time }} / {{ dashboard.activeOrder.distanceText }}</text>
				<view class="order-actions">
					<view class="ghost-btn" @tap.stop="viewOrder(dashboard.activeOrder.id)">{{ texts.detail }}</view>
					<view class="primary-btn" @tap.stop="goActive">{{ texts.goHandle }}</view>
				</view>
			</view>

			<view v-else class="empty-card">
				<text class="empty-title">{{ texts.noActive }}</text>
				<text class="empty-text">{{ texts.noActiveHint }}</text>
				<view class="primary-btn wide" @tap="goOrderPool">{{ texts.goNearby }}</view>
			</view>
		</view>

		<view class="shortcut-row">
			<view class="shortcut-card" @tap="goOrderPool">
				<text class="shortcut-title">{{ texts.shortcutPoolTitle }}</text>
				<text class="shortcut-text">{{ texts.shortcutPoolText }}</text>
			</view>
			<view class="shortcut-card" @tap="goProfile">
				<text class="shortcut-title">{{ texts.shortcutMineTitle }}</text>
				<text class="shortcut-text">{{ texts.shortcutMineText }}</text>
			</view>
		</view>

		<CompanionTabBar current="/pages/workbench/index" />
	</view>
</template>

<script setup>
import { reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CompanionTabBar from '@/components/CompanionTabBar.vue'
import { fetchDashboard } from '@/utils/companion-api'
import { companionSession, setCompanionStatus, WORK_STATUS_OPTIONS } from '@/utils/companion-session'

const texts = {
	pageTitle: '\u966a\u8bca\u5de5\u4f5c\u53f0',
	pageSubtitle: '\u6253\u5f00\u5e94\u7528\u5148\u770b\u8fd9\u91cc\uff0c\u4eca\u5929\u8981\u505a\u4ec0\u4e48\u4e00\u773c\u5c31\u6e05\u695a',
	todayPending: '\u4eca\u65e5\u5f85\u5904\u7406',
	todayPendingHint: '\u5df2\u63a5\u5355\u540e\u4f1a\u5728\u8fd9\u91cc\u663e\u793a',
	nearbyOrders: '\u9644\u8fd1\u5f85\u63a5\u5355',
	goClaim: '\u53bb\u62a2\u5355',
	todayIncome: '\u4eca\u65e5\u6536\u5165',
	weekDone: '\u672c\u5468\u5b8c\u6210',
	unitOrder: '\u5355',
	activeSection: '\u5f53\u524d\u8fdb\u884c\u4e2d\u7684\u8ba2\u5355',
	viewAll: '\u67e5\u770b\u5168\u90e8',
	detail: '\u67e5\u770b\u8be6\u60c5',
	goHandle: '\u53bb\u5904\u7406',
	noActive: '\u73b0\u5728\u8fd8\u6ca1\u6709\u8fdb\u884c\u4e2d\u7684\u8ba2\u5355',
	noActiveHint: '\u53ef\u4ee5\u5148\u53bb\u5f85\u63a5\u5355\u9875\u770b\u770b\u9644\u8fd1\u8ba2\u5355',
	goNearby: '\u67e5\u770b\u9644\u8fd1\u5f85\u63a5\u5355',
	shortcutPoolTitle: '\u5f85\u63a5\u5355',
	shortcutPoolText: '\u9644\u8fd1\u8ba2\u5355\u3001\u7d27\u6025\u5355\u90fd\u5728\u8fd9\u91cc',
	shortcutMineTitle: '\u6211\u7684\u6536\u5165',
	shortcutMineText: '\u67e5\u770b\u8bc4\u5206\u3001\u8ba4\u8bc1\u548c\u5386\u53f2\u8ba2\u5355',
	currency: '\u00a5',
	loadFail: '\u5de5\u4f5c\u53f0\u52a0\u8f7d\u5931\u8d25'
}

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20
const profile = companionSession
const statusOptions = WORK_STATUS_OPTIONS

const dashboard = reactive({
	todayPendingCount: 0,
	nearbyOrderCount: 0,
	activeOrder: null,
	todayIncome: 0,
	weekCompletedCount: 0
})

async function loadDashboard() {
	try {
		const data = await fetchDashboard()
		Object.assign(dashboard, data || {})
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

function goOrderPool() {
	uni.reLaunch({ url: '/pages/order-pool/index' })
}

function goActive() {
	uni.reLaunch({ url: '/pages/active/index' })
}

function goProfile() {
	uni.reLaunch({ url: '/pages/profile/index' })
}

function viewOrder(id) {
	uni.navigateTo({
		url: `/pages/order-detail/index?id=${id}`
	})
}

onShow(() => {
	loadDashboard()
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
	padding-bottom: 24rpx;
}

.page-title {
	display: block;
	font-size: 44rpx;
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

.avatar {
	width: 88rpx;
	height: 88rpx;
	border-radius: 44rpx;
	background: linear-gradient(135deg, #2b9a6f, #51c490);
	color: #fff;
	font-size: 34rpx;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: center;
}

.profile-card,
.summary-card,
.income-card,
.order-card,
.empty-card,
.shortcut-card {
	background: #fff;
	border-radius: 24rpx;
	box-shadow: 0 16rpx 40rpx rgba(31, 90, 66, 0.06);
}

.profile-card {
	padding: 28rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.profile-name {
	display: block;
	font-size: 36rpx;
	font-weight: 700;
	color: #213547;
}

.profile-role {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #7d8b99;
}

.status-switch {
	display: flex;
	gap: 12rpx;
}

.status-chip {
	min-width: 92rpx;
	padding: 14rpx 18rpx;
	border-radius: 18rpx;
	background: #f1f5f3;
	color: #6f7d8c;
	text-align: center;
	font-size: 24rpx;
	font-weight: 600;
}

.status-chip.active {
	background: #2b9a6f;
	color: #fff;
}

.summary-grid,
.income-grid,
.shortcut-row {
	display: flex;
	gap: 18rpx;
	margin-bottom: 18rpx;
}

.summary-card,
.income-card,
.shortcut-card {
	flex: 1;
	padding: 26rpx;
}

.summary-label,
.income-label {
	display: block;
	font-size: 24rpx;
	color: #7d8b99;
}

.summary-value,
.income-value {
	display: block;
	margin-top: 16rpx;
	font-size: 44rpx;
	font-weight: 700;
	color: #213547;
}

.summary-hint,
.shortcut-text {
	display: block;
	margin-top: 10rpx;
	font-size: 22rpx;
	line-height: 1.5;
	color: #8c98a5;
}

.summary-link,
.section-link {
	font-size: 24rpx;
	font-weight: 600;
	color: #2b9a6f;
}

.section {
	margin-top: 10rpx;
}

.section-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.section-title,
.shortcut-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #213547;
}

.order-card,
.empty-card {
	padding: 28rpx;
	margin-bottom: 20rpx;
}

.order-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.order-patient {
	font-size: 34rpx;
	font-weight: 700;
	color: #213547;
}

.order-stage {
	padding: 8rpx 14rpx;
	border-radius: 14rpx;
	font-size: 22rpx;
	font-weight: 600;
	color: #2b9a6f;
	background: rgba(43, 154, 111, 0.12);
}

.order-main,
.order-meta,
.empty-title,
.empty-text {
	display: block;
}

.order-main {
	margin-top: 14rpx;
	font-size: 28rpx;
	font-weight: 600;
	color: #2f4658;
	line-height: 1.5;
}

.order-meta,
.empty-text {
	margin-top: 10rpx;
	font-size: 24rpx;
	color: #8693a0;
	line-height: 1.5;
}

.order-actions {
	display: flex;
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
	font-size: 28rpx;
	font-weight: 700;
	flex: 1;
}

.ghost-btn {
	background: #f2f5f4;
	color: #5f6d7b;
}

.primary-btn {
	background: linear-gradient(135deg, #2b9a6f, #4dbe90);
	color: #fff;
}

.wide {
	margin-top: 20rpx;
}

.empty-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #213547;
}
</style>
