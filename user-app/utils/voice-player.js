let audioContext = null
let currentFilePath = ''
let pendingPlayback = null
let playbackGuard = 0

function ensureAudioContext() {
	if (audioContext || typeof uni === 'undefined' || !uni.createInnerAudioContext) {
		return audioContext
	}
	audioContext = uni.createInnerAudioContext()
	audioContext.autoplay = true
	audioContext.obeyMuteSwitch = false
	return audioContext
}

function cleanupCurrentFile() {
	// #ifdef MP-WEIXIN
	if (!currentFilePath || typeof wx === 'undefined' || !wx.getFileSystemManager) return
	try {
		wx.getFileSystemManager().unlink({
			filePath: currentFilePath,
			fail: () => {}
		})
	} catch (error) {}
	// #endif
	currentFilePath = ''
}

function writeBase64ToLocalFile(base64, format = 'mp3') {
	// #ifdef MP-WEIXIN
	return new Promise((resolve, reject) => {
		try {
			const fs = wx.getFileSystemManager()
			const safeFormat = format || 'mp3'
			const filePath = `${wx.env.USER_DATA_PATH}/anzhenda-voice-${Date.now()}.${safeFormat}`
			fs.writeFile({
				filePath,
				data: base64,
				encoding: 'base64',
				success: () => resolve(filePath),
				fail: reject
			})
		} catch (error) {
			reject(error)
		}
	})
	// #endif

	// #ifndef MP-WEIXIN
	return Promise.reject(new Error('当前平台暂不支持语音播放'))
	// #endif
}

function stopCurrentAudio() {
	if (audioContext) {
		try {
			audioContext.stop()
			audioContext.src = ''
		} catch (error) {}
	}
	if (pendingPlayback && typeof pendingPlayback.resolve === 'function') {
		pendingPlayback.resolve({ stopped: true })
		pendingPlayback = null
	}
	cleanupCurrentFile()
}

export function stopVoicePlayback() {
	playbackGuard += 1
	stopCurrentAudio()
}

export function getVoicePlaybackGuard() {
	return playbackGuard
}

export async function playBase64Audio(base64, options = {}) {
	if (!base64) {
		throw new Error('语音音频为空')
	}

	const requestGuard = typeof options.guard === 'number' ? options.guard : playbackGuard
	if (requestGuard !== playbackGuard) {
		return { stopped: true, aborted: true }
	}

	stopCurrentAudio()

	const player = ensureAudioContext()
	if (!player) {
		throw new Error('当前环境不支持音频播放')
	}

	const filePath = await writeBase64ToLocalFile(base64, options.format)
	if (requestGuard !== playbackGuard) {
		currentFilePath = filePath
		cleanupCurrentFile()
		return { stopped: true, aborted: true }
	}
	currentFilePath = filePath

	return new Promise((resolve, reject) => {
		let settled = false
		const finish = (handler, value) => {
			if (settled) return
			settled = true
			if (typeof player.offEnded === 'function') player.offEnded(handleEnded)
			if (typeof player.offError === 'function') player.offError(handleError)
			pendingPlayback = null
			handler(value)
		}
		const handleEnded = () => {
			cleanupCurrentFile()
			finish(resolve, { filePath, ended: true })
		}
		const handleError = error => {
			cleanupCurrentFile()
			finish(reject, error)
		}

		pendingPlayback = {
			resolve: value => finish(resolve, value)
		}

		if (typeof player.onEnded === 'function') player.onEnded(handleEnded)
		if (typeof player.onError === 'function') player.onError(handleError)

		if (requestGuard !== playbackGuard) {
			cleanupCurrentFile()
			finish(resolve, { stopped: true, aborted: true })
			return
		}

		player.src = filePath
		player.play()
	})
}

export function destroyVoicePlayer() {
	stopVoicePlayback()
	if (audioContext) {
		try {
			audioContext.destroy()
		} catch (error) {}
		audioContext = null
	}
}
