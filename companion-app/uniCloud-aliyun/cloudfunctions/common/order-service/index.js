'use strict'

const ORDER_COLLECTION = 'az_orders'

const STATUS_LABELS = {
	pending_payment: '\u5f85\u652f\u4ed8',
	in_progress: '\u8fdb\u884c\u4e2d',
	completed: '\u5df2\u5b8c\u6210',
	cancelled: '\u5df2\u53d6\u6d88'
}

const SERVICE_STAGE_LABELS = {
	pending_payment: '\u5f85\u652f\u4ed8',
	waiting_accept: '\u5f85\u63a5\u5355',
	accepted: '\u5df2\u63a5\u5355',
	on_the_way: '\u6b63\u5728\u524d\u5f80',
	picked_up: '\u5df2\u63a5\u5230\u60a8',
	arrived: '\u5df2\u5230\u8fbe\u533b\u9662',
	serving: '\u966a\u8bca\u670d\u52a1\u4e2d',
	completed: '\u5df2\u5b8c\u6210',
	cancelled: '\u5df2\u53d6\u6d88'
}

const SERVICE_STAGE_FLOW = ['accepted', 'on_the_way', 'picked_up', 'arrived', 'serving', 'completed']

function getDb() {
	return uniCloud.database()
}

function getCollection() {
	return getDb().collection(ORDER_COLLECTION)
}

function now() {
	return Date.now()
}

function pad(num, length = 2) {
	return String(num).padStart(length, '0')
}

function buildOrderNo(timestamp = Date.now()) {
	const date = new Date(timestamp)
	return `AZD${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}${pad(date.getMilliseconds(), 3)}`
}

function normalizeAmount(value, fallback = 0) {
	const amount = Number(value)
	return Number.isFinite(amount) ? amount : fallback
}

function sanitizeText(value, fallback = '') {
	const text = String(value || '').trim()
	return text || fallback
}

function getStageLabel(stage) {
	return SERVICE_STAGE_LABELS[stage] || '\u5904\u7406\u4e2d'
}

function getStatusLabel(status) {
	return STATUS_LABELS[status] || '\u5904\u7406\u4e2d'
}

function resolveServiceStage(order = {}) {
	if (order.serviceStage) return order.serviceStage
	if (order.status === 'cancelled') return 'cancelled'
	if (order.status === 'completed') return 'completed'
	if (order.paymentStatus !== 'paid') return 'pending_payment'
	if (order.assignedCompanionId) return 'accepted'
	return 'waiting_accept'
}

function resolveStatus(order = {}, serviceStage = resolveServiceStage(order)) {
	if (order.status === 'cancelled' || serviceStage === 'cancelled') return 'cancelled'
	if (serviceStage === 'completed' || order.status === 'completed') return 'completed'
	if (order.paymentStatus !== 'paid' || serviceStage === 'pending_payment') return 'pending_payment'
	return 'in_progress'
}

function getNextServiceStage(currentStage = 'accepted') {
	const currentIndex = SERVICE_STAGE_FLOW.indexOf(currentStage)
	if (currentIndex === -1 || currentIndex === SERVICE_STAGE_FLOW.length - 1) {
		return null
	}
	return SERVICE_STAGE_FLOW[currentIndex + 1]
}

