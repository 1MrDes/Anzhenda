'use strict'

const orderService = require('order-service')

exports.main = async (event = {}) => {
	try {
		const data = await orderService.getCompanionOrderDetail(event)
		return { success: true, data }
	} catch (error) {
		console.error('companionGetOrderDetail failed', error)
		return { success: false, message: error.message || '\u83b7\u53d6\u8ba2\u5355\u8be6\u60c5\u5931\u8d25' }
	}
}
