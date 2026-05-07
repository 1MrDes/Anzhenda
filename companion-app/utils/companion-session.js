import { reactive } from 'vue'

const STORAGE_KEY = 'az_companion_session'

const DEFAULT_PROFILE = {
	id: 'companion_001',
	name: '\u5f20\u62a4\u58eb',
	avatarText: '\u5f20',
	role: '\u9ad8\u7ea7\u966a\u8bca\u5458',
	verified: true,
	rating: 4.9,
	completedCount: 128,
	todayIncome: 396,
	weeklyCompletedCount: 14,
	status: 'online'
}

export const companionSession = reactive({
	...DEFAULT_PROFILE
})

export const WORK_STATUS_OPTIONS = [
	{ value: 'online', label: '\u5728\u7ebf' },
	{ value: 'busy', label: '\u5fd9\u788c' },
	{ value: 'rest', label: '\u4f11\u606f' }
]

function safeReadStorage() {
	try {
		return uni.getStorageSync(STORAGE_KEY) || {}
	} catch (error) {
		console.warn('read companion session failed', error)
		return {}
	}
}

function persistSession() {
	try {
		uni.setStorageSync(STORAGE_KEY, {
			status: companionSession.status
		})
	} catch (error) {
		console.warn('persist companion session failed', error)
	}
}

export function initCompanionSession() {
	const cached = safeReadStorage()
	companionSession.status = cached.status || DEFAULT_PROFILE.status
}

export function getCompanionProfile() {
	return companionSession
}

export function setCompanionStatus(status) {
	companionSession.status = status
	persistSession()
}

export function getWorkStatusLabel(status) {
	const matched = WORK_STATUS_OPTIONS.find(item => item.value === status)
	return matched ? matched.label : '\u5728\u7ebf'
}
