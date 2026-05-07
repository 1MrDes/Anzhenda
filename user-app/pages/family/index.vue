<template>
	<AzShell active="family">
		<view class="page">
			<view class="nav">
				<view class="back" @tap="backToProfile"><AzIcon name="left" :size="24" color="#2D2D2D" /></view>
				<text>家庭代办</text>
			</view>
			<view class="hero">
				<view class="hero-icon"><AzIcon name="users" :size="22" color="#FFFFFF" /></view>
				<view>
					<text class="title">家庭代办</text>
					<text class="sub">帮家里人代预约、代缴费、看记录，都能在这里完成</text>
				</view>
			</view>

			<view class="content">
				<view class="current-card">
					<text class="card-label">当前服务对象</text>
					<text class="current-name">{{ currentPatient ? `${currentPatient.name}（${currentPatient.remarkRelation}）` : '暂未选择' }}</text>
					<text class="current-desc">进入代办流程时，会自动带入当前就诊人信息</text>
				</view>

				<view class="action-grid">
					<view
						v-for="item in actionItems"
						:key="item.key"
						class="action-card"
						:class="{ active: activeAction === item.key }"
						@tap="handleActionCard(item)"
					>
						<view class="action-icon" :style="{ background: item.bg }">
							<AzIcon :name="item.icon" :size="22" :color="item.color" />
						</view>
						<text class="action-title">{{ item.label }}</text>
						<text class="action-desc">{{ item.desc }}</text>
					</view>
				</view>

				<view v-if="activeAction === 'booking'" class="panel">
					<view class="panel-head">
						<text class="panel-title">代家人预约</text>
						<text class="panel-sub">先选择一位家人，再进入预约流程</text>
					</view>
					<view v-if="patients.length === 0" class="empty-state">
						<text class="empty-title">暂无就诊人</text>
						<text class="empty-desc">先去添加就诊人，方便后续为家人预约</text>
						<view class="empty-btn" @tap="goPatients">去添加就诊人</view>
					</view>
					<view v-else>
						<view
							v-for="patient in patients"
							:key="patient.id"
							class="patient-row"
							:class="{ current: currentPatient && currentPatient.id === patient.id }"
						>
							<view class="patient-main">
								<view class="name-row">
									<text class="patient-name">{{ patient.name }}</text>
									<text class="relation-tag">{{ patient.remarkRelation }}</text>
									<text v-if="patient.isCurrent" class="status-tag green">当前</text>
								</view>
								<text class="patient-desc">{{ patient.gender }} · {{ patient.age }}岁 · {{ patient.healthStatus }}</text>
							</view>
							<view class="mini-btn" @tap="goBookingFor(patient)">为TA预约</view>
						</view>
					</view>
				</view>

				<view v-if="activeAction === 'payment'" class="panel">
					<view class="panel-head">
						<text class="panel-title">代家人缴费</text>
						<text class="panel-sub">待支付订单会在这里集中展示</text>
					</view>
					<view v-if="payableOrders.length === 0" class="empty-state slim">
						<text class="empty-title">当前没有待支付订单</text>
						<text class="empty-desc">已绑定家人的待支付订单会自动出现在这里</text>
					</view>
					<view
						v-for="order in payableOrders"
						:key="order.id"
						class="order-card"
					>
						<view class="row between">
							<text class="order-title">{{ order.patientName }}（{{ order.patientRelation }}）</text>
							<text class="pay-badge">待支付</text>
						</view>
						<text class="order-line">{{ order.serviceType }}</text>
						<text class="order-line">{{ order.hospital }}</text>
						<text class="order-line">{{ order.date }} {{ order.time }}</text>
						<view class="row between footer">
							<text class="order-status">当前正在为 {{ order.patientName }} 处理缴费</text>
							<view class="mini-btn solid" @tap="goPayFor(order)">去缴费</view>
						</view>
					</view>
				</view>

				<view v-if="activeAction === 'records'" class="panel">
					<view class="panel-head">
						<text class="panel-title">查看家人记录</text>
						<text class="panel-sub">已绑定家人的预约记录和订单记录</text>
					</view>
					<view v-if="records.length === 0" class="empty-state slim">
						<text class="empty-title">暂无记录</text>
						<text class="empty-desc">后续产生的预约记录会显示在这里</text>
					</view>
					<view
						v-for="record in records"
						:key="record.id"
						class="record-card"
					>
						<view class="row between">
							<text class="record-name">{{ record.patientName }}</text>
							<text class="record-status">{{ record.status }}</text>
						</view>
						<text class="record-line">{{ record.hospital }}</text>
						<text class="record-line">{{ record.date }} · {{ record.serviceType }}</text>
					</view>
				</view>

				<view v-if="activeAction === 'binding'" class="panel">
					<view class="panel-head">
						<text class="panel-title">绑定新家人</text>
						<text class="panel-sub">绑定后，子女可协助老人预约、代缴费和查看记录</text>
					</view>
					<view class="binding-card">
						<text class="binding-title">家庭协同更安心</text>
						<text class="binding-desc">可通过手机号添加家人绑定，也可以在子女绑定页统一管理绑定关系。</text>
						<view class="binding-btn" @tap="goBinding">去子女绑定页</view>
					</view>
				</view>
			</view>
		</view>
	</AzShell>
