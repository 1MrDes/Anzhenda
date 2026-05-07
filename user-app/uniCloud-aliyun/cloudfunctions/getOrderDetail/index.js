'use strict'

const orderService = require('order-service')

exports.main = async (event = {}) => {
	try {
		const data = await orderService.getOrderDetail(event)
		return {
			success: true,
			data
		}
	} catch (error) {
		console.error('getOrderDetail failed', error)
		return {
			success: false,
			message: error.message || '获取订单详情失败'
		}
	}
}
