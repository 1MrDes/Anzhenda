import SpeechRecognition from './aliyun-wx-sdk/sr.js'

const DEFAULT_SILENCE_FINISH_DELAY = 1200
const RECOGNIZER_CLOSE_TIMEOUT = 2800
const TOKEN_REFRESH_BUFFER_MS = 60 * 1000

let recorderManager = null
let recorderBound = false
let recorderState = 'idle'
let recorderWaiters = []
let activeSession = null
let cachedSpeechConfig = null
let speechTokenRequest = null

function normalizeMessageText(message) {
	if (!message) return ''
	try {
		const payload = typeof message === 'string' ? JSON.parse(message) : message
		return payload && payload.payload && payload.payload.result ? String(payload.payload.result).trim() : ''
	} catch (error) {
		return ''
	}
}

function normalizeErrorMessage(error) {
	if (!error) return '语音识别失败'
	if (typeof error === 'string') return error
	if (error.message) return error.message
	try {
		const payload = typeof error === 'string' ? JSON.parse(error) : error
		return payload && payload.header && payload.header.status_text
			? payload.header.status_text
			: JSON.stringify(payload)
	} catch (parseError) {
		return '语音识别失败'
	}
}

function isRecorderBusyError(error) {
	const message = normalizeErrorMessage(error)
	return message.includes('audio is recording') || message.includes('录音中')
}

function isRecognizerCloseTimeoutError(error) {
	const message = normalizeErrorMessage(error)
	return message.includes('waited for too long time')
		|| message.includes('StopRecognition')
		|| message.includes('RECOGNIZER_CLOSE_TIMEOUT')
}

function resolveRecorderWaiters() {
	const pending = recorderWaiters.slice()
	recorderWaiters = []
	pending.forEach(resolve => resolve())
}

function waitForRecorderIdle(timeout = 1600) {
	if (recorderState === 'idle') {
		return Promise.resolve()
	}

	return new Promise(resolve => {
		const wrappedResolve = () => {
			clearTimeout(timer)
			recorderWaiters = recorderWaiters.filter(item => item !== wrappedResolve)
			resolve()
		}

		const timer = setTimeout(wrappedResolve, timeout)
		recorderWaiters.push(wrappedResolve)
	})
}

function clearSessionTimers(session) {
	if (!session) return
	if (session.autoStopTimer) {
		clearTimeout(session.autoStopTimer)
		session.autoStopTimer = null
	}
}

function cleanupActiveSession() {
	clearSessionTimers(activeSession)
	activeSession = null
}

async function stopRecorderAndWait() {
	const manager = ensureRecorderManager()
	if (!manager) return
	if (recorderState === 'idle') return

	if (recorderState === 'stopping') {
		await waitForRecorderIdle()
		return
	}

	recorderState = 'stopping'
	try {
		manager.stop()
	} catch (error) {
		recorderState = 'idle'
		resolveRecorderWaiters()
	}
	await waitForRecorderIdle()
}

function requestStopRecording(session) {
	if (!session || session.stopRequested) return
	session.stopRequested = true
	stopRecorderAndWait()
}

function scheduleAutoStop(session, delay = DEFAULT_SILENCE_FINISH_DELAY) {
	if (!session) return
	clearSessionTimers(session)
	session.autoStopTimer = setTimeout(() => {
		requestStopRecording(session)
	}, delay)
}

async function closeRecognizerSession(session) {
	if (!session || !session.recognizer) return null
	if (session.closing) return null

	session.closing = true
	clearSessionTimers(session)

	try {
		if (session.started) {
			await Promise.race([
				session.recognizer.close({}),
				new Promise((_, reject) => {
					setTimeout(() => reject(new Error('RECOGNIZER_CLOSE_TIMEOUT')), RECOGNIZER_CLOSE_TIMEOUT)
				})
			])
		}
	} catch (error) {
		if (session.lastPartialText && isRecognizerCloseTimeoutError(error)) {
			try {
				session.recognizer.shutdown()
			} catch (shutdownError) {}
			return {
				fallbackText: session.lastPartialText
			}
		}
		throw error
	}

	try {
		session.recognizer.shutdown()
	} catch (error) {}

	return null
}

function ensureRecorderManager() {
	// #ifdef MP-WEIXIN
	if (!recorderManager) {
		recorderManager = wx.getRecorderManager()
	}

	if (!recorderBound) {
		if (typeof recorderManager.onStart === 'function') {
			recorderManager.onStart(() => {
				recorderState = 'recording'
			})
		}

		recorderManager.onFrameRecorded(res => {
			if (activeSession && activeSession.started && activeSession.recognizer) {
				activeSession.recognizer.sendAudio(res.frameBuffer)
			}
		})

		recorderManager.onStop(() => {
			recorderState = 'idle'
			resolveRecorderWaiters()

			if (activeSession && activeSession.started && !activeSession.closing) {
				const session = activeSession
				closeRecognizerSession(session)
					.then(result => {
						if (activeSession !== session) return
						if (result && result.fallbackText) {
							session.resolve(result.fallbackText)
						}
					})
					.catch(error => {
						if (activeSession !== session) return
						session.reject(new Error(normalizeErrorMessage(error)))
					})
			}
		})

		recorderManager.onError(error => {
			recorderState = 'idle'
			resolveRecorderWaiters()
			if (!activeSession) return
			const reject = activeSession.reject
			cleanupActiveSession()
			reject(new Error(normalizeErrorMessage(error)))
		})

		recorderBound = true
	}

	return recorderManager
	// #endif

	// #ifndef MP-WEIXIN
	return null
	// #endif
}

