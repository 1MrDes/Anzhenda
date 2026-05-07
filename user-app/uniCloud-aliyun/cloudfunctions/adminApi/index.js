'use strict'

const ORDER_COLLECTION = 'az_orders'
const COMPANION_COLLECTION = 'az_companions'
const ADMIN_TOKEN = 'azd-admin-demo-token'

const STAGE_LABELS = {
	pending_payment: '待支付',
	waiting_accept: '待接单',
	accepted: '已接单',
	on_the_way: '正在前往',
	picked_up: '已接到用户',
	arrived: '已到达医院',
	serving: '陪诊服务中',
	completed: '已完成',
	cancelled: '已取消'
}

const SEED_COMPANIONS = [
	{ id: '1', name: '张护士', phone: '138****5678', workStatus: '在线', certStatus: '已认证', rating: 4.9, enabled: true },
	{ id: '2', name: '李陪诊', phone: '139****2233', workStatus: '忙碌', certStatus: '已认证', rating: 4.8, enabled: true },
	{ id: '3', name: '王护工', phone: '136****7788', workStatus: '休息', certStatus: '待复核', rating: 4.7, enabled: true },
	{ id: '4', name: '陈护士', phone: '135****9088', workStatus: '在线', certStatus: '已认证', rating: 4.9, enabled: true }
]

function db() {
	return uniCloud.database()
}

function text(value, fallback = '') {
	const result = String(value || '').trim()
	return result || fallback
}

function amount(value, fallback = 0) {
	const result = Number(value)
	return Number.isFinite(result) ? result : fallback
}

function todayStart() {
	const date = new Date()
	date.setHours(0, 0, 0, 0)
	return date.getTime()
}

function getStageLabel(stage) {
	return STAGE_LABELS[stage] || '处理中'
}

function resolveServiceStage(order = {}) {
	if (order.serviceStage) return order.serviceStage
	if (order.status === 'cancelled') return 'cancelled'
	if (order.status === 'completed') return 'completed'
	if (order.paymentStatus !== 'paid') return 'pending_payment'
	if (order.assignedCompanionId) return 'accepted'
	return 'waiting_accept'
}

function resolveStatus(stage) {
	if (stage === 'pending_payment') return 'pending_payment'
	if (stage === 'completed') return 'completed'
	if (stage === 'cancelled') return 'cancelled'
	return 'in_progress'
}

function normalizeOrder(order = {}, index = 0) {
	const serviceStage = resolveServiceStage(order)
	const id = order._id || order.id
	return {
		...order,
		id,
		serviceStage,
		stageLabel: order.stageLabel || getStageLabel(serviceStage),
		status: resolveStatus(serviceStage),
		statusLabel: order.statusLabel || getStageLabel(resolveStatus(serviceStage)),
		totalFee: amount(order.totalFee || order.amount, 0),
		displayCompanionName: order.assignedCompanionName || order.companionName || '待分配',
		sortIndex: index
	}
}

async function getAllOrders() {
	try {
		const result = await db().collection(ORDER_COLLECTION).orderBy('updatedAt', 'desc').limit(500).get()
		return (result.data || []).map(normalizeOrder)
	} catch (error) {
		console.error('getAllOrders failed', error)
		return []
	}
}

async function getCompanionsRaw() {
	try {
		const result = await db().collection(COMPANION_COLLECTION).limit(200).get()
		const list = result.data || []
		if (!list.length) {
			return SEED_COMPANIONS
		}
		const savedList = list.map(item => ({
				...item,
				id: item._id || item.id,
				enabled: item.enabled !== false
			}))
		const overriddenSeedIds = savedList.map(item => item.seedSourceId).filter(Boolean)
		const seedList = SEED_COMPANIONS.filter(item => !overriddenSeedIds.includes(item.id))
		return [...savedList, ...seedList]
	} catch (error) {
		return SEED_COMPANIONS
	}
}

function withCompanionStats(companions, orders) {
	return companions.map(item => {
		const completed = orders.filter(order => order.status === 'completed' && (order.assignedCompanionId === item.id || order.assignedCompanionName === item.name || order.companionName === item.name))
		const active = orders.filter(order => !['completed', 'cancelled', 'pending_payment'].includes(order.status) && (order.assignedCompanionId === item.id || order.assignedCompanionName === item.name || order.companionName === item.name))
		return {
			...item,
			completedCount: completed.length,
			activeOrderCount: active.length
		}
	})
}

function requireAuth(event) {
	if (event.token !== ADMIN_TOKEN) {
		const error = new Error('登录已失效，请重新登录')
		error.code = 'UNAUTHORIZED'
		throw error
	}
}

async function login(event) {
	const username = text(event.username)
	const password = text(event.password)
	if (username !== 'admin' || password !== '123456') {
		throw new Error('账号或密码不正确')
	}
	return {
		name: '系统管理员',
		username,
		role: 'super_admin',
		token: ADMIN_TOKEN,
		loginAt: Date.now()
	}
}

