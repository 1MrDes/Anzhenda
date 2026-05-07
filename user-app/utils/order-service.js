import { getAppUserId } from '@/utils/app-user.js'

export const ORDER_STAGE_LABELS = {
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

export const ORDER_STAGE_PROGRESS = [
	'pending_payment',
	'waiting_accept',
	'accepted',
	'on_the_way',
	'picked_up',
	'arrived',
	'serving',
	'completed'
]

function resolveServiceStage(order = {}) {
	if (order.serviceStage) return order.serviceStage
	if (order.status === 'cancelled') return 'cancelled'
	if (order.status === 'completed') return 'completed'
	if (order.paymentStatus !== 'paid') return 'pending_payment'
	if (order.assignedCompanionId) return 'accepted'
	return 'waiting_accept'
}

function resolveDisplayCompanionName(order = {}) {
	return order.assignedCompanionName || order.displayCompanionName || order.companionName || '\u5f85\u5339\u914d\u966a\u8bca\u5458'
}

function normalizeOrder(order) {
	if (!order) return null

	const serviceStage = resolveServiceStage(order)
	return {
		...order,
		id: order.id || order._id,
		serviceStage,
		stageLabel: order.stageLabel || ORDER_STAGE_LABELS[serviceStage] || '\u5904\u7406\u4e2d',
		displayCompanionName: resolveDisplayCompanionName(order),
		totalFee: Number(order.totalFee ?? order.amount ?? 0),
		baseFee: Number(order.baseFee ?? order.amount ?? 0),
		extraFee: Number(order.extraFee ?? 0),
		canPay: order.paymentStatus !== 'paid' && serviceStage === 'pending_payment'
	}
}

async function callOrderFunction(name, data = {}) {
	const response = await uniCloud.callFunction({
		name,
		data: {
			...data,
			userId: data.userId || getAppUserId()
		}
	})
	const result = response?.result || {}
	if (!result.success) {
		throw new Error(result.message || '\u8ba2\u5355\u670d\u52a1\u6682\u65f6\u4e0d\u53ef\u7528')
	}
	return result.data
}

export function getOrderStage(order) {
	return resolveServiceStage(order)
}

export function getOrderStageLabel(order) {
	const stage = resolveServiceStage(order)
	return order?.stageLabel || ORDER_STAGE_LABELS[stage] || '\u5904\u7406\u4e2d'
}

export function getOrderCompanionName(order) {
	return resolveDisplayCompanionName(order)
}

export function getOrderProgressText(order) {
	const stage = resolveServiceStage(order)
	const companionName = resolveDisplayCompanionName(order)

	switch (stage) {
		case 'pending_payment':
			return '\u8bf7\u5148\u5b8c\u6210\u652f\u4ed8'
		case 'waiting_accept':
			return '\u5e73\u53f0\u6b63\u5728\u4e3a\u60a8\u5b89\u6392\u966a\u8bca\u5458'
		case 'accepted':
			return `${companionName}\u5df2\u63a5\u5355`
		case 'on_the_way':
			return `${companionName}\u6b63\u5728\u524d\u5f80`
		case 'picked_up':
			return `${companionName}\u5df2\u63a5\u5230\u60a8\uff0c\u6b63\u524d\u5f80\u533b\u9662`
		case 'arrived':
			return `${companionName}\u5df2\u5230\u8fbe\u533b\u9662`
		case 'serving':
			return `${companionName}\u6b63\u5728\u4e3a\u60a8\u670d\u52a1`
		case 'completed':
			return '\u672c\u6b21\u966a\u8bca\u5df2\u5b8c\u6210'
		default:
			return '\u8ba2\u5355\u6b63\u5728\u5904\u7406\u4e2d'
	}
}

export function getOrderProgressIndex(order) {
	return ORDER_STAGE_PROGRESS.indexOf(resolveServiceStage(order))
}

export async function createOrder(payload) {
	const data = await callOrderFunction('createOrder', payload)
	return normalizeOrder(data)
}

export async function getOrderDetail(orderId) {
	if (!orderId) {
		throw new Error('\u8ba2\u5355\u7f16\u53f7\u4e0d\u80fd\u4e3a\u7a7a')
	}
	const data = await callOrderFunction('getOrderDetail', { orderId })
	return normalizeOrder(data)
}

export async function listOrders(filters = {}) {
	const data = await callOrderFunction('listOrders', filters)
	return Array.isArray(data) ? data.map(normalizeOrder) : []
}

export async function payOrder(orderId, paymentMethod) {
	if (!orderId) {
		throw new Error('\u8ba2\u5355\u7f16\u53f7\u4e0d\u80fd\u4e3a\u7a7a')
	}
	const data = await callOrderFunction('payOrder', {
		orderId,
		paymentMethod
	})
	return normalizeOrder(data)
}

export async function reviewOrder(orderId, payload = {}) {
	if (!orderId) {
		throw new Error('\u8ba2\u5355\u7f16\u53f7\u4e0d\u80fd\u4e3a\u7a7a')
	}
	const data = await callOrderFunction('reviewOrder', {
		orderId,
		rating: payload.rating,
		review: payload.review
	})
	return normalizeOrder(data)
}
