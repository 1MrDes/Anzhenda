<template>
	<view class="admin-app">
		<view v-if="!isLoggedIn" class="login-page">
			<view class="login-card">
				<view class="brand-mark">安</view>
				<text class="login-title">安诊达管理后台</text>
				<text class="login-desc">查看订单、管理陪诊员和平台运营数据</text>
				<view class="form-field">
					<text>管理员账号</text>
					<input v-model="loginForm.username" class="input" placeholder="请输入账号" />
				</view>
				<view class="form-field">
					<text>登录密码</text>
					<input v-model="loginForm.password" class="input" password placeholder="请输入密码" />
				</view>
				<button class="login-btn" :loading="loading" @tap="handleLogin">登录后台</button>
				<text class="login-tip">演示账号：admin / 123456</text>
			</view>
		</view>

		<view v-else class="admin-shell">
			<view class="sidebar">
				<view class="side-brand">
					<view class="side-logo">安</view>
					<view>
						<text class="brand-title">安诊达</text>
						<text class="brand-sub">管理后台</text>
					</view>
				</view>
				<view class="menu">
					<view
						v-for="item in menus"
						:key="item.key"
						class="menu-item"
						:class="{ active: activeMenu === item.key }"
						@tap="switchMenu(item.key)"
					>
						<text class="menu-icon">{{ item.icon }}</text>
						<text>{{ item.label }}</text>
					</view>
				</view>
				<view class="side-footer">
					<text>version admin-1</text>
					<text @tap="logout">退出登录</text>
				</view>
			</view>

			<view class="main">
				<view class="topbar">
					<view>
						<text class="page-title">{{ currentMenu.label }}</text>
						<text class="page-subtitle">{{ currentMenu.desc }}</text>
					</view>
					<view class="top-actions">
						<text class="admin-name">{{ adminInfo.name }}</text>
						<button class="refresh-btn" @tap="refreshCurrent">刷新数据</button>
					</view>
				</view>

				<scroll-view scroll-y class="content-scroll">
					<view v-if="activeMenu === 'dashboard'" class="content">
						<view class="stat-grid">
							<view v-for="card in dashboardCards" :key="card.label" class="stat-card">
								<text class="stat-label">{{ card.label }}</text>
								<text class="stat-value">{{ card.value }}</text>
								<text class="stat-desc">{{ card.desc }}</text>
							</view>
						</view>

						<view class="two-col">
							<view class="panel">
								<view class="panel-head">
									<text class="panel-title">近期订单</text>
									<text class="link" @tap="switchMenu('orders')">查看全部</text>
								</view>
								<view v-for="order in dashboard.recentOrders" :key="order.id" class="mini-order">
									<view>
										<text class="mini-title">{{ order.patientName }} - {{ order.serviceType }}</text>
										<text class="mini-sub">{{ order.hospital }} / {{ order.date }} {{ order.time }}</text>
									</view>
									<text class="stage-tag" :class="stageTone(order.serviceStage)">{{ order.stageLabel }}</text>
								</view>
								<view v-if="!dashboard.recentOrders.length" class="empty-line">暂无订单</view>
							</view>

							<view class="panel">
								<view class="panel-head">
									<text class="panel-title">异常提醒</text>
									<text class="danger-text">{{ dashboard.abnormalOrderCount }} 条</text>
								</view>
								<view v-for="order in dashboard.abnormalOrders" :key="order.id" class="mini-order warning">
									<view>
										<text class="mini-title">{{ order.orderNo || order.id }}</text>
										<text class="mini-sub">{{ order.abnormalReason || '需要管理员关注' }}</text>
									</view>
									<text class="stage-tag warning">异常</text>
								</view>
								<view v-if="!dashboard.abnormalOrders.length" class="empty-line">暂无异常订单</view>
							</view>
						</view>
					</view>

					<view v-if="activeMenu === 'orders'" class="content">
						<view class="filter-panel">
							<input v-model="orderFilters.keyword" class="filter-input wide" placeholder="搜索订单编号 / 就诊人姓名" />
							<picker :range="statusOptions" range-key="label" @change="onStatusChange">
								<view class="picker-box">{{ selectedStatusLabel }}</view>
							</picker>
							<input v-model="orderFilters.serviceType" class="filter-input" placeholder="服务类型" />
							<input v-model="orderFilters.hospital" class="filter-input" placeholder="医院" />
							<input v-model="orderFilters.companionName" class="filter-input" placeholder="陪诊员" />
							<input v-model="orderFilters.date" class="filter-input" placeholder="日期，如 2026-04-21" />
							<button class="primary-small" @tap="applyLocalData">查询</button>
							<button class="ghost-small" @tap="resetOrderFilters">重置</button>
						</view>

						<view class="table-card">
							<view class="table-head order-table">
								<text>订单编号</text>
								<text>用户 / 就诊人</text>
								<text>服务</text>
								<text>医院</text>
								<text>预约时间</text>
								<text>支付</text>
								<text>阶段</text>
								<text>陪诊员</text>
								<text>金额</text>
								<text>创建时间</text>
								<text>操作</text>
							</view>
							<view v-for="order in orders" :key="order.id" class="table-row order-table">
								<text class="strong">{{ order.orderNo || order.id }}</text>
								<text>{{ order.userId || '演示用户' }} / {{ order.patientName }}</text>
								<text>{{ order.serviceType }}</text>
								<text>{{ order.hospital }}</text>
								<text>{{ order.date }} {{ order.time }}</text>
								<text>{{ paymentLabel(order.paymentStatus) }}</text>
								<text class="stage-tag" :class="stageTone(order.serviceStage)">{{ order.stageLabel }}</text>
								<text>{{ order.assignedCompanionName || order.companionName || '待分配' }}</text>
								<text class="money">¥{{ order.totalFee }}</text>
								<text>{{ formatTime(order.createdAt) }}</text>
								<view class="row-actions">
									<text @tap="openOrderDetail(order)">详情</text>
									<text @tap="openAssign(order)">分配</text>
									<text @tap="openStage(order)">改状态</text>
									<text @tap="markAbnormal(order)">{{ order.isAbnormal ? '取消异常' : '标异常' }}</text>
									<text class="danger-text" @tap="cancelOrder(order)">取消</text>
									<text class="danger-text" @tap="deleteOrder(order)">删除</text>
								</view>
							</view>
							<view v-if="!orders.length" class="empty-table">暂无订单数据</view>
						</view>
					</view>

					<view v-if="activeMenu === 'companions'" class="content">
						<view class="panel-head page-panel-head">
							<text class="panel-title">陪诊员列表</text>
							<button class="primary-small" @tap="openCompanionEditor()">新增陪诊员</button>
						</view>
						<view class="table-card">
							<view class="table-head companion-table">
								<text>姓名</text>
								<text>手机号</text>
								<text>在线状态</text>
								<text>认证状态</text>
								<text>评分</text>
								<text>完成单数</text>
								<text>进行中订单</text>
								<text>状态</text>
								<text>操作</text>
							</view>
							<view v-for="item in companions" :key="item.id" class="table-row companion-table">
								<text class="strong">{{ item.name }}</text>
								<text>{{ item.phone }}</text>
								<text>{{ item.workStatus }}</text>
								<text>{{ item.certStatus }}</text>
								<text>{{ item.rating }}</text>
								<text>{{ item.completedCount }}</text>
								<text>{{ item.activeOrderCount }}</text>
								<text class="stage-tag" :class="item.enabled ? 'success' : 'muted'">{{ item.enabled ? '启用' : '禁用' }}</text>
								<view class="row-actions">
									<text @tap="openCompanionEditor(item)">编辑</text>
									<text @tap="toggleCompanion(item)">{{ item.enabled ? '禁用' : '启用' }}</text>
									<text @tap="showCompanionHistory(item)">接单记录</text>
								</view>
							</view>
						</view>
					</view>

					<view v-if="activeMenu === 'users'" class="content">
						<view class="table-card">
							<view class="table-head user-table">
								<text>用户</text>
								<text>手机号</text>
								<text>就诊人</text>
								<text>年龄</text>
								<text>性别</text>
								<text>关系</text>
								<text>健康状态</text>
								<text>历史订单</text>
							</view>
							<view v-for="item in users" :key="item.id" class="table-row user-table">
								<text class="strong">{{ item.userName }}</text>
								<text>{{ item.phone }}</text>
								<text>{{ item.patientName }}</text>
								<text>{{ item.patientAge }}</text>
								<text>{{ item.patientGender }}</text>
								<text>{{ item.patientRelation }}</text>
								<text>{{ item.healthStatus }}</text>
								<text>{{ item.orderCount }} 单</text>
							</view>
							<view v-if="!users.length" class="empty-table">暂无用户和就诊人数据</view>
						</view>
					</view>

					<view v-if="activeMenu === 'statistics'" class="content">
						<view class="two-col">
							<view class="panel">
								<text class="panel-title">每日订单趋势</text>
								<view class="bar-list">
									<view v-for="item in statistics.dailyTrend" :key="item.date" class="bar-row">
										<text>{{ item.date }}</text>
										<view class="bar-track"><view class="bar-fill" :style="{ width: chartPercent(item.count, statistics.maxDailyCount) }" /></view>
										<text>{{ item.count }}</text>
									</view>
								</view>
							</view>
							<view class="panel">
								<text class="panel-title">服务类型占比</text>
								<view class="bar-list">
									<view v-for="item in statistics.serviceTypes" :key="item.name" class="bar-row">
										<text>{{ item.name }}</text>
										<view class="bar-track"><view class="bar-fill orange" :style="{ width: chartPercent(item.count, statistics.maxServiceCount) }" /></view>
										<text>{{ item.count }}</text>
									</view>
								</view>
							</view>
							<view class="panel">
								<text class="panel-title">医院订单排行</text>
								<view class="rank-row" v-for="item in statistics.hospitals" :key="item.name">
									<text>{{ item.name }}</text>
									<text>{{ item.count }} 单</text>
								</view>
							</view>
							<view class="panel">
								<text class="panel-title">收入统计</text>
								<text class="big-money">¥{{ statistics.totalRevenue }}</text>
								<text class="panel-desc">已完成订单收入合计</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>

		<view v-if="modal.visible" class="modal-mask" @tap="closeModal">
			<view class="modal-card" @tap.stop>
				<view class="modal-head">
					<text class="modal-title">{{ modal.title }}</text>
					<text class="modal-close" @tap="closeModal">×</text>
				</view>

				<view v-if="modal.type === 'orderDetail' && selectedOrder">
					<view class="detail-grid">
						<text>订单编号</text><text>{{ selectedOrder.orderNo || selectedOrder.id }}</text>
						<text>就诊人</text><text>{{ selectedOrder.patientName }}（{{ selectedOrder.patientRelation }}）</text>
						<text>服务类型</text><text>{{ selectedOrder.serviceType }}</text>
						<text>就诊医院</text><text>{{ selectedOrder.hospital }}</text>
						<text>预约时间</text><text>{{ selectedOrder.date }} {{ selectedOrder.time }}</text>
						<text>联系电话</text><text>{{ selectedOrder.contactPhone || selectedOrder.phone || '暂无' }}</text>
						<text>陪诊员</text><text>{{ selectedOrder.assignedCompanionName || selectedOrder.companionName || '待分配' }}</text>
						<text>订单阶段</text><text>{{ selectedOrder.stageLabel }}</text>
						<text>费用</text><text>¥{{ selectedOrder.totalFee }}</text>
						<text>备注</text><text>{{ selectedOrder.note || '暂无备注' }}</text>
					</view>
					<image v-if="selectedOrder.pickupProofImage" class="proof-img" :src="selectedOrder.pickupProofImage" mode="aspectFill" @tap="previewProof(selectedOrder.pickupProofImage)" />
				</view>

				<view v-if="modal.type === 'assign' && selectedOrder">
					<text class="modal-desc">选择一位陪诊员分配给当前订单。</text>
					<view class="option-list">
						<view v-for="item in companions" :key="item.id" class="option-item" @tap="assignCompanion(item)">
							<text>{{ item.name }} / {{ item.phone }}</text>
							<text>{{ item.workStatus }}</text>
						</view>
					</view>
				</view>

				<view v-if="modal.type === 'stage' && selectedOrder">
					<text class="modal-desc">管理员可手动调整订单阶段，用于异常处理和演示兜底。</text>
					<view class="stage-grid">
						<view v-for="stage in stageOptions" :key="stage.value" class="stage-option" @tap="updateOrderStage(stage.value)">
							{{ stage.label }}
						</view>
					</view>
				</view>

				<view v-if="modal.type === 'companionEditor'">
					<view class="editor-grid">
						<text>姓名</text><input v-model="companionForm.name" class="input" />
						<text>手机号</text><input v-model="companionForm.phone" class="input" />
						<text>在线状态</text><input v-model="companionForm.workStatus" class="input" />
						<text>认证状态</text><input v-model="companionForm.certStatus" class="input" />
						<text>评分</text><input v-model="companionForm.rating" class="input" type="number" />
					</view>
					<button class="login-btn modal-save" @tap="saveCompanion">保存陪诊员</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { adminState, getAdminInfo, initAdminAuth, logoutAdmin, setAdminInfo } from '@/utils/admin-auth.js'