function buildOrderPayload(event = {}) {
	const timestamp = now()
	const baseFee = normalizeAmount(event.baseFee ?? event.amount, 198)
	const extraFee = normalizeAmount(event.extraFee, 0)
	const totalFee = normalizeAmount(event.totalFee, baseFee + extraFee)

	return {
		orderNo: buildOrderNo(timestamp),
		userId: sanitizeText(event.userId),
		patientId: sanitizeText(event.patientId),
		patientName: sanitizeText(event.patientName, '\u672a\u547d\u540d\u5c31\u8bca\u4eba'),
		patientRelation: sanitizeText(event.patientRelation, '\u5bb6\u4eba'),
		patientAge: normalizeAmount(event.patientAge, 68),
		patientGender: sanitizeText(event.patientGender, '\u5973'),
		serviceTypeId: sanitizeText(event.serviceTypeId),
		serviceType: sanitizeText(event.serviceType, '\u6302\u53f7\u966a\u8bca'),
		hospital: sanitizeText(event.hospital, '\u4e0a\u6d77\u5e02\u7b2c\u4e00\u4eba\u6c11\u533b\u9662'),
		date: sanitizeText(event.date),
		time: sanitizeText(event.time),
		contactPhone: sanitizeText(event.contactPhone, '138****5678'),
		note: sanitizeText(event.note, '\u8bf7\u63d0\u524d\u8054\u7cfb\u5bb6\u5c5e\uff0c\u534f\u52a9\u8001\u4eba\u987a\u5229\u5c31\u8bca\u3002'),
		companionId: sanitizeText(event.companionId, '1'),
		companionName: sanitizeText(event.companionName, '\u5f20\u62a4\u58eb'),
		companionRating: normalizeAmount(event.companionRating, 4.9),
		assignedCompanionId: '',
		assignedCompanionName: '',
		baseFee,
		extraFee,
		totalFee,
		paymentMethod: '',
		paymentStatus: 'pending',
		status: 'pending_payment',
		statusLabel: getStatusLabel('pending_payment'),
		serviceStage: 'pending_payment',
		stageLabel: getStageLabel('pending_payment'),
		rating: 0,
		review: '',
		acceptedAt: null,
		onTheWayAt: null,
		pickedUpAt: null,
		arrivedAt: null,
		serviceStartedAt: null,
		completedAt: null,
		pickupProofImage: '',
		pickupProofUploadedAt: null,
		createdAt: timestamp,
		updatedAt: timestamp,
		paidAt: null
	}
}

function validateCreatePayload(payload) {
	if (!payload.userId) {
		throw new Error('\u7f3a\u5c11\u7528\u6237\u4fe1\u606f\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5')
	}
	if (!payload.patientId) {
		throw new Error('\u8bf7\u5148\u9009\u62e9\u5c31\u8bca\u4eba')
	}
	if (!payload.serviceType) {
		throw new Error('\u8bf7\u5148\u9009\u62e9\u670d\u52a1\u7c7b\u578b')
	}
	if (!payload.hospital) {
		throw new Error('\u8bf7\u5148\u9009\u62e9\u533b\u9662')
	}
	if (!payload.date || !payload.time) {
		throw new Error('\u8bf7\u5148\u9009\u62e9\u9884\u7ea6\u65f6\u95f4')
	}
}

async function getOrderById(orderId) {
	const result = await getCollection().doc(orderId).get()
	const data = result?.data || []
	return data[0] || null
}

function ensureOrderOwnership(order, userId) {
	if (!order) {
		throw new Error('\u8ba2\u5355\u4e0d\u5b58\u5728\u6216\u5df2\u88ab\u5220\u9664')
	}
	if (order.userId !== userId) {
		throw new Error('\u65e0\u6743\u64cd\u4f5c\u5f53\u524d\u8ba2\u5355')
	}
}

function ensureCompanionOwnership(order, companionId) {
	if (!order) {
		throw new Error('\u8ba2\u5355\u4e0d\u5b58\u5728\u6216\u5df2\u88ab\u5220\u9664')
	}
	if (order.assignedCompanionId !== companionId) {
		throw new Error('\u5f53\u524d\u8ba2\u5355\u672a\u5206\u914d\u7ed9\u8be5\u966a\u8bca\u5458')
	}
}

function formatDistance(distanceKm) {
	const value = normalizeAmount(distanceKm, 0.8)
	if (value < 1) {
		return `${Math.round(value * 1000)}\u7c73`
	}
	return `${value.toFixed(1)}\u516c\u91cc`
}