async function startRecorder(retryCount = 0) {
	const manager = ensureRecorderManager()
	if (!manager) {
		throw new Error('当前平台暂不支持语音识别')
	}

	if (recorderState !== 'idle') {
		await stopRecorderAndWait()
	}

	recorderState = 'starting'
	try {
		manager.start({
			duration: 60000,
			numberOfChannels: 1,
			sampleRate: 16000,
			format: 'PCM',
			frameSize: 4
		})
	} catch (error) {
		recorderState = 'idle'
		resolveRecorderWaiters()
		if (retryCount < 1 && isRecorderBusyError(error)) {
			await stopRecorderAndWait()
			return startRecorder(retryCount + 1)
		}
		throw error
	}
}

function hasValidSpeechConfig(config) {
	return Boolean(
		config
		&& config.token
		&& Number(config.expireAt || 0) - Date.now() > TOKEN_REFRESH_BUFFER_MS
	)
}

function fetchSpeechToken() {
	if (hasValidSpeechConfig(cachedSpeechConfig)) {
		return Promise.resolve(cachedSpeechConfig)
	}

	if (speechTokenRequest) {
		return speechTokenRequest
	}

	speechTokenRequest = uniCloud.callFunction({
		name: 'getSpeechToken'
	}).then(response => {
		const result = response && response.result ? response.result : response
		if (!result || !result.success || !result.data) {
			throw new Error((result && result.message) || '获取语音 Token 失败')
		}
		cachedSpeechConfig = result.data
		return cachedSpeechConfig
	}).finally(() => {
		speechTokenRequest = null
	})

	return speechTokenRequest
}

function ensureRecordPermission() {
	// #ifdef MP-WEIXIN
	return new Promise((resolve, reject) => {
		uni.authorize({
			scope: 'scope.record',
			success: resolve,
			fail: () => reject(new Error('请先允许小程序使用麦克风'))
		})
	})
	// #endif

	// #ifndef MP-WEIXIN
	return Promise.reject(new Error('当前平台暂不支持语音识别'))
	// #endif
}

export async function recognizeSingleSentence(options = {}) {
	// #ifndef MP-WEIXIN
	throw new Error('当前平台暂不支持语音识别')
	// #endif

	if (activeSession) {
		throw new Error('语音识别正在进行中')
	}

	await ensureRecordPermission()
	await waitForRecorderIdle()

	const speechConfig = await fetchSpeechToken()
	const recognizer = new SpeechRecognition({
		url: speechConfig.wsUrl,
		appkey: speechConfig.appKey,
		token: speechConfig.token
	})

	return new Promise(async (resolve, reject) => {
		const finishSuccess = async text => {
			const session = activeSession
			cleanupActiveSession()
			await closeRecognizerSession(session).catch(() => null)
			await stopRecorderAndWait()
			resolve({
				text: String(text || '').trim()
			})
		}

		const finishFail = async error => {
			const session = activeSession
			cleanupActiveSession()
			await closeRecognizerSession(session).catch(() => null)
			await stopRecorderAndWait()
			reject(error instanceof Error ? error : new Error(normalizeErrorMessage(error)))
		}

		activeSession = {
			recognizer,
			started: false,
			closing: false,
			stopRequested: false,
			autoStopTimer: null,
			lastPartialText: '',
			resolve: finishSuccess,
			reject: finishFail
		}

		recognizer.on('started', () => {
			if (!activeSession) return
			activeSession.started = true
			options.onStateChange && options.onStateChange('recording')
		})

		recognizer.on('changed', msg => {
			const partialText = normalizeMessageText(msg)
			if (!partialText || !activeSession) return

			activeSession.lastPartialText = partialText
			if (options.onPartial) {
				options.onPartial(partialText)
			}

			scheduleAutoStop(activeSession, options.silenceFinishDelay || DEFAULT_SILENCE_FINISH_DELAY)
		})

		recognizer.on('completed', msg => {
			const finalText = normalizeMessageText(msg) || (activeSession && activeSession.lastPartialText) || ''
			finishSuccess(finalText)
		})

		recognizer.on('failed', msg => {
			const error = new Error(normalizeErrorMessage(msg))
			if (activeSession && activeSession.lastPartialText && isRecognizerCloseTimeoutError(error)) {
				finishSuccess(activeSession.lastPartialText)
				return
			}
			finishFail(error)
		})

		try {
			options.onStateChange && options.onStateChange('initializing')
			await recognizer.start(recognizer.defaultStartParams())
			await startRecorder()
		} catch (error) {
			finishFail(error)
		}
	})
}

export async function cancelSpeechRecognition() {
	if (!activeSession) {
		await stopRecorderAndWait()
		return
	}

	const session = activeSession
	cleanupActiveSession()
	await stopRecorderAndWait()
	await closeRecognizerSession(session).catch(() => null)
}