</template>

<script>
import AzShell from '@/components/AzShell.vue'
import AzIcon from '@/components/AzIcon.vue'
import { familyCareState, getCurrentPatient, initFamilyCareStore, setCurrentPatient } from '@/utils/family-care.js'

export default {
	components: { AzShell, AzIcon },
	data() {
		return {
			activeAction: 'booking',
			actionItems: [
				{ key: 'booking', label: '代家人预约', desc: '选择家人后直接进入预约流程', icon: 'calendar', color: '#2B9A6F', bg: '#E8F5EE' },
				{ key: 'payment', label: '代家人缴费', desc: '查看并支付家人的待支付订单', icon: 'card', color: '#4A90D9', bg: '#EBF3FC' },
				{ key: 'records', label: '查看家人记录', desc: '查看预约记录和订单记录', icon: 'file', color: '#7C6BC4', bg: '#F3EEFB' },
				{ key: 'binding', label: '绑定新家人', desc: '去子女绑定页面添加新的家庭成员', icon: 'users', color: '#E85D4A', bg: '#FFF0ED' }
			]
		}
	},
	computed: {
		familyState() {
			return familyCareState
		},
		currentPatient() {
			return getCurrentPatient()
		},
		patients() {
			return this.familyState.patients
		},
		payableOrders() {
			return this.familyState.familyTaskOrders.filter(item => item.canPay)
		},
		records() {
			return this.familyState.familyRecords
		}
	},
	created() {
		initFamilyCareStore()
	},
	methods: {
		backToProfile() {
			uni.navigateTo({ url: '/pages/profile/index' })
		},
		handleActionCard(item) {
			if (item.key === 'binding') {
				this.goBinding()
				return
			}
			this.activeAction = item.key
		},
		goPatients() {
			uni.navigateTo({ url: '/pages/patients/index' })
		},
		goBinding() {
			uni.navigateTo({ url: '/pages/family-binding/index' })
		},
		goBookingFor(patient) {
			setCurrentPatient(patient.id)
			uni.navigateTo({ url: `/pages/booking/index?patientId=${patient.id}&fromFamily=1` })
		},
		goPayFor(order) {
			setCurrentPatient(order.patientId)
			const query = [
				`patientId=${order.patientId}`,
				`orderId=${order.id}`,
				`serviceType=${encodeURIComponent(order.serviceType)}`,
				`hospital=${encodeURIComponent(order.hospital)}`,
				`date=${encodeURIComponent(order.date)}`,
				`time=${encodeURIComponent(order.time)}`
			].join('&')
			uni.navigateTo({ url: `/pages/payment/index?${query}` })
		}
	}
}
</script>

