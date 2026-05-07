<template>
	<AzShell active="">
		<view class="page">
			<view class="hero">
				<view class="back" @tap="back"><AzIcon name="left" :size="28" color="#2D2D2D" /></view>
				<view class="profile">
					<view class="avatar-large">{{ companion.name.charAt(0) }}</view>
					<text class="name">{{ companion.name }}</text>
					<text class="exp">{{ companion.experience }}</text>
					<view class="rating">
						<AzIcon name="star" :size="20" color="#F5A623" />
						<text class="rating-num">{{ companion.rating }}</text>
						<text class="rating-count">({{ companion.reviewCount }}条评价)</text>
					</view>
					<view class="status" :class="{ busy: companion.status !== 'available' }">
						<view class="status-dot" />
						<text>{{ companion.status === 'available' ? '在线' : '忙碌' }}</text>
					</view>
				</view>
			</view>

			<scroll-view class="tag-scroll" scroll-x show-scrollbar="false">
				<view class="tag-row">
					<text v-for="service in companion.services" :key="service" class="outline-tag">{{ service }}</text>
				</view>
			</scroll-view>

			<view class="stats-card">
				<view class="stat">
					<text class="stat-value">{{ companion.completedOrders.toLocaleString() }}</text>
					<text class="stat-label">服务次数</text>
				</view>
				<view class="stat border">
					<text class="stat-value">99%</text>
					<text class="stat-label">好评率</text>
				</view>
				<view class="stat border">
					<text class="stat-value">{{ years }}年</text>
					<text class="stat-label">从业经验</text>
				</view>
			</view>

			<view class="section">
				<view class="section-title">
					<AzIcon name="shield" :size="20" color="#2B9A6F" />
					<text>资质证书</text>
				</view>
				<scroll-view scroll-x show-scrollbar="false">
					<view class="cert-row">
						<view
							v-for="(cert, index) in companion.certifications"
							:key="cert"
							class="cert-card"
							:class="'theme-' + (index % 3)"
							@tap="openCert(cert, index)"
						>
							<AzIcon :name="certIcon(cert)" :size="32" :color="certColor(index)" />
							<text>{{ cert }}</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<view class="section">
				<view class="section-head">
					<view class="section-title">
						<AzIcon name="message" :size="20" color="#2B9A6F" />
						<text>用户评价</text>
					</view>
					<text class="review-total">共{{ companion.reviewCount }}条</text>
				</view>
				<view v-for="review in reviews" :key="review.id" class="review-card">
					<view class="review-avatar">{{ review.userName.charAt(0) }}</view>
					<view class="review-main">
						<view class="row between">
							<text class="review-name">{{ review.userName }}</text>
							<text class="review-date">{{ review.date }}</text>
						</view>
						<view class="stars">
							<AzIcon v-for="n in 5" :key="n" name="star" :size="14" :color="n <= review.rating ? '#F5A623' : '#E8E5E0'" />
						</view>
						<text class="review-text">{{ review.content }}</text>
					</view>
				</view>
			</view>

			<view class="bottom-bar">
				<view class="start-price">
					<text class="from">起</text><text class="money">¥{{ companion.price }}</text><text class="from">/次</text>
				</view>
				<view class="book-btn" @tap="book">立即预约</view>
			</view>

			<view v-if="certOpen" class="sheet-mask" @tap="certOpen = false">
				<view class="sheet" @tap.stop>
					<view class="sheet-handle" />
					<text class="sheet-title">{{ selectedCert }}</text>
					<view class="cert-big" :class="'theme-' + selectedCertIndex">
						<AzIcon :name="certIcon(selectedCert)" :size="64" :color="certColor(selectedCertIndex)" />
					</view>
					<text class="cert-name">{{ selectedCert }}</text>
					<view class="verified"><AzIcon name="check" :size="18" color="#2B9A6F" /><text>已验证</text></view>
					<text class="cert-desc">持证人 {{ companion.name }}，证书由相关权威机构颁发，平台已核实验证，信息真实有效。</text>
				</view>
			</view>
		</view>
	</AzShell>