function buildDashboardData(orders, companions) {
	const start = todayStart()
	const todayOrders = orders.filter(order => (order.createdAt || 0) >= start)
	const completedToday = orders.filter(order => order.status === 'completed' && (order.completedAt || order.updatedAt || 0) >= start)
	return {
		todayOrderCount: todayOrders.length,
		waitingAcceptCount: orders.filter(order => order.serviceStage === 'waiting_accept').length,
		inProgressCount: orders.filter(order => order.status === 'in_progress').length,
		completedCount: orders.filter(order => order.status === 'completed').length,
		todayIncome: completedToday.reduce((sum, order) => sum + amount(order.totalFee), 0),
		companionCount: companions.length,
		abnormalOrderCount: orders.filter(order => order.isAbnormal).length,
		recentOrders: orders.slice(0, 8),
		abnormalOrders: orders.filter(order => order.isAbnormal).slice(0, 6)
	}
}

async function dashboard() {
	const orders = await getAllOrders()
	const companions = withCompanionStats(await getCompanionsRaw(), orders)
	return buildDashboardData(orders, companions)
}

async function adminBundle() {
	const orders = await getAllOrders()
	const companions = withCompanionStats(await getCompanionsRaw(), orders)
	return {
		dashboard: buildDashboardData(orders, companions),
		orders,
		companions,
		users: buildUsersData(orders),
		statistics: buildStatisticsData(orders)
	}
}

async function listOrders(event) {
	const filters = event.filters || {}
	const keyword = text(filters.keyword).toLowerCase()
	const orders = await getAllOrders()
	return orders.filter(order => {
		if (filters.status && filters.status !== order.status && filters.status !== order.serviceStage) return false
		if (filters.serviceType && !String(order.serviceType || '').includes(filters.serviceType)) return false
		if (filters.hospital && !String(order.hospital || '').includes(filters.hospital)) return false
		if (filters.companionName && !String(order.displayCompanionName || '').includes(filters.companionName)) return false
		if (filters.date && !String(order.date || '').includes(filters.date)) return false
		if (keyword) {
			const target = `${order.orderNo || ''} ${order.patientName || ''} ${order.userId || ''}`.toLowerCase()
			if (!target.includes(keyword)) return false
		}
		return true
	})
}

async function updateOrderStage(event) {
	const orderId = text(event.orderId)
	const serviceStage = text(event.serviceStage)
	if (!orderId || !serviceStage) throw new Error('订单参数不完整')
	const timestamp = Date.now()
	const updates = {
		serviceStage,
		stageLabel: getStageLabel(serviceStage),
		status: resolveStatus(serviceStage),
		updatedAt: timestamp
	}
	if (serviceStage === 'accepted') updates.acceptedAt = timestamp
	if (serviceStage === 'on_the_way') updates.onTheWayAt = timestamp
	if (serviceStage === 'picked_up') updates.pickedUpAt = timestamp
	if (serviceStage === 'arrived') updates.arrivedAt = timestamp
	if (serviceStage === 'serving') updates.serviceStartedAt = timestamp
	if (serviceStage === 'completed') updates.completedAt = timestamp
	await db().collection(ORDER_COLLECTION).doc(orderId).update(updates)
	return { id: orderId, ...updates }
}

async function assignCompanion(event) {
	const orderId = text(event.orderId)
	const companionId = text(event.companionId)
	const companionName = text(event.companionName)
	if (!orderId || !companionId || !companionName) throw new Error('请选择陪诊员')
	const timestamp = Date.now()
	const orderResult = await db().collection(ORDER_COLLECTION).doc(orderId).get()
	const order = orderResult.data && orderResult.data[0]
	const shouldAccept = order && order.paymentStatus === 'paid' && resolveServiceStage(order) === 'waiting_accept'
	const updates = {
		assignedCompanionId: companionId,
		assignedCompanionName: companionName,
		companionId,
		companionName,
		updatedAt: timestamp
	}
	if (shouldAccept) {
		updates.serviceStage = 'accepted'
		updates.stageLabel = getStageLabel('accepted')
		updates.status = 'in_progress'
		updates.acceptedAt = timestamp
	}
	await db().collection(ORDER_COLLECTION).doc(orderId).update(updates)
	return { id: orderId, ...updates }
}

async function markAbnormal(event) {
	const orderId = text(event.orderId)
	if (!orderId) throw new Error('订单编号不能为空')
	const updates = {
		isAbnormal: Boolean(event.isAbnormal),
		abnormalReason: text(event.abnormalReason),
		updatedAt: Date.now()
	}
	await db().collection(ORDER_COLLECTION).doc(orderId).update(updates)
	return updates
}

async function cancelOrder(event) {
	return updateOrderStage({ orderId: event.orderId, serviceStage: 'cancelled' })
}

async function deleteOrder(event) {
	const orderId = text(event.orderId)
	if (!orderId) throw new Error('订单编号不能为空')
	await db().collection(ORDER_COLLECTION).doc(orderId).remove()
	return { id: orderId, deleted: true }
}

async function listCompanions() {
	const orders = await getAllOrders()
	const companions = await getCompanionsRaw()
	return withCompanionStats(companions, orders)
}