import { adminCall } from '@/utils/admin-api.js'
import { formatTime } from '@/utils/format.js'

export default {
	data() {
		return {
			loading: false,
			activeMenu: 'dashboard',
			adminDataLoaded: false,
			lastBundleAt: 0,
			allOrders: [],
			allCompanions: [],
			loginForm: {
				username: 'admin',
				password: '123456'
			},
			menus: [
				{ key: 'dashboard', label: '数据看板', icon: '⌂', desc: '查看平台今日运营情况' },
				{ key: 'orders', label: '订单管理', icon: '▦', desc: '查看、筛选和处理全部订单' },
				{ key: 'companions', label: '陪诊员管理', icon: '●', desc: '管理陪诊员资料和接单状态' },
				{ key: 'users', label: '用户管理', icon: '◇', desc: '查看用户和就诊人信息' },
				{ key: 'statistics', label: '数据统计', icon: '▰', desc: '查看订单趋势和收入统计' }
			],
			dashboard: {
				todayOrderCount: 0,
				waitingAcceptCount: 0,
				inProgressCount: 0,
				completedCount: 0,
				todayIncome: 0,
				companionCount: 0,
				abnormalOrderCount: 0,
				recentOrders: [],
				abnormalOrders: []
			},
			orders: [],
			companions: [],
			users: [],
			statistics: {
				dailyTrend: [],
				serviceTypes: [],
				hospitals: [],
				totalRevenue: 0,
				maxDailyCount: 1,
				maxServiceCount: 1
			},
			orderFilters: {
				keyword: '',
				status: '',
				serviceType: '',
				hospital: '',
				companionName: '',
				date: ''
			},
			statusOptions: [
				{ label: '全部状态', value: '' },
				{ label: '待支付', value: 'pending_payment' },
				{ label: '待接单', value: 'waiting_accept' },
				{ label: '进行中', value: 'in_progress' },
				{ label: '已完成', value: 'completed' },
				{ label: '已取消', value: 'cancelled' }
			],
			stageOptions: [
				{ label: '待支付', value: 'pending_payment' },
				{ label: '待接单', value: 'waiting_accept' },
				{ label: '已接单', value: 'accepted' },
				{ label: '正在前往', value: 'on_the_way' },
				{ label: '已接到用户', value: 'picked_up' },
				{ label: '已到达医院', value: 'arrived' },
				{ label: '服务中', value: 'serving' },
				{ label: '已完成', value: 'completed' },
				{ label: '已取消', value: 'cancelled' }
			],
			modal: {
				visible: false,
				type: '',
				title: ''
			},
			selectedOrder: null,
			companionForm: {
				id: '',
				name: '',
				phone: '',
				workStatus: '在线',
				certStatus: '已认证',
				rating: 4.9
			}
		}
	},
	computed: {
		isLoggedIn() {
			return adminState.loggedIn
		},
		adminInfo() {
			return getAdminInfo()
		},
		currentMenu() {
			return this.menus.find(item => item.key === this.activeMenu) || this.menus[0]
		},
		dashboardCards() {
			return [
				{ label: '今日订单数', value: this.dashboard.todayOrderCount, desc: '今天新创建订单' },
				{ label: '待接单订单数', value: this.dashboard.waitingAcceptCount, desc: '等待陪诊员接单' },
				{ label: '进行中订单数', value: this.dashboard.inProgressCount, desc: '正在服务流程中' },
				{ label: '已完成订单数', value: this.dashboard.completedCount, desc: '累计完成订单' },
				{ label: '今日收入', value: `¥${this.dashboard.todayIncome}`, desc: '今日完成订单收入' },
				{ label: '陪诊员数量', value: this.dashboard.companionCount, desc: '平台注册陪诊员' },
				{ label: '异常订单数量', value: this.dashboard.abnormalOrderCount, desc: '需要人工关注' }
			]
		},
		selectedStatusLabel() {
			return this.statusOptions.find(item => item.value === this.orderFilters.status)?.label || '全部状态'
		}
	},
	onLoad() {
		initAdminAuth()
		if (this.isLoggedIn) {
			this.refreshCurrent()
		}
	},
	methods: {
		formatTime,
		async handleLogin() {
			if (!this.loginForm.username || !this.loginForm.password) {
				uni.showToast({ title: '请输入账号和密码', icon: 'none' })
				return
			}
			this.loading = true
			try {
				const admin = await adminCall('login', this.loginForm, false)
				setAdminInfo(admin)
				uni.showToast({ title: '登录成功', icon: 'success' })
				this.refreshCurrent()
			} catch (error) {
				uni.showToast({ title: error.message || '登录失败', icon: 'none' })
			} finally {
				this.loading = false
			}
		},
		logout() {
			logoutAdmin()
		},
		switchMenu(key) {
			this.activeMenu = key
			if (!this.adminDataLoaded) {
				this.loadAdminBundle()
				return
			}
			this.applyLocalData()
		},
		refreshCurrent() {
			this.loadAdminBundle(true)
		},
		async loadAdminBundle(force = false) {
			if (this.adminDataLoaded && !force) {
				this.applyLocalData()
				return
			}
			this.loading = true
			try {
				const bundle = await adminCall('adminBundle')
				this.allOrders = bundle.orders || []
				this.allCompanions = bundle.companions || []
				this.dashboard = bundle.dashboard || this.buildDashboard(this.allOrders, this.allCompanions)
				this.users = bundle.users || this.buildUsers(this.allOrders)
				this.statistics = bundle.statistics || this.buildStatistics(this.allOrders)
				this.companions = this.allCompanions
				this.orders = this.filterOrders(this.allOrders)
				this.adminDataLoaded = true
				this.lastBundleAt = Date.now()
			} catch (error) {
				uni.showToast({ title: error.message || '后台数据加载失败', icon: 'none' })
			} finally {
				this.loading = false
			}
		},
		loadDashboard() {
			this.dashboard = this.buildDashboard(this.allOrders, this.allCompanions)
		},
		loadOrders() {
			this.orders = this.filterOrders(this.allOrders)
		},
		loadCompanions() {
			this.companions = this.allCompanions
		},
		loadUsers() {
			this.users = this.buildUsers(this.allOrders)
		},
		loadStatistics() {
			this.statistics = this.buildStatistics(this.allOrders)
		},
		applyLocalData() {
			this.loadDashboard()
			this.loadOrders()
			this.loadCompanions()
			this.loadUsers()
			this.loadStatistics()
		},
		buildDashboard(orders = [], companions = []) {
			const start = new Date()
			start.setHours(0, 0, 0, 0)
			const todayStart = start.getTime()
			const todayOrders = orders.filter(order => (order.createdAt || 0) >= todayStart)
			const completedToday = orders.filter(order => order.status === 'completed' && (order.completedAt || order.updatedAt || 0) >= todayStart)
			return {
				todayOrderCount: todayOrders.length,
				waitingAcceptCount: orders.filter(order => order.serviceStage === 'waiting_accept').length,
				inProgressCount: orders.filter(order => order.status === 'in_progress').length,
				completedCount: orders.filter(order => order.status === 'completed').length,
				todayIncome: completedToday.reduce((sum, order) => sum + Number(order.totalFee || 0), 0),
				companionCount: companions.length,
				abnormalOrderCount: orders.filter(order => order.isAbnormal).length,
				recentOrders: orders.slice(0, 8),
				abnormalOrders: orders.filter(order => order.isAbnormal).slice(0, 6)
			}
		},
		filterOrders(source = []) {
			const filters = this.orderFilters
			const keyword = String(filters.keyword || '').trim().toLowerCase()
			return source.filter(order => {
				if (filters.status && filters.status !== order.status && filters.status !== order.serviceStage) return false
				if (filters.serviceType && !String(order.serviceType || '').includes(filters.serviceType)) return false
				if (filters.hospital && !String(order.hospital || '').includes(filters.hospital)) return false
				if (filters.companionName && !String(order.displayCompanionName || order.assignedCompanionName || order.companionName || '').includes(filters.companionName)) return false
				if (filters.date && !String(order.date || '').includes(filters.date)) return false
				if (keyword) {
					const target = `${order.orderNo || ''} ${order.patientName || ''} ${order.userId || ''}`.toLowerCase()
					if (!target.includes(keyword)) return false
				}
				return true
			})
		},
		buildUsers(orders = []) {
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
		},
		countBy(list, getter) {
			const map = {}
			list.forEach(item => {
				const key = getter(item) || '未填写'
				map[key] = (map[key] || 0) + 1
			})
			return Object.keys(map)
				.map(name => ({ name, count: map[name] }))
				.sort((a, b) => b.count - a.count)
		},
		buildStatistics(orders = []) {
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			const dailyTrend = []
			for (let i = 6; i >= 0; i -= 1) {
				const day = new Date(today)
				day.setDate(today.getDate() - i)
				const start = day.getTime()
				const end = start + 24 * 60 * 60 * 1000
				dailyTrend.push({
					date: `${day.getMonth() + 1}/${day.getDate()}`,
					count: orders.filter(order => (order.createdAt || 0) >= start && (order.createdAt || 0) < end).length
				})
			}
			const serviceTypes = this.countBy(orders, order => order.serviceType).slice(0, 6)
			const hospitals = this.countBy(orders, order => order.hospital).slice(0, 8)
			const totalRevenue = orders
				.filter(order => order.status === 'completed')
				.reduce((sum, order) => sum + Number(order.totalFee || 0), 0)
			return {
				dailyTrend,
				serviceTypes,
				hospitals,
				totalRevenue,
				maxDailyCount: Math.max(...dailyTrend.map(item => item.count), 1),
				maxServiceCount: Math.max(...serviceTypes.map(item => item.count), 1)
			}
		},
		patchLocalOrder(orderId, updates = {}) {
			const index = this.allOrders.findIndex(order => order.id === orderId)
			if (index === -1) return
			const nextOrder = {
				...this.allOrders[index],
				...updates,
				id: orderId,
				displayCompanionName: updates.assignedCompanionName
					|| this.allOrders[index].displayCompanionName
					|| this.allOrders[index].assignedCompanionName
					|| this.allOrders[index].companionName
					|| '待分配'
			}
			this.allOrders.splice(index, 1, nextOrder)
			this.applyLocalData()
		},
		removeLocalOrder(orderId) {
			this.allOrders = this.allOrders.filter(order => order.id !== orderId)
			this.applyLocalData()
		},
		patchLocalCompanion(companion = {}) {
			if (!companion.id) return
			const index = this.allCompanions.findIndex(item =>
				item.id === companion.id
				|| item.id === companion.seedSourceId
				|| item.seedSourceId === companion.seedSourceId
			)
			const nextCompanion = {
				...companion,
				completedCount: companion.completedCount || 0,
				activeOrderCount: companion.activeOrderCount || 0
			}
			if (index === -1) {
				this.allCompanions.unshift(nextCompanion)
			} else {
				this.allCompanions.splice(index, 1, {
					...this.allCompanions[index],
					...nextCompanion
				})
			}
			this.applyLocalData()
		},
		onStatusChange(event) {
			const item = this.statusOptions[Number(event.detail.value)]
			this.orderFilters.status = item?.value || ''
		},
		resetOrderFilters() {
			this.orderFilters = {
				keyword: '',
				status: '',
				serviceType: '',
				hospital: '',
				companionName: '',
				date: ''
			}
			this.loadOrders()
		},
		paymentLabel(value) {
			return value === 'paid' ? '已支付' : '待支付'
		},
		stageTone(stage) {
			if (stage === 'completed') return 'success'
			if (stage === 'cancelled') return 'muted'
			if (stage === 'pending_payment' || stage === 'waiting_accept') return 'warning'
			return 'active'
		},
		openOrderDetail(order) {
			this.selectedOrder = order
			this.modal = { visible: true, type: 'orderDetail', title: '订单详情' }
		},
		openAssign(order) {
			this.selectedOrder = order
			this.modal = { visible: true, type: 'assign', title: '手动分配陪诊员' }
			if (!this.companions.length) this.loadCompanions()
		},
		openStage(order) {
			this.selectedOrder = order
			this.modal = { visible: true, type: 'stage', title: '修改订单状态' }
		},
		async assignCompanion(companion) {
			const updated = await adminCall('assignCompanion', {
				orderId: this.selectedOrder.id,
				companionId: companion.id,
				companionName: companion.name
			})
			uni.showToast({ title: '已分配陪诊员', icon: 'success' })
			this.patchLocalOrder(this.selectedOrder.id, updated)
			this.closeModal()
		},
		async updateOrderStage(serviceStage) {
			const updated = await adminCall('updateOrderStage', {
				orderId: this.selectedOrder.id,
				serviceStage
			})
			uni.showToast({ title: '订单状态已更新', icon: 'success' })
			this.patchLocalOrder(this.selectedOrder.id, updated)
			this.closeModal()
		},
		async markAbnormal(order) {
			const updated = await adminCall('markAbnormal', {
				orderId: order.id,
				isAbnormal: !order.isAbnormal,
				abnormalReason: order.isAbnormal ? '' : '管理员标记为异常订单'
			})
			uni.showToast({ title: order.isAbnormal ? '已取消异常' : '已标记异常', icon: 'success' })
			this.patchLocalOrder(order.id, updated)
		},
		cancelOrder(order) {
			uni.showModal({
				title: '确认取消订单',
				content: `确定取消订单 ${order.orderNo || order.id} 吗？`,
				success: async (res) => {
					if (!res.confirm) return
					const updated = await adminCall('cancelOrder', { orderId: order.id })
					uni.showToast({ title: '订单已取消', icon: 'success' })
					this.patchLocalOrder(order.id, updated)
				}
			})
		},
		deleteOrder(order) {
			uni.showModal({
				title: '确认删除订单',
				content: `删除后用户端和后台都将看不到该订单。确定删除 ${order.orderNo || order.id} 吗？`,
				confirmText: '删除',
				confirmColor: '#E85D4A',
				success: async (res) => {
					if (!res.confirm) return
					await adminCall('deleteOrder', { orderId: order.id })
					uni.showToast({ title: '订单已删除', icon: 'success' })
					this.removeLocalOrder(order.id)
				}
			})
		},
		openCompanionEditor(item) {
			this.companionForm = item
				? { ...item }
				: { id: '', name: '', phone: '', workStatus: '在线', certStatus: '已认证', rating: 4.9 }
			this.modal = { visible: true, type: 'companionEditor', title: item ? '编辑陪诊员' : '新增陪诊员' }
		},
		async saveCompanion() {
			if (!this.companionForm.name || !this.companionForm.phone) {
				uni.showToast({ title: '请填写姓名和手机号', icon: 'none' })
				return
			}
			const saved = await adminCall('saveCompanion', { companion: this.companionForm })
			uni.showToast({ title: '陪诊员已保存', icon: 'success' })
			this.patchLocalCompanion(saved)
			this.closeModal()
		},
		async toggleCompanion(item) {
			const updated = await adminCall('toggleCompanion', { companionId: item.id, enabled: !item.enabled })
			uni.showToast({ title: item.enabled ? '已禁用' : '已启用', icon: 'success' })
			this.patchLocalCompanion({ ...item, ...updated })
		},
		showCompanionHistory(item) {
			this.activeMenu = 'orders'
			this.orderFilters.companionName = item.name
			this.applyLocalData()
		},
		closeModal() {
			this.modal = { visible: false, type: '', title: '' }
			this.selectedOrder = null
		},
		previewProof(url) {
			uni.previewImage({ urls: [url], current: url })
		},
		chartPercent(value, max) {
			const safeMax = Math.max(Number(max) || 1, 1)
			return `${Math.max(8, Math.round((Number(value) || 0) / safeMax * 100))}%`
		}
	}
}
</script>