function buildCompanionDecorations(order, index = 0) {
	const distanceKm = normalizeAmount(order.distanceKm, 0.7 + (index % 4) * 0.35)
	const serviceStage = resolveServiceStage(order)
	const status = resolveStatus(order, serviceStage)
	const isUrgent = order.serviceTypeId === 'emergency' || order.totalFee >= 298
	return {
		distanceKm,
		distanceText: formatDistance(distanceKm),
		isUrgent,
		phone: order.contactPhone || '138****5678',
		patientAge: order.patientAge || 68,
		patientGender: order.patientGender || '\u5973',
		note: order.note || '\u8bf7\u63d0\u524d\u8054\u7cfb\u5bb6\u5c5e\uff0c\u534f\u52a9\u8001\u4eba\u987a\u5229\u5c31\u8bca\u3002',
		serviceStage,
		stageLabel: getStageLabel(serviceStage),
		status,
		statusLabel: getStatusLabel(status),
		displayCompanionName: order.assignedCompanionName || order.companionName || '\u5f85\u5339\u914d\u966a\u8bca\u5458',
		pickupProofImage: order.pickupProofImage || ''
	}
}

function toClientOrder(order, index = 0) {
	if (!order) return null
	const serviceStage = resolveServiceStage(order)
	return {
		...order,
		id: order._id,
		canPay: order.paymentStatus !== 'paid' && serviceStage === 'pending_payment',
		...buildCompanionDecorations(order, index),
		nextServiceStage: getNextServiceStage(serviceStage)
	}
}

function isAvailableForClaim(order) {
	const serviceStage = resolveServiceStage(order)
	const status = resolveStatus(order, serviceStage)
	return order.paymentStatus === 'paid'
		&& status === 'in_progress'
		&& !order.assignedCompanionId
		&& serviceStage === 'waiting_accept'
}

async function createOrder(event = {}) {
	const payload = buildOrderPayload(event)
	validateCreatePayload(payload)
	const createResult = await getCollection().add(payload)
	return getOrderById(createResult.id)
}

async function listOrders(event = {}) {
	const userId = sanitizeText(event.userId)
	if (!userId) {
		throw new Error('\u7f3a\u5c11\u7528\u6237\u4fe1\u606f\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5')
	}

	const where = { userId }
	if (event.patientId) {
		where.patientId = sanitizeText(event.patientId)
	}
	if (event.status) {
		where.status = sanitizeText(event.status)
	}

	const result = await getCollection()
		.where(where)
		.orderBy('updatedAt', 'desc')
		.get()

	return (result?.data || []).map((item, index) => toClientOrder(item, index))
}

async function getOrderDetail(event = {}) {
	const userId = sanitizeText(event.userId)
	const orderId = sanitizeText(event.orderId)
	if (!userId || !orderId) {
		throw new Error('\u8ba2\u5355\u53c2\u6570\u4e0d\u5b8c\u6574')
	}

	const order = await getOrderById(orderId)
	ensureOrderOwnership(order, userId)
	return toClientOrder(order)
}

async function payOrder(event = {}) {
	const userId = sanitizeText(event.userId)
	const orderId = sanitizeText(event.orderId)
	const paymentMethod = sanitizeText(event.paymentMethod, 'wechat')
	if (!userId || !orderId) {
		throw new Error('\u8ba2\u5355\u53c2\u6570\u4e0d\u5b8c\u6574')
	}

	const order = await getOrderById(orderId)
	ensureOrderOwnership(order, userId)

	if (order.paymentStatus === 'paid') {
		return toClientOrder(order)
	}

	const timestamp = now()
	await getCollection().doc(orderId).update({
		paymentMethod,
		paymentStatus: 'paid',
		status: 'in_progress',
		statusLabel: getStatusLabel('in_progress'),
		serviceStage: 'waiting_accept',
		stageLabel: getStageLabel('waiting_accept'),
		paidAt: timestamp,
		updatedAt: timestamp
	})

	const updatedOrder = await getOrderById(orderId)
	return toClientOrder(updatedOrder)
}