async function saveCompanion(event) {
	const companion = event.companion || {}
	if (!text(companion.name) || !text(companion.phone)) throw new Error('请填写姓名和手机号')
	const isSeedCompanion = SEED_COMPANIONS.some(item => item.id === companion.id)
	const payload = {
		name: text(companion.name),
		phone: text(companion.phone),
		workStatus: text(companion.workStatus, '在线'),
		certStatus: text(companion.certStatus, '已认证'),
		rating: amount(companion.rating, 4.9),
		enabled: companion.enabled !== false,
		updatedAt: Date.now()
	}
	const collection = db().collection(COMPANION_COLLECTION)
	if (companion.id && !isSeedCompanion) {
		await collection.doc(companion.id).update(payload)
		return { id: companion.id, ...payload }
	}
	if (isSeedCompanion) {
		payload.seedSourceId = companion.id
	}
	payload.createdAt = Date.now()
	const result = await collection.add(payload)
	return { id: result.id, ...payload }
}

async function toggleCompanion(event) {
	const companionId = text(event.companionId)
	if (!companionId) throw new Error('陪诊员编号不能为空')
	if (SEED_COMPANIONS.some(item => item.id === companionId)) {
		const seed = SEED_COMPANIONS.find(item => item.id === companionId)
		const payload = {
			...seed,
			seedSourceId: companionId,
			enabled: Boolean(event.enabled),
			updatedAt: Date.now(),
			createdAt: Date.now()
		}
		delete payload.id
		const result = await db().collection(COMPANION_COLLECTION).add(payload)
		return { id: result.id, ...payload }
	}
	await db().collection(COMPANION_COLLECTION).doc(companionId).update({
		enabled: Boolean(event.enabled),
		updatedAt: Date.now()
	})
	return { id: companionId, enabled: Boolean(event.enabled) }
}

function buildUsersData(orders) {
	const map = {}
	orders.forEach(order => {
		const id = `${order.userId || 'demo'}-${order.patientId || order.patientName || 'patient'}`
		if (!map[id]) {
			map[id] = {
				id,
				userName: order.userId || '演示用户',
				phone: order.contactPhone || order.phone || '138****5678',
				patientName: order.patientName || '未命名就诊人',
				patientAge: order.patientAge || 68,
				patientGender: order.patientGender || '女',
				patientRelation: order.patientRelation || '家人',
				healthStatus: order.healthStatus || '需要陪同',
				orderCount: 0
			}
		}
		map[id].orderCount += 1
	})
	return Object.values(map)
}

async function listUsers() {
	const orders = await getAllOrders()
	return buildUsersData(orders)
}

function countBy(list, getter) {
	const map = {}
	list.forEach(item => {
		const key = getter(item) || '未填写'
		map[key] = (map[key] || 0) + 1
	})
	return Object.keys(map).map(name => ({ name, count: map[name] })).sort((a, b) => b.count - a.count)
}

function buildStatisticsData(orders) {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const dailyTrend = []
	for (let i = 6; i >= 0; i -= 1) {
		const day = new Date(today)
		day.setDate(today.getDate() - i)
		const start = day.getTime()
		const end = start + 24 * 60 * 60 * 1000
		const label = `${day.getMonth() + 1}/${day.getDate()}`
		dailyTrend.push({
			date: label,
			count: orders.filter(order => (order.createdAt || 0) >= start && (order.createdAt || 0) < end).length
		})
	}
	const serviceTypes = countBy(orders, order => order.serviceType).slice(0, 6)
	const hospitals = countBy(orders, order => order.hospital).slice(0, 8)
	const companionRanks = countBy(orders.filter(order => order.status === 'completed'), order => order.displayCompanionName).slice(0, 8)
	const totalRevenue = orders
		.filter(order => order.status === 'completed')
		.reduce((sum, order) => sum + amount(order.totalFee), 0)
	return {
		dailyTrend,
		serviceTypes,
		hospitals,
		companionRanks,
		totalRevenue,
		maxDailyCount: Math.max(...dailyTrend.map(item => item.count), 1),
		maxServiceCount: Math.max(...serviceTypes.map(item => item.count), 1)
	}
}

async function statistics() {
	const orders = await getAllOrders()
	return buildStatisticsData(orders)
}

exports.main = async (event = {}) => {
	try {
		const action = text(event.action)
		if (action === 'login') {
			const data = await login(event)
			return { success: true, data }
		}

		requireAuth(event)

		const handlers = {
			adminBundle,
			dashboard,
			listOrders,
			updateOrderStage,
			assignCompanion,
			markAbnormal,
			cancelOrder,
			deleteOrder,
			listCompanions,
			saveCompanion,
			toggleCompanion,
			listUsers,
			statistics
		}
		if (!handlers[action]) {
			throw new Error('不支持的后台操作')
		}
		const data = await handlers[action](event)
		return { success: true, data }
	} catch (error) {
		console.error('adminApi failed', error)
		return {
			success: false,
			code: error.code || 'ADMIN_API_ERROR',
			message: error.message || '后台服务暂时不可用'
		}
	}
}
