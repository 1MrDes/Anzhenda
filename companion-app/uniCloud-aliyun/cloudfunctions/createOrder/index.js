'use strict'

const orderService = require('order-service')

exports.main = async (event = {}) => {
	try {
		const data = await orderService.createOrder(event)
		return {
			success: true,
			data
		}
	} catch (error) {
		console.error('createOrder failed', error)
		return {
			success: false,
			message: error.message || '创建订单失败'
		}
	}
}
