<template>
	<view class="assist-strip">
		<view class="assist-item assist-item-display">
			<view class="assist-icon">
				<AzIcon name="type" :size="16" color="#2B9A6F" />
			</view>
			<text class="assist-title assist-title-single">&#30028;&#38754;&#22823;&#23567;</text>
			<view class="assist-actions">
				<view
					class="assist-chip"
					:class="{ active: currentLevel === 'large' }"
					@tap.stop="$emit('select-size', 'large')"
				>
					<text class="assist-chip-label">&#22823;</text>
				</view>
				<view
					class="assist-chip"
					:class="{ active: currentLevel === 'xlarge' }"
					@tap.stop="$emit('select-size', 'xlarge')"
				>
					<text class="assist-chip-label">&#36229;&#22823;</text>
				</view>
			</view>
		</view>

		<view class="assist-item assist-item-help" hover-class="assist-item-hover" @tap="$emit('open-help')">
			<view class="assist-icon warm">
				<AzIcon name="help" :size="16" color="#F5A623" />
			</view>
			<text class="assist-title assist-title-single">&#24110;&#21161;&#20013;&#24515;</text>
			<AzIcon name="right" :size="16" color="#9CA3AF" />
		</view>
	</view>
</template>

<script>
import AzIcon from '@/components/AzIcon.vue'

export default {
	components: { AzIcon },
	props: {
		currentLevel: {
			type: String,
			default: 'large'
		}
	},
	emits: ['select-size', 'open-help']
}
</script>

<style scoped>
.assist-strip {
	margin-top: 12px;
	display: grid;
	grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.9fr);
	gap: 8px;
}

.assist-item {
	min-height: 56px;
	padding: 10px 12px;
	border-radius: 14px;
	border: 1px solid rgba(210, 219, 214, 0.9);
	background: rgba(255, 255, 255, 0.82);
	display: flex;
	align-items: center;
	gap: 10px;
}

.assist-item-hover {
	background: rgba(245, 248, 246, 0.96);
}

.assist-item-display {
	padding-right: 10px;
}

.assist-icon {
	width: 32px;
	height: 32px;
	border-radius: 10px;
	background: #e8f5ee;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.assist-icon.warm {
	background: #fff5e0;
}

.assist-main {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.assist-title {
	font-size: 15px;
	font-weight: 700;
	color: #2d2d2d;
	line-height: 1.2;
}

.assist-title-single {
	flex: 1;
	min-width: 0;
	white-space: nowrap;
}

.assist-desc {
	font-size: 12px;
	color: #8a8f98;
	line-height: 1.35;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.assist-actions {
	display: flex;
	align-items: center;
	gap: 6px;
	flex-shrink: 0;
}

.assist-chip {
	min-width: 44px;
	height: 32px;
	padding: 0 10px;
	border-radius: 10px;
	background: #f1f3f2;
	display: flex;
	align-items: center;
	justify-content: center;
}

.assist-chip.active {
	background: #2b9a6f;
}

.assist-chip-label {
	font-size: 13px;
	font-weight: 700;
	color: #6b7280;
	line-height: 1;
}

.assist-chip.active .assist-chip-label {
	color: #ffffff;
}

.assist-item-help {
	padding-right: 10px;
}
</style>
