'use strict'

const https = require('https')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { URL } = require('url')

let cachedToken = null

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

function encodeRFC3986(value) {
	return encodeURIComponent(value).replace(/[!'()*]/g, item => `%${item.charCodeAt(0).toString(16).toUpperCase()}`)
}

function loadRawConfig() {
	const candidatePaths = [
		path.join(__dirname, 'config.json'),
		path.join(__dirname, '../uni-config-center/aliyun-speech/config.json')
	]

	for (const filePath of candidatePaths) {
		try {
			if (!fs.existsSync(filePath)) continue
			const fileContent = fs.readFileSync(filePath, 'utf8')
			return JSON.parse(fileContent)
		} catch (error) {
			throw new Error(`读取语音配置失败: ${error.message}`)
		}
	}

	throw new Error('未找到语音配置文件，请检查 aliyun-speech-service/config.json')
}

function getConfig() {
	const config = loadRawConfig()
	const requiredKeys = ['appKey', 'accessKeyId', 'accessKeySecret']
	for (const key of requiredKeys) {
		const value = String(config[key] || '').trim()
		if (!value || value.startsWith('TODO')) {
			throw new Error(`uni-config-center/aliyun-speech/config.json 中的 ${key} 尚未配置`)
		}
	}

	return {
		appKey: String(config.appKey).trim(),
		accessKeyId: String(config.accessKeyId).trim(),
		accessKeySecret: String(config.accessKeySecret).trim(),
		tokenEndpoint: String(config.tokenEndpoint || 'https://nls-meta.cn-shanghai.aliyuncs.com').trim(),
		recognitionWsUrl: String(config.recognitionWsUrl || 'wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1').trim(),
		ttsStreamEndpoint: String(config.ttsStreamEndpoint || config.ttsRestEndpoint || 'https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/tts').trim(),
		ttsVoice: String(config.ttsVoice || 'xiaoyun').trim(),
		ttsFormat: String(config.ttsFormat || 'mp3').trim(),
		ttsSampleRate: Number(config.ttsSampleRate || 16000),
		ttsSpeechRate: Number(config.ttsSpeechRate || 0),
		ttsPitchRate: Number(config.ttsPitchRate || 0),
		ttsVolume: Number(config.ttsVolume || 50),
		pollIntervalMs: Number(config.pollIntervalMs || 450),
		pollMaxAttempts: Number(config.pollMaxAttempts || 14)
	}
}

function buildCreateTokenQuery(config) {
	const params = {
		AccessKeyId: config.accessKeyId,
		Action: 'CreateToken',
		Format: 'JSON',
		RegionId: 'cn-shanghai',
		SignatureMethod: 'HMAC-SHA1',
		SignatureNonce: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}${Math.random().toString(16).slice(2)}`,
		SignatureVersion: '1.0',
		Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
		Version: '2019-02-28'
	}

	const normalized = Object.keys(params)
		.sort()
		.map(key => `${encodeRFC3986(key)}=${encodeRFC3986(params[key])}`)
		.join('&')
	const stringToSign = `GET&${encodeRFC3986('/')}&${encodeRFC3986(normalized)}`
	const signature = crypto
		.createHmac('sha1', `${config.accessKeySecret}&`)
		.update(stringToSign)
		.digest('base64')

	return `Signature=${encodeRFC3986(signature)}&${normalized}`
}

function readResponseBody(response) {
	return new Promise((resolve, reject) => {
		const chunks = []
		response.on('data', chunk => chunks.push(chunk))
		response.on('end', () => resolve(Buffer.concat(chunks)))
		response.on('error', reject)
	})
}

function request({ url, method = 'GET', headers = {}, body, responseType = 'json' }) {
	return new Promise((resolve, reject) => {
		const target = new URL(url)
		const requestOptions = {
			protocol: target.protocol,
			hostname: target.hostname,
			port: target.port || (target.protocol === 'https:' ? 443 : 80),
			path: `${target.pathname}${target.search}`,
			method,
			headers
		}

		const req = https.request(requestOptions, async res => {
			try {
				const bodyBuffer = await readResponseBody(res)
				const text = bodyBuffer.toString()
				if (responseType === 'buffer') {
					resolve({
						statusCode: res.statusCode,
						headers: res.headers,
						data: bodyBuffer
					})
					return
				}

				let data = null
				try {
					data = text ? JSON.parse(text) : null
				} catch (error) {
					data = text
				}
				resolve({
					statusCode: res.statusCode,
					headers: res.headers,
					data
				})
			} catch (error) {
				reject(error)
			}
		})

		req.on('error', reject)
		if (body) {
			req.write(body)
		}
		req.end()
	})
}

async function createToken(config = getConfig()) {
	const now = Date.now()
	if (cachedToken && cachedToken.token && cachedToken.expireAt - now > 60 * 1000) {
		return cachedToken
	}

	const url = `${config.tokenEndpoint}/?${buildCreateTokenQuery(config)}`
	const response = await request({ url, method: 'GET' })
	const tokenInfo = response.data && response.data.Token
	if (!tokenInfo || !tokenInfo.Id || !tokenInfo.ExpireTime) {
		throw new Error(`获取阿里云语音 Token 失败：${JSON.stringify(response.data || {})}`)
	}

	cachedToken = {
		token: tokenInfo.Id,
		expireAt: Number(tokenInfo.ExpireTime) * 1000
	}
	return cachedToken
}

async function getSpeechTokenPayload() {
	const config = getConfig()
	const tokenInfo = await createToken(config)
	return {
		token: tokenInfo.token,
		expireAt: tokenInfo.expireAt,
		appKey: config.appKey,
		wsUrl: config.recognitionWsUrl
	}
}

async function synthesizeSpeechBuffer(text, config, token) {
	const response = await request({
		url: config.ttsStreamEndpoint,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			appkey: config.appKey,
			token,
			text,
			format: config.ttsFormat,
			sample_rate: config.ttsSampleRate,
			voice: config.ttsVoice,
			speech_rate: config.ttsSpeechRate,
			pitch_rate: config.ttsPitchRate,
			volume: config.ttsVolume
		}),
		responseType: 'buffer'
	})

	const contentType = String((response.headers && response.headers['content-type']) || '').toLowerCase()
	if (response.statusCode === 200 && contentType.includes('audio/')) {
		return response.data
	}

	let errorPayload = null
	try {
		errorPayload = JSON.parse(response.data.toString())
	} catch (error) {
		errorPayload = response.data.toString()
	}
	throw new Error(`语音合成失败：${typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload)}`)
}

async function synthesizeSpeechToBase64(text, options = {}) {
	const content = String(text || '').trim()
	if (!content) {
		throw new Error('待播报文本不能为空')
	}

	const config = getConfig()
	const tokenInfo = await createToken(config)
	const audioBuffer = await synthesizeSpeechBuffer(content, config, tokenInfo.token)

	return {
		text: content,
		format: options.format || config.ttsFormat,
		audioBase64: audioBuffer.toString('base64')
	}
}

module.exports = {
	getSpeechTokenPayload,
	synthesizeSpeechToBase64
}
