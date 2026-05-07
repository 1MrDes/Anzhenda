<template>
	<view class="bottom-nav">
		<view class="nav-inner">
			<view
				v-for="item in navItems"
				:key="item.key"
				class="nav-item"
				:class="{ active: active === item.key }"
				@tap="go(item)"
			>
				<AzIcon :name="item.icon" :size="24" :color="active === item.key ? '#2B9A6F' : '#9CA3AF'" />
				<text class="nav-label">{{ item.label }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import AzIcon from './AzIcon.vue'

export default {
	name: 'AzBottomNav',
	components: { AzIcon },
	props: {
		active: { type: String, default: 'home' }
	},
	data() {
		return {
			navItems: [
				{ key: 'home', label: '首页', icon: 'home', url: '/pages/index/index' },
				{ key: 'booking', label: '预约', icon: 'calendar', url: '/pages/booking/index' },
				{ key: 'orders', label: '订单', icon: 'file', url: '/pages/orders/index' },
				{ key: 'profile', label: '我的', icon: 'user', url: '/pages/profile/index' }
			]
		}
	},
	methods: {
		go(item) {
			if (this.active === item.key) return
			uni.reLaunch({ url: item.url })
		}
	}
}
</script>

<style scoped>
.bottom-nav {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 40;
	background: #FFFFFF;
	border-top: 1px solid #E8E5E0;
	padding-bottom: env(safe-area-inset-bottom);
}

.nav-inner {
	height: calc(var(--bottom-panel-offset, 72px));
	display: flex;
	align-items: center;
	justify-content: space-around;
}

.nav-item {
	min-width: calc(var(--touch-size, 44px) + 20px);
	min-height: var(--touch-size, 44px);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 6px;
	color: #9CA3AF;
}

.nav-item.active {
	color: #2B9A6F;
}

.nav-label {
	font-size: var(--font-size-small, 14px);
	line-height: 1;
	font-weight: 600;
	color: currentColor;
}
</style>