<style scoped>
.admin-app { min-height: 100vh; background: #FAFAF8; color: #213547; font-family: Arial, "Microsoft YaHei", sans-serif; }
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #E8F5EE 0%, #FAFAF8 60%, #FFFFFF 100%); }
.login-card { width: 420px; padding: 38px; border-radius: 22px; background: #FFFFFF; box-shadow: 0 20px 60px rgba(31, 90, 66, .12); display: flex; flex-direction: column; align-items: stretch; }
.brand-mark, .side-logo { width: 52px; height: 52px; border-radius: 16px; background: #2B9A6F; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; }
.login-title { margin-top: 18px; font-size: 28px; font-weight: 800; color: #213547; }
.login-desc { margin: 8px 0 24px; font-size: 15px; color: #7D8B99; }
.form-field { margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: #60707D; }
.input, .filter-input { height: 42px; padding: 0 14px; border-radius: 12px; border: 1px solid #DDE7E2; background: #FFFFFF; font-size: 14px; color: #213547; box-sizing: border-box; }
.login-btn { height: 46px; border-radius: 12px; background: #2B9A6F; color: #FFFFFF; font-size: 16px; font-weight: 800; border: 0; }
.login-tip { margin-top: 12px; text-align: center; font-size: 13px; color: #9CA3AF; }
.admin-shell { min-height: 100vh; display: flex; }
.sidebar { width: 248px; background: #FFFFFF; border-right: 1px solid #E8EFEA; padding: 24px 16px; box-sizing: border-box; display: flex; flex-direction: column; }
.side-brand { display: flex; align-items: center; gap: 12px; padding: 0 8px 26px; }
.side-logo { width: 44px; height: 44px; border-radius: 14px; font-size: 20px; }
.brand-title, .brand-sub { display: block; }
.brand-title { font-size: 20px; font-weight: 800; }
.brand-sub { margin-top: 4px; font-size: 12px; color: #8A98A5; }
.menu { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.menu-item { height: 46px; padding: 0 14px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 700; color: #60707D; cursor: pointer; }
.menu-item.active { background: #E8F5EE; color: #2B9A6F; }
.menu-icon { width: 20px; text-align: center; }
.side-footer { padding: 14px 8px 0; border-top: 1px solid #EDF2EF; display: flex; justify-content: space-between; font-size: 12px; color: #8A98A5; }
.main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.topbar { height: 86px; padding: 0 28px; background: rgba(250,250,248,.92); border-bottom: 1px solid #E8EFEA; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; }
.page-title { display: block; font-size: 26px; font-weight: 800; }
.page-subtitle { display: block; margin-top: 6px; font-size: 14px; color: #7D8B99; }
.top-actions { display: flex; align-items: center; gap: 12px; }
.admin-name { font-size: 14px; color: #60707D; }
.refresh-btn, .primary-small, .ghost-small { height: 36px; padding: 0 16px; border-radius: 10px; font-size: 14px; font-weight: 800; border: 0; }
.refresh-btn, .ghost-small { background: #FFFFFF; color: #2B9A6F; border: 1px solid #DDE7E2; }
.primary-small { background: #2B9A6F; color: #FFFFFF; }
.content-scroll { flex: 1; height: calc(100vh - 86px); }
.content { padding: 24px 28px 36px; }
.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.stat-card, .panel, .table-card, .filter-panel { background: #FFFFFF; border-radius: 18px; box-shadow: 0 6px 22px rgba(31, 90, 66, .06); border: 1px solid rgba(43,154,111,.06); }
.stat-card { padding: 18px; display: flex; flex-direction: column; gap: 8px; }
.stat-label { font-size: 14px; color: #7D8B99; }
.stat-value { font-size: 30px; font-weight: 800; color: #2B9A6F; }
.stat-desc { font-size: 13px; color: #9CA3AF; }
.two-col { margin-top: 18px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.panel { padding: 20px; min-height: 180px; }
.panel-head, .page-panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.panel-title { font-size: 18px; font-weight: 800; color: #213547; }
.panel-desc { display: block; margin-top: 8px; color: #7D8B99; font-size: 14px; }
.link { color: #2B9A6F; font-size: 14px; cursor: pointer; }
.mini-order { padding: 12px 0; border-top: 1px solid #EEF2F0; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.mini-title, .mini-sub { display: block; }
.mini-title { font-size: 15px; font-weight: 800; }
.mini-sub { margin-top: 5px; color: #7D8B99; font-size: 13px; }
.warning { color: #D88422; }
.danger-text { color: #E85D4A !important; }
.empty-line, .empty-table { padding: 28px 0; text-align: center; color: #9CA3AF; }
.filter-panel { margin-bottom: 16px; padding: 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.filter-input { width: 150px; }
.filter-input.wide { width: 240px; }
.picker-box { height: 42px; min-width: 126px; padding: 0 12px; border-radius: 12px; border: 1px solid #DDE7E2; display: flex; align-items: center; color: #60707D; background: #FFFFFF; box-sizing: border-box; }
.table-card { overflow-x: auto; }
.table-head, .table-row { display: grid; align-items: center; min-width: 1180px; }
.table-head { min-height: 46px; padding: 0 16px; background: #F3F7F5; color: #60707D; font-size: 13px; font-weight: 800; }
.table-row { min-height: 58px; padding: 10px 16px; border-top: 1px solid #EEF2F0; font-size: 13px; color: #33495A; }
.order-table { grid-template-columns: 1.35fr 1.2fr 1fr 1.45fr 1.2fr .65fr .8fr 1fr .6fr 1fr 1.45fr; gap: 12px; }
.companion-table { grid-template-columns: 1fr 1.1fr .8fr .8fr .6fr .8fr .9fr .7fr 1.35fr; gap: 12px; min-width: 920px; }
.user-table { grid-template-columns: 1fr 1fr 1fr .5fr .5fr .8fr 1fr .8fr; gap: 12px; min-width: 880px; }
.strong { font-weight: 800; color: #213547; }
.money { font-weight: 800; color: #2B9A6F; }
.stage-tag { display: inline-flex; width: fit-content; padding: 4px 9px; border-radius: 999px; font-size: 12px; font-weight: 800; }
.stage-tag.success { color: #2B9A6F; background: #E8F5EE; }
.stage-tag.active { color: #4A90D9; background: #EBF3FC; }
.stage-tag.warning { color: #D88422; background: #FFF5E0; }
.stage-tag.muted { color: #8A98A5; background: #F3F0EB; }
.row-actions { display: flex; flex-wrap: wrap; gap: 8px; color: #2B9A6F; font-weight: 800; cursor: pointer; }
.bar-list { margin-top: 16px; display: flex; flex-direction: column; gap: 12px; }
.bar-row { display: grid; grid-template-columns: 100px 1fr 40px; align-items: center; gap: 12px; font-size: 13px; color: #60707D; }
.bar-track { height: 10px; border-radius: 999px; background: #EEF2F0; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 999px; background: #2B9A6F; }
.bar-fill.orange { background: #F5A623; }
.rank-row { display: flex; justify-content: space-between; padding: 14px 0; border-top: 1px solid #EEF2F0; font-size: 14px; }
.big-money { display: block; margin-top: 28px; font-size: 42px; font-weight: 800; color: #2B9A6F; }
.modal-mask { position: fixed; inset: 0; z-index: 90; background: rgba(17, 24, 39, .36); display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal-card { width: min(720px, 92vw); max-height: 86vh; overflow-y: auto; padding: 22px; border-radius: 20px; background: #FFFFFF; box-shadow: 0 22px 70px rgba(17, 24, 39, .18); }
.modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-title { font-size: 20px; font-weight: 800; }
.modal-close { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #F3F0EB; color: #60707D; font-size: 22px; cursor: pointer; }
.modal-desc { display: block; margin-bottom: 14px; color: #7D8B99; }
.detail-grid, .editor-grid { display: grid; grid-template-columns: 110px 1fr; gap: 12px 16px; font-size: 14px; }
.detail-grid text:nth-child(odd), .editor-grid text { color: #7D8B99; }
.proof-img { width: 100%; height: 240px; margin-top: 18px; border-radius: 14px; background: #EEF2F0; }
.option-list { display: flex; flex-direction: column; gap: 10px; }
.option-item, .stage-option { padding: 14px; border-radius: 12px; background: #F7FAF8; border: 1px solid #E2ECE7; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
.option-item:hover, .stage-option:hover { border-color: #2B9A6F; color: #2B9A6F; }
.stage-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.modal-save { margin-top: 18px; width: 180px; }
@media (max-width: 980px) {
	.sidebar { width: 210px; }
	.stat-grid, .two-col { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