async function reviewOrder(event = {}) {
	const userId = sanitizeText(event.userId)
	const orderId = sanitizeText(event.orderId)
	const rating = normalizeAmount(event.rating, 0)
	const review = sanitizeText(event.review, '\u670d\u52a1\u7ec6\u81f4\u5468\u5230\uff0c\u6574\u4f53\u4f53\u9a8c\u5f88\u597d\u3002')

	if (!userId || !orderId) {
		throw new Error('\u8ba2\u5355\u53c2\u6570\u4e0d\u5b8c\u6574')
	}
	if (!rating) {
		throw new Error('\u8bf7\u5148\u9009\u62e9\u8bc4\u5206')
	}

	const order = await getOrderById(orderId)
	ensureOrderOwnership(order, userId)

	await getCollection().doc(orderId).update({
		rating,
		review,
		updatedAt: now()
	})

	const updatedOrder = await getOrderById(orderId)
	return toClientOrder(updatedOrder)
}

async function listAvailableOrders() {
	const result = await getCollection()
		.where({
			paymentStatus: 'paid',
			status: 'in_progress'
		})
		.orderBy('updatedAt', 'desc')
		.get()

	return (result?.data || [])
		.filter(isAvailableForClaim)
		.map((item, index) => toClientOrder(item, index))
}

async function listCompanionOrders(event = {}) {
	const companionId = sanitizeText(event.companionId)
	const type = sanitizeText(event.type, 'active')

	if (!companionId) {
		throw new Error('\u7f3a\u5c11\u966a\u8bca\u5458\u4fe1\u606f')
	}

	const result = await getCollection()
		.where({
			assignedCompanionId: companionId
		})
		.orderBy('updatedAt', 'desc')
		.get()

	const source = (result?.data || []).map((item, index) => toClientOrder(item, index))

	if (type === 'history') {
		return source.filter(item => ['completed', 'cancelled'].includes(item.status))
	}
	if (type === 'all') {
		return source
	}
	return source.filter(item => !['completed', 'cancelled'].includes(item.status))
}

async function getCompanionOrderDetail(event = {}) {
	const companionId = sanitizeText(event.companionId)
	const orderId = sanitizeText(event.orderId)
	if (!companionId || !orderId) {
		throw new Error('\u8ba2\u5355\u53c2\u6570\u4e0d\u5b8c\u6574')
	}

	const order = await getOrderById(orderId)
	if (!order) {
		throw new Error('\u8ba2\u5355\u4e0d\u5b58\u5728')
	}
	if (order.assignedCompanionId && order.assignedCompanionId !== companionId) {
		throw new Error('\u5f53\u524d\u8ba2\u5355\u672a\u5206\u914d\u7ed9\u8be5\u966a\u8bca\u5458')
	}

	return toClientOrder(order)
}

async function claimOrder(event = {}) {
	const companionId = sanitizeText(event.companionId)
	const companionName = sanitizeText(event.companionName, '\u5f20\u62a4\u58eb')
	const orderId = sanitizeText(event.orderId)

	if (!companionId || !orderId) {
		throw new Error('\u8ba2\u5355\u53c2\u6570\u4e0d\u5b8c\u6574')
	}

	const order = await getOrderById(orderId)
	if (!order) {
		throw new Error('\u8ba2\u5355\u4e0d\u5b58\u5728')
	}
	if (!isAvailableForClaim(order)) {
		throw new Error('\u8be5\u8ba2\u5355\u5df2\u88ab\u5176\u4ed6\u966a\u8bca\u5458\u63a5\u5355')
	}

	const timestamp = now()
	await getCollection().doc(orderId).update({
		assignedCompanionId: companionId,
		assignedCompanionName: companionName,
		companionId,
		companionName,
		status: 'in_progress',
		statusLabel: getStatusLabel('in_progress'),
		serviceStage: 'accepted',
		stageLabel: getStageLabel('accepted'),
		acceptedAt: timestamp,
		updatedAt: timestamp
	})

	const updatedOrder = await getOrderById(orderId)
	return toClientOrder(updatedOrder)
}