<style scoped>
.page { min-height: 100vh; padding-bottom: 112px; background: #FAFAF8; }
.nav { position: sticky; top: 0; z-index: 20; height: 64px; padding: 0 20px; background: #FFFFFF; box-shadow: 0 1px 8px rgba(0,0,0,.04); display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; color: #2D2D2D; }
.back { width: 40px; height: 40px; border-radius: 12px; background: #F3F0EB; display: flex; align-items: center; justify-content: center; }
.hero { padding: 36px 20px 28px; background: linear-gradient(180deg, #EBF3FC 0%, #FAFAF8 100%); display: flex; align-items: center; gap: 12px; }
.hero-icon { width: 40px; height: 40px; border-radius: 50%; background: #4A90D9; display: flex; align-items: center; justify-content: center; }
.title, .sub { display: block; }
.title { font-size: 24px; font-weight: 800; color: #2D2D2D; }
.sub { margin-top: 4px; font-size: 16px; color: #6B7280; line-height: 1.5; }
.content { padding: 0 20px 12px; display: flex; flex-direction: column; gap: 14px; }
.current-card, .panel, .binding-card { padding: 18px; border-radius: 18px; background: #FFFFFF; box-shadow: 0 2px 12px rgba(45,45,45,.06); }
.card-label { font-size: 14px; color: #9CA3AF; }
.current-name { display: block; margin-top: 8px; font-size: 22px; font-weight: 800; color: #2D2D2D; }
.current-desc { display: block; margin-top: 6px; font-size: 15px; line-height: 1.55; color: #6B7280; }
.action-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.action-card { padding: 16px; border-radius: 18px; background: #FFFFFF; border: 1px solid #EEEAE4; box-shadow: 0 2px 10px rgba(45,45,45,.04); display: flex; flex-direction: column; gap: 10px; min-height: 136px; }
.action-card.active { border-color: #2B9A6F; box-shadow: 0 6px 18px rgba(43,154,111,.14); }
.action-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.action-title { font-size: 18px; font-weight: 800; color: #2D2D2D; }
.action-desc { font-size: 14px; line-height: 1.55; color: #6B7280; }
.panel-head { margin-bottom: 14px; }
.panel-title { display: block; font-size: 20px; font-weight: 800; color: #2D2D2D; }
.panel-sub { display: block; margin-top: 4px; font-size: 15px; color: #6B7280; }
.empty-state { padding: 28px 16px; border-radius: 16px; background: #FAFAF8; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; }
.empty-state.slim { padding: 24px 16px; }
.empty-title { font-size: 18px; font-weight: 800; color: #2D2D2D; }
.empty-desc { font-size: 15px; color: #6B7280; line-height: 1.5; }
.empty-btn, .binding-btn, .mini-btn { min-height: 42px; padding: 0 16px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; }
.empty-btn, .binding-btn, .mini-btn.solid { background: linear-gradient(135deg, #2B9A6F, #3DB88A); color: #FFFFFF; }
.patient-row, .order-card, .record-card { padding: 16px; border-radius: 16px; background: #FAFAF8; margin-bottom: 12px; }
.patient-row { display: flex; align-items: center; gap: 12px; border: 1px solid transparent; }
.patient-row.current { border-color: #2B9A6F; background: #F0FAF5; }
.patient-main { flex: 1; min-width: 0; }
.row { display: flex; align-items: center; gap: 8px; }
.between { justify-content: space-between; }
.name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.patient-name, .order-title, .record-name { font-size: 18px; font-weight: 800; color: #2D2D2D; }
.relation-tag, .status-tag, .pay-badge, .record-status { padding: 3px 8px; border-radius: 999px; font-size: 13px; font-weight: 700; }
.relation-tag { background: #F3F0EB; color: #6B7280; }
.status-tag.green, .pay-badge, .record-status { background: #E8F5EE; color: #2B9A6F; }
.patient-desc, .order-line, .record-line, .order-status { display: block; margin-top: 6px; font-size: 15px; line-height: 1.5; color: #6B7280; }
.mini-btn { border: 1px solid #2B9A6F; color: #2B9A6F; background: #FFFFFF; }
.footer { margin-top: 12px; }
.binding-title { display: block; font-size: 20px; font-weight: 800; color: #2D2D2D; }
.binding-desc { display: block; margin-top: 8px; font-size: 15px; line-height: 1.6; color: #6B7280; }
.binding-btn { margin-top: 18px; }
</style>
