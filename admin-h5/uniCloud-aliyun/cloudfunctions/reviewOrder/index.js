'use strict'

const orderService = require('order-service')

exports.main = async (event = {}) => {
	try {
		const data = await orderService.reviewOrder(event)
		return {
			success: true,
			data
		}
	} catch (error) {
		console.error('reviewOrder failed', error)
		return {
			success: false,
			message: error.message || '提交评价失败'
		}
	}
}
