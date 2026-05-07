'use strict'

const orderService = require('order-service')

exports.main = async (event = {}) => {
	try {
		const data = await orderService.getCompanionDashboard(event)
		return { success: true, data }
	} catch (error) {
		console.error('companionDashboard failed', error)
		return { success: false, message: error.message || '\u83b7\u53d6\u5de5\u4f5c\u53f0\u6570\u636e\u5931\u8d25' }
	}
}
