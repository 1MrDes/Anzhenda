'use strict'

const orderService = require('order-service')

exports.main = async (event = {}) => {
	try {
		const data = await orderService.claimOrder(event)
		return { success: true, data }
	} catch (error) {
		console.error('companionClaimOrder failed', error)
		return { success: false, message: error.message || '\u62a2\u5355\u5931\u8d25' }
	}
}
