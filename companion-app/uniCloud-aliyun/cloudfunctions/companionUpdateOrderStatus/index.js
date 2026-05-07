'use strict'

const orderService = require('order-service')

exports.main = async (event = {}) => {
	try {
		const data = await orderService.updateCompanionOrderStage(event)
		return { success: true, data }
	} catch (error) {
		console.error('companionUpdateOrderStatus failed', error)
		return { success: false, message: error.message || '\u66f4\u65b0\u8ba2\u5355\u72b6\u6001\u5931\u8d25' }
	}
}
