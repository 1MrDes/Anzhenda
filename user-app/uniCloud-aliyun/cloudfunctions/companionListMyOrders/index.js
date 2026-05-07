'use strict'

const orderService = require('order-service')

exports.main = async (event = {}) => {
	try {
		const data = await orderService.listCompanionOrders(event)
		return { success: true, data }
	} catch (error) {
		console.error('companionListMyOrders failed', error)
		return { success: false, message: error.message || '\u83b7\u53d6\u6211\u7684\u8ba2\u5355\u5931\u8d25' }
	}
}
