'use strict'

const orderService = require('order-service')

exports.main = async () => {
	try {
		const data = await orderService.listAvailableOrders()
		return { success: true, data }
	} catch (error) {
		console.error('companionListAvailableOrders failed', error)
		return { success: false, message: error.message || '\u83b7\u53d6\u5f85\u63a5\u5355\u5931\u8d25' }
	}
}
