<template>
	<view class="page">
		<view class="page-header" :style="{ paddingTop: statusBarHeight + 14 + 'px' }">
			<view>
				<text class="page-title">{{ texts.pageTitle }}</text>
				<text class="page-subtitle">{{ texts.pageSubtitle }}</text>
			</view>
			<view class="refresh-btn" @tap="loadOrders">{{ texts.refresh }}</view>
		</view>

		<view v-if="orders.length">
			<view v-for="item in orders" :key="item.id" class="order-card">
				<view class="top-row">
					<text class="patient-name">{{ item.patientName }}</text>
					<text class="stage-pill">{{ item.stageLabel }}</text>
				</view>

				<text class="order-line">{{ item.serviceType }} / {{ item.hospital }}</text>
				<text class="order-line light">{{ item.date }} {{ item.time }} / {{ item.distanceText }}</text>

				<view class="progress-row">
					<view
						v-for="stage in stageList"
						:key="stage.value"
						class="progress-node"
						:class="{ active: isStageReached(item.serviceStage, stage.value) }"
					>
						<view class="progress-dot" />
						<text class="progress-text">{{ stage.label }}</text>
					</view>
				</view>

				<view class="action-row">
					<view class="ghost-btn" @tap="viewDetail(item.id)">{{ texts.detail }}</view>
					<view
						v-if="item.nextServiceStage"
						class="primary-btn"
						@tap="advanceStage(item)"
					>
						{{ getNextStageAction(item) }}
					</view>
					<view v-else class="done-btn">{{ texts.done }}</view>
				</view>
			</view>
		</view>

		<view v-else class="empty-card">
			<text class="empty-title">{{ texts.emptyTitle }}</text>
			<text class="empty-text">{{ texts.emptyText }}</text>
			<view class="primary-btn wide" @tap="goOrderPool">{{ texts.goPool }}</view>
		</view>

		<CompanionTabBar current="/pages/active/index" />
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CompanionTabBar from '@/components/CompanionTabBar.vue'
import { fetchMyOrders, getNextStageAction, updateOrderStatus } from '@/utils/companion-api'

const texts = {
	pageTitle: '\u8fdb\u884c\u4e2d\u8ba2\u5355',
	pageSubtitle: '\u63a5\u5355\u540e\u6309\u9636\u6bb5\u63a8\u8fdb\uff0c\u7528\u6237\u7aef\u4f1a\u540c\u6b65\u770b\u5230\u53d8\u5316',
	refresh: '\u5237\u65b0',
	detail: '\u67e5\u770b\u8be6\u60c5',
	done: '\u5df2\u5b8c\u6210',
	emptyTitle: '\u76ee\u524d\u6ca1\u6709\u6b63\u5728\u5904\u7406\u7684\u8ba2\u5355',
	emptyText: '\u53bb\u5f85\u63a5\u5355\u9875\u770b\u770b\u9644\u8fd1\u7684\u65b0\u8ba2\u5355\u5427',
	goPool: '\u53bb\u5f85\u63a5\u5355',
	loadFail: '\u8fdb\u884c\u4e2d\u8ba2\u5355\u52a0\u8f7d\u5931\u8d25',
	updateSuccess: '\u72b6\u6001\u5df2\u66f4\u65b0',
	updateFail: '\u72b6\u6001\u66f4\u65b0\u5931\u8d25'
}

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20
const orders = ref([])

const stageList = [
	{ value: 'accepted', label: '\u5df2\u63a5\u5355' },
	{ value: 'on_the_way', label: '\u524d\u5f80\u4e2d' },
	{ value: 'picked_up', label: '\u5df2\u63a5\u5230\u7528\u6237' },
	{ value: 'arrived', label: '\u5df2\u5230\u8fbe' },
	{ value: 'serving', label: '\u670d\u52a1\u4e2d' },
	{ value: 'completed', label: '\u5df2\u5b8c\u6210' }
]

async function loadOrders() {
	try {
		orders.value = await fetchMyOrders('active')
	} catch (error) {
		uni.showToast({
			title: error.message || texts.loadFail,
			icon: 'none'
		})
	}
}

function isStageReached(currentStage, targetStage) {
	const currentIndex = stageList.findIndex(item => item.value === currentStage)
	const targetIndex = stageList.findIndex(item => item.value === targetStage)
	return currentIndex >= targetIndex && targetIndex >= 0
}

function viewDetail(id) {
	uni.navigateTo({
		url: `/pages/order-detail/index?id=${id}`
	})
}

function goOrderPool() {
	uni.reLaunch({ url: '/pages/order-pool/index' })
}

async function advanceStage(item) {
	if (!item.nextServiceStage) {
		return
	}
	if (item.nextServiceStage === 'picked_up') {
		viewDetail(item.id)
		return
	}

	try {
		await updateOrderStatus(item.id, item.nextServiceStage)
		uni.showToast({
			title: texts.updateSuccess,
			icon: 'success'
		})
		loadOrders()
	} catch (error) {
		uni.showToast({
			title: error.message || texts.updateFail,
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
	padding-bottom: 20rpx;
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

.refresh-btn {
	padding: 16rpx 22rpx;
	border-radius: 18rpx;
	background: #edf6f1;
	font-size: 24rpx;
	font-weight: 600;
	color: #2b9a6f;
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
.action-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.patient-name {
	font-size: 34rpx;
	font-weight: 700;
	color: #213547;
}

.stage-pill {
	padding: 8rpx 16rpx;
	border-radius: 14rpx;
	font-size: 22rpx;
	font-weight: 700;
	color: #2b9a6f;
	background: rgba(43, 154, 111, 0.12);
}

.order-line {
	display: block;
	margin-top: 14rpx;
	font-size: 28rpx;
	font-weight: 600;
	color: #31485a;
}

.order-line.light {
	font-size: 24rpx;
	font-weight: 400;
	color: #8391a0;
}

.progress-row {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 8rpx;
	margin-top: 22rpx;
	padding: 18rpx 16rpx;
	border-radius: 18rpx;
	background: #f7faf8;
}

.progress-node {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
}

.progress-dot {
	width: 18rpx;
	height: 18rpx;
	border-radius: 9rpx;
	background: #c9d4dc;
}

.progress-text {
	margin-top: 10rpx;
	font-size: 20rpx;
	color: #8a96a3;
	text-align: center;
}

.progress-node.active .progress-dot {
	background: #2b9a6f;
}

.progress-node.active .progress-text {
	color: #2b9a6f;
	font-weight: 700;
}

.action-row {
	gap: 16rpx;
	margin-top: 22rpx;
}

.ghost-btn,
.primary-btn,
.done-btn {
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

.done-btn {
	background: #edf6f1;
	color: #2b9a6f;
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
	color: #8391a0;
}

.wide {
	margin-top: 20rpx;
}
</style>
