<template>
	<view class="page">
		<view class="page-header" :style="{ paddingTop: statusBarHeight + 14 + 'px' }">
			<view class="back-btn" @tap="goBack">{{ texts.back }}</view>
			<text class="page-title">{{ texts.pageTitle }}</text>
			<view class="header-gap" />
		</view>

		<view v-if="order" class="scroll-content">
			<view class="hero-card">
				<view>
					<text class="hero-title">{{ order.patientName }}</text>
					<text class="hero-subtitle">{{ order.patientGender }} / {{ order.patientAge }}{{ texts.ageUnit }} / {{ order.patientRelation }}</text>
				</view>
				<view class="hero-side">
					<text class="hero-price">{{ texts.currency }}{{ order.totalFee }}</text>
					<text class="hero-stage">{{ order.stageLabel }}</text>
				</view>
			</view>

			<view class="section-card">
				<text class="section-title">{{ texts.orderInfo }}</text>
				<view class="info-row"><text class="label">{{ texts.orderNo }}</text><text class="value">{{ order.orderNo }}</text></view>
				<view class="info-row"><text class="label">{{ texts.serviceType }}</text><text class="value">{{ order.serviceType }}</text></view>
				<view class="info-row"><text class="label">{{ texts.hospital }}</text><text class="value">{{ order.hospital }}</text></view>
				<view class="info-row"><text class="label">{{ texts.bookingTime }}</text><text class="value">{{ order.date }} {{ order.time }}</text></view>
				<view class="info-row"><text class="label">{{ texts.phone }}</text><text class="value">{{ order.phone }}</text></view>
				<view class="info-row note"><text class="label">{{ texts.note }}</text><text class="value multiline">{{ order.note }}</text></view>
			</view>

			<view class="section-card">
				<text class="section-title">{{ texts.actions }}</text>
				<view v-if="needPickupProof" class="proof-box">
					<text class="proof-title">{{ texts.proofTitle }}</text>
					<text class="proof-desc">{{ texts.proofDesc }}</text>
					<image v-if="pickupProofPreview" class="proof-preview" :src="pickupProofPreview" mode="aspectFill" @tap="previewProof" />
					<view class="ghost-btn proof-btn" @tap="chooseProofImage">
						{{ pickupProofPreview ? texts.retakeProof : texts.chooseProof }}
					</view>
					<view v-if="canSaveProofOnly" class="primary-btn proof-save-btn" @tap="savePickupProofOnly">
						{{ texts.saveProof }}
					</view>
				</view>
				<view class="action-grid">
					<view class="ghost-btn" @tap="contactUser">{{ texts.contact }}</view>
					<view class="ghost-btn" @tap="startNavigation">{{ texts.navigate }}</view>
				</view>
				<view v-if="canClaim" class="primary-btn wide" @tap="handleClaim">{{ texts.claim }}</view>
				<view
					v-else-if="order.nextServiceStage"
					class="primary-btn wide"
					@tap="handleAdvance"
				>
					{{ getNextStageAction(order) }}
				</view>
				<view v-else class="done-btn wide">{{ texts.done }}</view>
			</view>
		</view>

		<view v-else class="loading-box">
			<text>{{ texts.loading }}</text>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
	claimOrder,
	fetchOrderDetail,
	getNextStageAction,
	HOSPITAL_COORDINATES,
	updateOrderStatus
} from '@/utils/companion-api'

