'use strict'

const speechService = require('aliyun-speech-service')

exports.main = async (event = {}) => {
	try {
		const text = String(event.text || '').trim()
		if (!text) {
			return {
				success: false,
				message: '播报文本不能为空'
			}
		}

		const data = await speechService.synthesizeSpeechToBase64(text, {
			format: event.format
		})
		return {
			success: true,
			data
		}
	} catch (error) {
		console.error('speechSynthesize failed', error)
		return {
			success: false,
			message: error.message || '语音合成失败'
		}
	}
}
