import { getVoicePlaybackGuard, playBase64Audio, stopVoicePlayback } from './voice-player.js'

const BROADCAST_CACHE_TTL_MS = 5 * 60 * 1000
const MAX_BROADCAST_CACHE_SIZE = 12

const broadcastAudioCache = new Map()
const pendingBroadcastRequests = new Map()

function normalizeText(text) {
	return String(text || '').replace(/\s+/g, ' ').trim()
}

function unwrapCloudResult(result) {
	return result && result.result ? result.result : result
}

function getCachedAudio(text) {
	const cached = broadcastAudioCache.get(text)
	if (!cached) return null
	if (cached.expireAt <= Date.now()) {
		broadcastAudioCache.delete(text)
		return null
	}
	broadcastAudioCache.delete(text)
	broadcastAudioCache.set(text, cached)
	return cached
}

function setCachedAudio(text, data) {
	broadcastAudioCache.delete(text)
	broadcastAudioCache.set(text, {
		format: data.format,
		audioBase64: data.audioBase64,
		expireAt: Date.now() + BROADCAST_CACHE_TTL_MS
	})

	if (broadcastAudioCache.size > MAX_BROADCAST_CACHE_SIZE) {
		const oldestKey = broadcastAudioCache.keys().next().value
		if (oldestKey) {
			broadcastAudioCache.delete(oldestKey)
		}
	}
}

async function fetchBroadcastAudio(text) {
	const cached = getCachedAudio(text)
	if (cached) {
		return cached
	}

	if (pendingBroadcastRequests.has(text)) {
		return pendingBroadcastRequests.get(text)
	}

	const request = uniCloud.callFunction({
		name: 'speechSynthesize',
		data: {
			text
		}
	}).then(response => {
		const result = unwrapCloudResult(response)
		if (!result || !result.success || !result.data || !result.data.audioBase64) {
			throw new Error((result && result.message) || '语音合成失败')
		}
		setCachedAudio(text, result.data)
		return result.data
	}).finally(() => {
		pendingBroadcastRequests.delete(text)
	})

	pendingBroadcastRequests.set(text, request)
	return request
}

export function buildBookingBroadcastText(info = {}) {
	const segments = []
	const dateLabel = normalizeText(info.dateLabel)
	const periodLabel = normalizeText(info.periodLabel)
	const hospital = normalizeText(info.hospital)
	const serviceType = normalizeText(info.serviceType)
	const companionName = normalizeText(info.companionName)

	if (dateLabel && periodLabel) {
		segments.push(`${dateLabel}，${periodLabel}时段`)
	} else if (dateLabel) {
		segments.push(dateLabel)
	} else if (periodLabel) {
		segments.push(`${periodLabel}时段`)
	}

	if (hospital) segments.push(`前往${hospital}`)
	if (serviceType) segments.push(`服务类型为${serviceType}`)
	if (companionName) segments.push(`陪诊员为${companionName}`)

	return segments.length ? `您当前预约的信息为：${segments.join('，')}。` : ''
}

export function buildMatchedOrderBroadcastText(info = {}) {
	const segments = []
	const serviceType = normalizeText(info.serviceType)
	const hospital = normalizeText(info.hospital)
	const dateLabel = normalizeText(info.dateLabel)
	const periodLabel = normalizeText(info.periodLabel)
	const companionName = normalizeText(info.companionName)
	const etaText = normalizeText(info.etaText)
	const nextStepText = normalizeText(info.nextStepText) || '请根据页面提示继续完成下单。'

	if (hospital) segments.push(`预约医院为${hospital}`)
	if (dateLabel && periodLabel) {
		segments.push(`预约时间为${dateLabel}${periodLabel}`)
	} else if (dateLabel) {
		segments.push(`预约时间为${dateLabel}`)
	} else if (periodLabel) {
		segments.push(`预约时段为${periodLabel}`)
	}
	if (serviceType) segments.push(`服务类型为${serviceType}`)
	if (companionName) segments.push(`陪诊员为${companionName}`)
	if (etaText) segments.push(etaText)

	return segments.length
		? `系统已为您匹配成功。${segments.join('，')}。${nextStepText}`
		: `系统已为您匹配成功。${nextStepText}`
}

export async function broadcastText(text, options = {}) {
	const content = normalizeText(text)
	if (!content) {
		throw new Error('暂无可播报内容')
	}

	if (options.interrupt !== false) {
		stopVoicePlayback()
	}
	const requestGuard = getVoicePlaybackGuard()

	if (typeof uni !== 'undefined' && !options.silent) {
		uni.showLoading({
			title: options.loadingText || '语音生成中',
			mask: true
		})
	}

	try {
		const audioData = await fetchBroadcastAudio(content)

		if (requestGuard !== getVoicePlaybackGuard()) {
			return { stopped: true, aborted: true }
		}

		return await playBase64Audio(audioData.audioBase64, {
			format: audioData.format,
			guard: requestGuard
		})
	} finally {
		if (typeof uni !== 'undefined' && !options.silent) {
			uni.hideLoading()
		}
	}
}
