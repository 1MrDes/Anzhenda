'use strict'

const speechService = require('aliyun-speech-service')

exports.main = async () => {
	try {
		const data = await speechService.getSpeechTokenPayload()
		return {
			success: true,
			data
		}
	} catch (error) {
		console.error('getSpeechToken failed', error)
		return {
			success: false,
			message: error.message || '获取语音 Token 失败'
		}
	}
}
