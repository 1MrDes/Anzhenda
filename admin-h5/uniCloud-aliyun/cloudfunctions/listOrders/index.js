'use strict'

const orderService = require('order-service')

exports.main = async (event = {}) => {
	try {
		const data = await orderService.listOrders(event)
		return {
			success: true,
			data
		}
	} catch (error) {
		console.error('listOrders failed', error)
		return {
			success: false,
			message: error.message || '获取订单列表失败'
		}
	}
}
