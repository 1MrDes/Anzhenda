<template>
	<view class="tabbar-wrap">
		<view class="tabbar">
			<view
				v-for="item in items"
				:key="item.path"
				class="tab-item"
				:class="{ active: current === item.path }"
				@tap="switchPage(item.path)"
			>
				<view class="tab-icon">{{ item.icon }}</view>
				<text class="tab-label">{{ item.label }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
const props = defineProps({
	current: {
		type: String,
		default: ''
	}
})

const items = [
	{ path: '/pages/workbench/index', label: '\u5de5\u4f5c\u53f0', icon: 'W' },
	{ path: '/pages/order-pool/index', label: '\u5f85\u63a5\u5355', icon: 'D' },
	{ path: '/pages/active/index', label: '\u8fdb\u884c\u4e2d', icon: 'J' },
	{ path: '/pages/profile/index', label: '\u6211\u7684', icon: 'M' }
]

function switchPage(path) {
	if (path === props.current) {
		return
	}
	uni.reLaunch({ url: path })
}
</script>

<style scoped>
.tabbar-wrap {
	height: calc(132rpx + env(safe-area-inset-bottom));
}

.tabbar {
	position: fixed;
	left: 24rpx;
	right: 24rpx;
	bottom: 24rpx;
	padding: 14rpx 18rpx calc(14rpx + env(safe-area-inset-bottom));
	background: rgba(255, 255, 255, 0.96);
	border: 1px solid rgba(43, 154, 111, 0.08);
	border-radius: 28rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 16rpx 48rpx rgba(31, 90, 66, 0.1);
	z-index: 50;
}

.tab-item {
	width: 25%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 8rpx 0;
	color: #8b97a6;
}

.tab-icon {
	width: 52rpx;
	height: 52rpx;
	border-radius: 26rpx;
	background: #eef5f2;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	font-weight: 700;
	margin-bottom: 6rpx;
}

.tab-label {
	font-size: 22rpx;
	font-weight: 600;
}

.tab-item.active {
	color: #2b9a6f;
}

.tab-item.active .tab-icon {
	background: linear-gradient(135deg, #2b9a6f, #47ba8d);
	color: #fff;
}
</style>
