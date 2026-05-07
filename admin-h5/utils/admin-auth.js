import { reactive } from 'vue'

const STORAGE_KEY = 'anzhendaAdminInfo'

export const adminState = reactive({
	loggedIn: false,
	adminInfo: null
})

export function initAdminAuth() {
	try {
		const saved = uni.getStorageSync(STORAGE_KEY)
		if (saved && saved.token) {
			adminState.loggedIn = true
			adminState.adminInfo = saved
		}
	} catch (error) {
		adminState.loggedIn = false
		adminState.adminInfo = null
	}
}

export function setAdminInfo(info) {
	adminState.loggedIn = true
	adminState.adminInfo = info
	uni.setStorageSync(STORAGE_KEY, info)
}

export function getAdminInfo() {
	return adminState.adminInfo || { name: '管理员', token: '' }
}

export function getAdminToken() {
	return getAdminInfo().token || ''
}

export function logoutAdmin() {
	adminState.loggedIn = false
	adminState.adminInfo = null
	uni.removeStorageSync(STORAGE_KEY)
}
