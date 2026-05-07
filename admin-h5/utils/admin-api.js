import { getAdminToken, logoutAdmin } from './admin-auth.js'

export function adminCall(action, payload = {}, needAuth = true) {
	return new Promise((resolve, reject) => {
		uniCloud.callFunction({
			name: 'adminApi',
			data: {
				action,
				token: needAuth ? getAdminToken() : '',
				...payload
			},
			success: (res) => {
				const result = res?.result || {}
				if (result.success) {
					resolve(result.data)
					return
				}
				if (result.code === 'UNAUTHORIZED') {
					logoutAdmin()
				}
				reject(new Error(result.message || '后台服务暂时不可用'))
			},
			fail: (error) => {
				reject(error)
			}
		})
	})
}
