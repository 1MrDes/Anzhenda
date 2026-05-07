import { getCompanionProfile } from './companion-session'

function callCloudFunction(name, data = {}) {
	return new Promise((resolve, reject) => {
		uniCloud.callFunction({
			name,
			data,
			success: (res) => {
				const result = res?.result || {}
				if (result.success) {
					resolve(result.data)
					return
				}
				reject(new Error(result.message || '\u670d\u52a1\u6682\u65f6\u4e0d\u53ef\u7528'))
			},
			fail: (error) => {
				reject(error)
			}
		})
	})
}

function getCompanionPayload(extra = {}) {
	const profile = getCompanionProfile()
	return {
		companionId: profile.id,
		companionName: profile.name,
		...extra
	}
}

export function fetchDashboard() {
	return callCloudFunction('companionDashboard', getCompanionPayload())
}

export function fetchAvailableOrders() {
	return callCloudFunction('companionListAvailableOrders')
}

export function fetchMyOrders(type = 'active') {
	return callCloudFunction('companionListMyOrders', getCompanionPayload({ type }))
}

export function fetchOrderDetail(orderId) {
	return callCloudFunction('companionGetOrderDetail', getCompanionPayload({ orderId }))
}

export function claimOrder(orderId) {
	return callCloudFunction('companionClaimOrder', getCompanionPayload({ orderId }))
}

export function updateOrderStatus(orderId, serviceStage, extra = {}) {
	return callCloudFunction('companionUpdateOrderStatus', getCompanionPayload({
		orderId,
		serviceStage,
		...extra
	}))
}

export const STAGE_ACTIONS = {
	accepted: '\u5f00\u59cb\u524d\u5f80',
	on_the_way: '\u6807\u8bb0\u5df2\u63a5\u5230\u7528\u6237',
	picked_up: '\u6807\u8bb0\u5df2\u5230\u8fbe\u533b\u9662',
	arrived: '\u5f00\u59cb\u670d\u52a1',
	serving: '\u5b8c\u6210\u8ba2\u5355'
}

export const STAGE_LABELS = {
	waiting_accept: '\u5f85\u63a5\u5355',
	accepted: '\u5df2\u63a5\u5355',
	on_the_way: '\u6b63\u5728\u524d\u5f80',
	picked_up: '\u5df2\u63a5\u5230\u7528\u6237',
	arrived: '\u5df2\u5230\u8fbe\u533b\u9662',
	serving: '\u966a\u8bca\u670d\u52a1\u4e2d',
	completed: '\u5df2\u5b8c\u6210'
}

export const HOSPITAL_COORDINATES = {
	'\u4e0a\u6d77\u5e02\u7b2c\u4e00\u4eba\u6c11\u533b\u9662': { latitude: 31.25372, longitude: 121.48135 },
	'\u534e\u5c71\u533b\u9662': { latitude: 31.21118, longitude: 121.44809 },
	'\u745e\u91d1\u533b\u9662': { latitude: 31.20822, longitude: 121.46956 },
	'\u4e2d\u5c71\u533b\u9662': { latitude: 31.19553, longitude: 121.43647 }
}

export function getNextStageAction(order) {
	if (!order?.nextServiceStage) {
		return ''
	}
	return STAGE_ACTIONS[order.serviceStage] || '\u66f4\u65b0\u72b6\u6001'
}