async function updateCompanionOrderStage(event = {}) {
	const companionId = sanitizeText(event.companionId)
	const orderId = sanitizeText(event.orderId)
	const serviceStage = sanitizeText(event.serviceStage)

	if (!companionId || !orderId || !serviceStage) {
		throw new Error('\u8ba2\u5355\u53c2\u6570\u4e0d\u5b8c\u6574')
	}
	if (!SERVICE_STAGE_FLOW.includes(serviceStage)) {
		throw new Error('\u4e0d\u652f\u6301\u7684\u8ba2\u5355\u72b6\u6001')
	}

	const order = await getOrderById(orderId)
	ensureCompanionOwnership(order, companionId)

	const currentStage = resolveServiceStage(order)
	const expectedStage = getNextServiceStage(currentStage)
	const isPickupProofOnlyUpdate = currentStage === 'picked_up' && serviceStage === 'picked_up' && sanitizeText(event.pickupProofImage)
	if (!isPickupProofOnlyUpdate && expectedStage !== serviceStage) {
		throw new Error('\u8bf7\u6309\u987a\u5e8f\u66f4\u65b0\u8ba2\u5355\u72b6\u6001')
	}

	const timestamp = now()
	const updates = {
		serviceStage,
		stageLabel: getStageLabel(serviceStage),
		updatedAt: timestamp
	}

	if (serviceStage === 'on_the_way') {
		updates.onTheWayAt = timestamp
	}
	if (serviceStage === 'picked_up') {
		const proofImage = sanitizeText(event.pickupProofImage, order.pickupProofImage || '')
		if (!isPickupProofOnlyUpdate && !order.pickedUpAt) {
			updates.pickedUpAt = timestamp
		}
		if (proofImage) {
			updates.pickupProofImage = proofImage
			updates.pickupProofUploadedAt = timestamp
		}
	}
	if (serviceStage === 'arrived') {
		updates.arrivedAt = timestamp
	}
	if (serviceStage === 'serving') {
		updates.serviceStartedAt = timestamp
	}
	if (serviceStage === 'completed') {
		updates.completedAt = timestamp
		updates.status = 'completed'
		updates.statusLabel = getStatusLabel('completed')
	} else {
		updates.status = 'in_progress'
		updates.statusLabel = getStatusLabel('in_progress')
	}

	await getCollection().doc(orderId).update(updates)
	const updatedOrder = await getOrderById(orderId)
	return toClientOrder(updatedOrder)
}

async function getCompanionDashboard(event = {}) {
	const companionId = sanitizeText(event.companionId)
	if (!companionId) {
		throw new Error('\u7f3a\u5c11\u966a\u8bca\u5458\u4fe1\u606f')
	}

	const availableOrders = await listAvailableOrders()
	const myOrders = await listCompanionOrders({ companionId, type: 'all' })
	const activeOrders = myOrders.filter(item => !['completed', 'cancelled'].includes(item.status))
	const historyOrders = myOrders.filter(item => item.status === 'completed')

	const todayStart = new Date()
	todayStart.setHours(0, 0, 0, 0)
	const weekStart = new Date(todayStart)
	weekStart.setDate(todayStart.getDate() - 6)

	const todayIncome = historyOrders
		.filter(item => item.completedAt && item.completedAt >= todayStart.getTime())
		.reduce((sum, item) => sum + normalizeAmount(item.totalFee, 0), 0)

	const weekCompleted = historyOrders
		.filter(item => item.completedAt && item.completedAt >= weekStart.getTime())
		.length

	return {
		todayPendingCount: activeOrders.length,
		nearbyOrderCount: availableOrders.length,
		activeOrder: activeOrders[0] || null,
		todayIncome,
		weekCompletedCount: weekCompleted
	}
}

module.exports = {
	ORDER_COLLECTION,
	STATUS_LABELS,
	SERVICE_STAGE_LABELS,
	createOrder,
	listOrders,
	getOrderDetail,
	payOrder,
	reviewOrder,
	listAvailableOrders,
	listCompanionOrders,
	getCompanionOrderDetail,
	claimOrder,
	updateCompanionOrderStage,
	getCompanionDashboard
}