const texts = {
	back: '\u8fd4\u56de',
	pageTitle: '\u8ba2\u5355\u8be6\u60c5',
	ageUnit: '\u5c81',
	currency: '\u00a5',
	orderInfo: '\u8ba2\u5355\u4fe1\u606f',
	orderNo: '\u8ba2\u5355\u7f16\u53f7',
	serviceType: '\u670d\u52a1\u7c7b\u578b',
	hospital: '\u5c31\u8bca\u533b\u9662',
	bookingTime: '\u9884\u7ea6\u65f6\u95f4',
	phone: '\u8054\u7cfb\u7535\u8bdd',
	note: '\u5907\u6ce8',
	actions: '\u5904\u7406\u64cd\u4f5c',
	contact: '\u8054\u7cfb\u7528\u6237',
	navigate: '\u5f00\u59cb\u5bfc\u822a',
	claim: '\u7acb\u5373\u62a2\u5355',
	done: '\u8ba2\u5355\u5df2\u5b8c\u6210',
	proofTitle: '\u63a5\u5230\u7528\u6237\u6838\u9a8c',
	proofDesc: '\u53ef\u9009\u4e0a\u4f20\u4e00\u5f20\u73b0\u573a\u56fe\u7247\uff0c\u7528\u4e8e\u6838\u5bf9\u966a\u8bca\u670d\u52a1\u771f\u5b9e\u6027',
	chooseProof: '\u4e0a\u4f20\u6838\u9a8c\u56fe\u7247',
	retakeProof: '\u91cd\u65b0\u9009\u62e9\u56fe\u7247',
	saveProof: '\u4fdd\u5b58\u6838\u9a8c\u56fe\u7247',
	loading: '\u8ba2\u5355\u52a0\u8f7d\u4e2d...',
	loadFail: '\u8ba2\u5355\u8be6\u60c5\u52a0\u8f7d\u5931\u8d25',
	noPhone: '\u6682\u65e0\u8054\u7cfb\u7535\u8bdd',
	maskPhone: '\u5f53\u524d\u53f7\u7801\u4e3a\u8131\u654f\u5c55\u793a\uff0c\u8bf7\u5148\u8054\u7cfb\u540e\u53f0',
	noNav: '\u6682\u672a\u914d\u7f6e\u8be5\u533b\u9662\u5bfc\u822a\u5750\u6807',
	claimSuccess: '\u62a2\u5355\u6210\u529f',
	claimFail: '\u62a2\u5355\u5931\u8d25',
	updateSuccess: '\u72b6\u6001\u5df2\u66f4\u65b0',
	updateFail: '\u66f4\u65b0\u5931\u8d25',
	uploading: '\u6b63\u5728\u4e0a\u4f20\u56fe\u7247'
}

const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 20
const orderId = ref('')
const order = ref(null)
const pickupProofLocalPath = ref('')

const canClaim = computed(() => {
	return order.value && !order.value.assignedCompanionId && order.value.status === 'in_progress'
})

const needPickupProof = computed(() => {
	return order.value?.nextServiceStage === 'picked_up'
		|| order.value?.serviceStage === 'picked_up'
		|| Boolean(order.value?.pickupProofImage)
		|| Boolean(pickupProofLocalPath.value)
})

const pickupProofPreview = computed(() => {
	return pickupProofLocalPath.value || order.value?.pickupProofImage || ''
})

const canSaveProofOnly = computed(() => {
	return order.value?.serviceStage === 'picked_up' && Boolean(pickupProofLocalPath.value)
})

async function loadDetail() {
	if (!orderId.value) {
		return
	}
	try {
		order.value = await fetchOrderDetail(orderId.value)
		if (!order.value?.pickupProofImage) {
			pickupProofLocalPath.value = ''
		}
	} catch (error) {
		uni.showToast({
			title: error.message || texts.loadFail,
			icon: 'none'
		})
	}
}

function goBack() {
	uni.navigateBack({
		fail: () => {
			uni.reLaunch({ url: '/pages/workbench/index' })
		}
	})
}

function contactUser() {
	if (!order.value?.phone) {
		uni.showToast({ title: texts.noPhone, icon: 'none' })
		return
	}
	if (String(order.value.phone).includes('*')) {
		uni.showToast({ title: texts.maskPhone, icon: 'none' })
		return
	}
	uni.makePhoneCall({
		phoneNumber: order.value.phone
	})
}

function startNavigation() {
	const target = HOSPITAL_COORDINATES[order.value?.hospital]
	if (!target) {
		uni.showToast({
			title: texts.noNav,
			icon: 'none'
		})
		return
	}
	uni.openLocation({
		latitude: target.latitude,
		longitude: target.longitude,
		name: order.value.hospital,
		address: order.value.hospital
	})
}

function chooseProofImage() {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['camera', 'album'],
		success: (res) => {
			const filePath = res?.tempFilePaths?.[0]
			if (filePath) {
				pickupProofLocalPath.value = filePath
			}
		}
	})
}

function previewProof() {
	if (!pickupProofPreview.value) return
	uni.previewImage({
		urls: [pickupProofPreview.value],
		current: pickupProofPreview.value
	})
}

async function handleClaim() {
	try {
		await claimOrder(orderId.value)
		uni.showToast({
			title: texts.claimSuccess,
			icon: 'success'
		})
		loadDetail()
	} catch (error) {
		uni.showToast({
			title: error.message || texts.claimFail,
			icon: 'none'
		})
	}
}

async function handleAdvance() {
	if (!order.value?.nextServiceStage) {
		return
	}
	try {
		let extra = {}
		if (order.value.nextServiceStage === 'picked_up') {
			const proofImage = await ensurePickupProofImage()
			if (proofImage) {
				extra = { pickupProofImage: proofImage }
			}
		}
		await updateOrderStatus(orderId.value, order.value.nextServiceStage, extra)
		uni.showToast({
			title: texts.updateSuccess,
			icon: 'success'
		})
		loadDetail()
	} catch (error) {
		uni.showToast({
			title: error.message || texts.updateFail,
			icon: 'none'
		})
	}
}