</template>

<script>
import AzShell from '@/components/AzShell.vue'
import AzIcon from '@/components/AzIcon.vue'
import { companions, reviews } from '@/common/mockData.js'

export default {
	components: { AzShell, AzIcon },
	data() {
		return {
			companion: companions[0],
			reviews,
			certOpen: false,
			selectedCert: '',
			selectedCertIndex: 0
		}
	},
	computed: {
		years() {
			const matched = this.companion.experience.match(/\d+/)
			return matched ? matched[0] : '8'
		}
	},
	onLoad(query) {
		this.companion = companions.find(item => item.id === query.id) || companions[0]
	},
	methods: {
		back() {
			uni.navigateBack()
		},
		book() {
			uni.navigateTo({ url: '/pages/booking/index' })
		},
		openCert(cert, index) {
			this.selectedCert = cert
			this.selectedCertIndex = index % 3
			this.certOpen = true
		},
		certIcon(cert) {
			if (cert.includes('急救') || cert.includes('心理')) return 'heart'
			if (cert.includes('健康')) return 'award'
			if (cert.includes('护理') || cert.includes('养老')) return 'users'
			return 'shield'
		},
		certColor(index) {
			return ['#2B9A6F', '#4A90D9', '#F5A623'][index % 3]
		}
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding-bottom: 168px;
	background: #FAFAF8;
}
.hero {
	position: relative;
	padding: 16px 20px 32px;
	background: linear-gradient(180deg, #E8F5EE 0%, #FAFAF8 100%);
}
.back {
	width: 44px;
	height: 44px;
	border-radius: 12px;
	background: rgba(255,255,255,.82);
	display: flex;
	align-items: center;
	justify-content: center;
}
.profile {
	margin-top: 16px;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.avatar-large {
	width: 80px;
	height: 80px;
	border-radius: 24px;
	background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%);
	box-shadow: 0 8px 24px rgba(43,154,111,.25);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28px;
	font-weight: 800;
	color: #FFFFFF;
}
.name {
	margin-top: 16px;
	font-size: 24px;
	font-weight: 800;
	color: #2D2D2D;
}
.exp {
	margin-top: 6px;
	font-size: 15px;
	color: #6B7280;
}
.rating {
	margin-top: 12px;
	display: flex;
	align-items: center;
	gap: 8px;
}
.rating-num {
	font-size: 20px;
	font-weight: 800;
	color: #2D2D2D;
}
.rating-count {
	font-size: 18px;
	color: #9CA3AF;
}
.status {
	margin-top: 12px;
	padding: 7px 16px;
	border-radius: 20px;
	background: rgba(43,154,111,.1);
	display: flex;
	align-items: center;
	gap: 7px;
	color: #2B9A6F;
	font-size: 14px;
	font-weight: 700;
}
.status.busy {
	background: rgba(245,166,35,.1);
	color: #F5A623;
}
.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: currentColor;
}
.tag-scroll {
	width: 100%;
}
.tag-row,
.cert-row {
	display: flex;
	gap: 8px;
	padding: 10px 20px;
}
.outline-tag {
	padding: 8px 16px;
	border-radius: 20px;
	border: 1px solid #2B9A6F;
	background: rgba(43,154,111,.05);
	color: #2B9A6F;
	font-size: 14px;
	font-weight: 700;
	white-space: nowrap;
}
.stats-card {
	margin: 18px 20px 0;
	padding: 20px;
	border-radius: 16px;
	border: 1px solid #E8E5E0;
	background: #FFFFFF;
	display: flex;
}
.stat {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.stat.border {
	border-left: 1px solid #F3F0EB;
}
.stat-value {
	font-size: 22px;
	font-weight: 800;
	color: #2B9A6F;
}
.stat-label {
	margin-top: 6px;
	font-size: 13px;
	color: #9CA3AF;
}
.section {
	margin-top: 28px;
	padding: 0 20px;
}
.section-title,
.section-head,
.row,
.between {
	display: flex;
	align-items: center;
}
.section-title {
	gap: 8px;
	font-size: 20px;
	font-weight: 800;
	color: #2D2D2D;
}
.section-head,
.between {
	justify-content: space-between;
}
.review-total {
	font-size: 14px;
	color: #9CA3AF;
}
.cert-row {
	padding: 14px 0 4px;
}
.cert-card {
	width: 140px;
	height: 120px;
	padding: 16px;
	border-radius: 16px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;
	font-size: 13px;
	font-weight: 700;
	text-align: center;
	color: #2D2D2D;
	flex-shrink: 0;
}
.theme-0 { background: linear-gradient(135deg, #E8F5EE 0%, #D4EDDA 100%); }
.theme-1 { background: linear-gradient(135deg, #EBF3FC 0%, #D6E8F9 100%); }
.theme-2 { background: linear-gradient(135deg, #FFF5E0 0%, #FFECC4 100%); }
.review-card {
	margin-top: 12px;
	padding: 16px;
	border-radius: 14px;
	border: 1px solid #F3F0EB;
	background: #FFFFFF;
	display: flex;
	gap: 12px;
}
.review-avatar {
	width: 40px;
	height: 40px;
	border-radius: 12px;
	background: #F3F0EB;
	color: #6B7280;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 15px;
	font-weight: 700;
}
.review-main {
	flex: 1;
	min-width: 0;
}
.review-name {
	font-size: 15px;
	font-weight: 700;
	color: #2D2D2D;
}
.review-date {
	font-size: 13px;
	color: #9CA3AF;
}
.stars {
	margin-top: 6px;
	display: flex;
	gap: 2px;
}
.review-text {
	display: block;
	margin-top: 8px;
	font-size: 14px;
	line-height: 1.55;
	color: #6B7280;
}
.bottom-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 72px;
	z-index: 30;
	padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
	border-top: 1px solid #E8E5E0;
	background: rgba(255,255,255,.96);
	display: flex;
	align-items: center;
	gap: 16px;
}
.start-price {
	flex-shrink: 0;
}
.from {
	font-size: 13px;
	color: #9CA3AF;
}
.money {
	margin-left: 2px;
	font-size: 24px;
	font-weight: 800;
	color: #2B9A6F;
}
.book-btn {
	flex: 1;
	height: 48px;
	border-radius: 14px;
	background: linear-gradient(135deg, #2B9A6F 0%, #3DB88A 100%);
	box-shadow: 0 4px 16px rgba(43,154,111,.3);
	display: flex;
	align-items: center;
	justify-content: center;
	color: #FFFFFF;
	font-size: 17px;
	font-weight: 800;
}
.sheet-mask {
	position: fixed;
	inset: 0;
	z-index: 80;
	background: rgba(0,0,0,.35);
	display: flex;
	align-items: flex-end;
}
.sheet {
	width: 100%;
	padding: 12px 24px calc(36px + env(safe-area-inset-bottom));
	border-radius: 28px 28px 0 0;
	background: #FFFFFF;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.sheet-handle {
	width: 40px;
	height: 4px;
	border-radius: 999px;
	background: #E8E5E0;
}
.sheet-title {
	align-self: flex-start;
	margin-top: 18px;
	font-size: 20px;
	font-weight: 800;
	color: #2D2D2D;
}
.cert-big {
	margin-top: 24px;
	width: 120px;
	height: 120px;
	border-radius: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.cert-name {
	margin-top: 18px;
	font-size: 20px;
	font-weight: 800;
	color: #2D2D2D;
}
.verified {
	margin-top: 12px;
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 15px;
	color: #2B9A6F;
}
.cert-desc {
	margin-top: 16px;
	font-size: 15px;
	line-height: 1.6;
	text-align: center;
	color: #6B7280;
}
</style>
