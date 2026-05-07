const APP_USER_ID_KEY = 'azdAppUserId'

function buildLocalUserId() {
	return `azd-user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getAppUserId() {
	let userId = uni.getStorageSync(APP_USER_ID_KEY)
	if (!userId) {
		userId = buildLocalUserId()
		uni.setStorageSync(APP_USER_ID_KEY, userId)
	}
	return userId
}
