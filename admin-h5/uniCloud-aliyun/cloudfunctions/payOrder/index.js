'use strict'

const orderService = require('order-service')

exports.main = async (event = {}) => {
	try {
		const data = await orderService.payOrder(event)
		return {
			success: true,
			data
		}
	} catch (error) {
		console.error('payOrder failed', error)
		return {
			success: false,
			message: error.message || '支付订单失败'
		}
	}
}