async function savePickupProofOnly() {
	if (!pickupProofLocalPath.value) {
		return
	}
	try {
		const proofImage = await ensurePickupProofImage()
		if (!proofImage) return
		await updateOrderStatus(orderId.value, 'picked_up', { pickupProofImage: proofImage })
		uni.showToast({
			title: texts.updateSuccess,
			icon: 'success'
		})
		loadDetail()
	} catch (error) {
		uni.showToast({
			title: error.message || texts.updateFail,
			icon: 'none'
		})
	}
}

async function ensurePickupProofImage() {
	if (order.value?.pickupProofImage && !pickupProofLocalPath.value) {
		return order.value.pickupProofImage
	}
	if (!pickupProofPreview.value) {
		return ''
	}
	if (!pickupProofLocalPath.value) {
		return pickupProofPreview.value
	}

	uni.showLoading({
		title: texts.uploading,
		mask: true
	})
	try {
		const ext = pickupProofLocalPath.value.split('.').pop() || 'jpg'
		const uploadResult = await uniCloud.uploadFile({
			cloudPath: `order-proof/${orderId.value}/${Date.now()}.${ext}`,
			filePath: pickupProofLocalPath.value
		})
		const fileId = uploadResult?.fileID || uploadResult?.tempFileURL || ''
		pickupProofLocalPath.value = ''
		return fileId
	} finally {
		uni.hideLoading()
	}
}

onLoad((options) => {
	orderId.value = options?.id || ''
})

onShow(() => {
	loadDetail()
})
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding: 0 24rpx 24rpx;
}

.page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 22rpx;
}

.back-btn,
.header-gap {
	width: 120rpx;
}

.back-btn {
	height: 72rpx;
	border-radius: 18rpx;
	background: #eef5f2;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 26rpx;
	font-weight: 700;
	color: #2b9a6f;
}

.page-title {
	font-size: 38rpx;
	font-weight: 700;
	color: #213547;
}

.hero-card,
.section-card,
.loading-box {
	background: #fff;
	border-radius: 24rpx;
	box-shadow: 0 16rpx 40rpx rgba(31, 90, 66, 0.06);
}

.hero-card {
	padding: 28rpx;
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
}

.hero-title {
	display: block;
	font-size: 36rpx;
	font-weight: 700;
	color: #213547;
}

.hero-subtitle,
.hero-stage {
	display: block;
	margin-top: 10rpx;
	font-size: 24rpx;
	color: #8391a0;
}

.hero-side {
	text-align: right;
}

.hero-price {
	display: block;
	font-size: 40rpx;
	font-weight: 700;
	color: #2b9a6f;
}

.section-card {
	padding: 28rpx;
	margin-top: 18rpx;
}

.section-title {
	display: block;
	font-size: 30rpx;
	font-weight: 700;
	color: #213547;
	margin-bottom: 10rpx;
}

.info-row {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 18rpx;
	padding: 18rpx 0;
	border-bottom: 1px solid #eef2f1;
}

.info-row.note {
	border-bottom: none;
}

.label {
	flex-shrink: 0;
	font-size: 26rpx;
	color: #7d8b99;
}

.value {
	font-size: 26rpx;
	font-weight: 600;
	color: #213547;
	text-align: right;
}

.multiline {
	line-height: 1.6;
}

.action-grid {
	display: flex;
	gap: 16rpx;
	margin-top: 18rpx;
}

.proof-box {
	margin-top: 18rpx;
	padding: 20rpx;
	border-radius: 18rpx;
	background: #f7faf8;
}

.proof-title {
	display: block;
	font-size: 28rpx;
	font-weight: 700;
	color: #213547;
}

.proof-desc {
	display: block;
	margin-top: 10rpx;
	font-size: 24rpx;
	line-height: 1.5;
	color: #7d8b99;
}

.proof-preview {
	width: 100%;
	height: 240rpx;
	margin-top: 18rpx;
	border-radius: 16rpx;
	background: #eaf1ed;
}

.proof-btn {
	margin-top: 18rpx;
}

.proof-save-btn {
	margin-top: 14rpx;
}

.ghost-btn,
.primary-btn,
.done-btn {
	height: 84rpx;
	border-radius: 18rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: 700;
}

.ghost-btn {
	flex: 1;
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

.wide {
	margin-top: 18rpx;
}

.loading-box {
	padding: 80rpx 28rpx;
	text-align: center;
	font-size: 28rpx;
	color: #7d8b99;
}
</style>
