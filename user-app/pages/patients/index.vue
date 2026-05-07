<template>
	<AzShell active="">
		<view class="page">
			<view class="nav">
				<view class="back" @tap="back"><AzIcon name="left" :size="24" color="#2D2D2D" /></view>
				<text>就诊人管理</text>
			</view>

			<view class="content">
				<view class="intro-card">
					<text class="intro-title">当前就诊人</text>
					<text class="intro-name">{{ currentPatient ? `${currentPatient.name}（${currentPatient.remarkRelation}）` : '暂未设置' }}</text>
					<text class="intro-desc">预约页、订单页和支付页会优先读取当前就诊人信息。</text>
				</view>

				<view v-if="patients.length === 0" class="empty-state">
					<text class="empty-title">暂无就诊人</text>
					<text class="empty-desc">点击下方按钮，添加第一位就诊人</text>
					<view class="primary-btn" @tap="openCreate">添加就诊人</view>
				</view>

				<view v-else>
					<view
						v-for="patient in patients"
						:key="patient.id"
						class="patient-card"
						:class="{ current: patient.isCurrent }"
					>
						<view class="row between start">
							<view class="name-group">
								<text class="patient-name">{{ patient.name }}</text>
								<text class="tag">{{ patient.remarkRelation }}</text>
								<text v-if="patient.isCurrent" class="tag green">当前就诊人</text>
								<text v-if="patient.isDefault" class="tag blue">默认</text>
							</view>
							<view class="top-actions">
								<view class="mini-link" @tap="openEdit(patient)">编辑</view>
								<view class="mini-link danger" @tap="confirmDelete(patient)">删除</view>
							</view>
						</view>

						<view class="info-grid">
							<view class="info-item">
								<text class="label">年龄</text>
								<text class="value">{{ patient.age }}岁</text>
							</view>
							<view class="info-item">
								<text class="label">性别</text>
								<text class="value">{{ patient.gender }}</text>
							</view>
							<view class="info-item wide">
								<text class="label">身体状态</text>
								<text class="value">{{ patient.healthStatus }}</text>
							</view>
							<view v-if="patient.healthNote" class="info-item wide">
								<text class="label">补充说明</text>
								<text class="value note">{{ patient.healthNote }}</text>
							</view>
						</view>

						<view class="card-actions">
							<view class="ghost-btn" :class="{ active: patient.isCurrent }" @tap="chooseCurrent(patient)">设为当前就诊人</view>
							<view class="ghost-btn" :class="{ active: patient.isDefault }" @tap="chooseDefault(patient)">设为默认</view>
						</view>
					</view>
				</view>
			</view>

			<view class="fixed-bar">
				<view class="primary-btn large" @tap="openCreate">添加就诊人</view>
			</view>

			<view v-if="formOpen" class="sheet-mask" @tap="closeForm">
				<view class="sheet" @tap.stop>
					<view class="sheet-handle" />
					<text class="sheet-title">{{ editingId ? '编辑就诊人' : '新增就诊人' }}</text>

					<text class="form-label">姓名</text>
					<input v-model="form.name" class="input" placeholder="请输入姓名" />

					<text class="form-label">年龄</text>
					<input v-model="form.age" class="input" type="number" placeholder="请输入年龄" />

					<text class="form-label">性别</text>
					<view class="chip-row">
						<text
							v-for="item in genderOptions"
							:key="item"
							class="chip"
							:class="{ active: form.gender === item }"
							@tap="form.gender = item"
						>
							{{ item }}
						</text>
					</view>

					<text class="form-label">身体状态</text>
					<view class="chip-row">
						<text
							v-for="item in healthOptions"
							:key="item"
							class="chip"
							:class="{ active: form.healthStatus === item }"
							@tap="form.healthStatus = item"
						>
							{{ item }}
						</text>
					</view>

					<text class="form-label">备注关系</text>
					<view class="chip-row">
						<text
							v-for="item in relationOptions"
							:key="item"
							class="chip"
							:class="{ active: form.remarkRelation === item }"
							@tap="form.remarkRelation = item"
						>
							{{ item }}
						</text>
					</view>

					<text class="form-label">补充说明</text>
					<textarea v-model="form.healthNote" class="textarea" placeholder="如需提醒慢走、扶行、带药等，可写在这里" />

					<view class="check-row" @tap="form.isCurrent = !form.isCurrent">
						<view class="check-box" :class="{ on: form.isCurrent }">
							<AzIcon v-if="form.isCurrent" name="check" :size="14" color="#FFFFFF" />
						</view>
						<text>保存后设为当前就诊人</text>
					</view>
					<view class="check-row" @tap="form.isDefault = !form.isDefault">
						<view class="check-box" :class="{ on: form.isDefault }">
							<AzIcon v-if="form.isDefault" name="check" :size="14" color="#FFFFFF" />
						</view>
						<text>保存后设为默认就诊人</text>
					</view>

					<view class="submit-btn" @tap="submitForm">{{ editingId ? '保存修改' : '确认添加' }}</view>
				</view>
			</view>
		</view>
	</AzShell>
</template>

<script>
import AzShell from '@/components/AzShell.vue'
import AzIcon from '@/components/AzIcon.vue'
import {
	addPatient,
	familyCareState,
	getCurrentPatient,
	initFamilyCareStore,
	removePatient,
	setCurrentPatient,
	setDefaultPatient,
	updatePatient
} from '@/utils/family-care.js'

function createForm() {
	return {
		name: '',
		age: '',
		gender: '女',
		healthStatus: '健康',
		healthNote: '',
		remarkRelation: '本人',
		isDefault: false,
		isCurrent: false
	}
}

export default {
	components: { AzShell, AzIcon },
	data() {
		return {
			formOpen: false,
			editingId: '',
			form: createForm(),
			genderOptions: ['女', '男'],
			healthOptions: ['健康', '慢性病', '术后恢复', '行动不便', '需要陪同'],
			relationOptions: ['本人', '配偶', '父亲', '母亲', '兄弟', '姐妹', '其他']
		}
	},
	computed: {
		patients() {
			return familyCareState.patients
		},
		currentPatient() {
			return getCurrentPatient()
		}
	},
	created() {
		initFamilyCareStore()
	},
	methods: {
		back() {
			uni.navigateBack()
		},
		openCreate() {
			this.editingId = ''
			this.form = createForm()
			this.formOpen = true
		},
		openEdit(patient) {
			this.editingId = patient.id
			this.form = {
				name: patient.name,
				age: String(patient.age),
				gender: patient.gender,
				healthStatus: patient.healthStatus,
				healthNote: patient.healthNote || '',
				remarkRelation: patient.remarkRelation,
				isDefault: patient.isDefault,
				isCurrent: patient.isCurrent
			}
			this.formOpen = true
		},
		closeForm() {
			this.formOpen = false
		},
		submitForm() {
			if (!this.form.name.trim()) {
				uni.showToast({ title: '请先填写姓名', icon: 'none' })
				return
			}
			if (!this.form.age) {
				uni.showToast({ title: '请先填写年龄', icon: 'none' })
				return
			}

			const payload = {
				...this.form,
				name: this.form.name.trim(),
				age: Number(this.form.age)
			}

			if (this.editingId) {
				updatePatient(this.editingId, payload)
			} else {
				addPatient(payload)
			}

			const refreshed = familyCareState.patients
			const targetId = this.editingId || refreshed[refreshed.length - 1]?.id
			if (payload.isCurrent && targetId) {
				setCurrentPatient(targetId)
			}
			if (payload.isDefault && targetId) {
				setDefaultPatient(targetId)
			}

			this.formOpen = false
			uni.showToast({ title: this.editingId ? '已保存' : '已添加', icon: 'success' })
		},
		chooseCurrent(patient) {
			setCurrentPatient(patient.id)
			uni.showToast({ title: '已切换当前就诊人', icon: 'success' })
		},
		chooseDefault(patient) {
			setDefaultPatient(patient.id)
			uni.showToast({ title: '已设为默认', icon: 'success' })
		},
		confirmDelete(patient) {
			uni.showModal({
				title: '删除就诊人',
				content: `确认删除${patient.name}吗？删除后不可恢复。`,
				success: ({ confirm }) => {
					if (!confirm) return
					removePatient(patient.id)
					uni.showToast({ title: '已删除', icon: 'success' })
				}
			})
		}
	}
}
</script>

<style scoped>
.page { min-height: 100vh; padding-bottom: 186px; background: #FAFAF8; }
.nav { position: sticky; top: 0; z-index: 20; height: 64px; padding: 0 20px; background: #FFFFFF; box-shadow: 0 1px 8px rgba(0,0,0,.04); display: flex; align-items: center; gap: 12px; font-size: 20px; font-weight: 800; color: #2D2D2D; }
.back { width: 40px; height: 40px; border-radius: 12px; background: #F3F0EB; display: flex; align-items: center; justify-content: center; }
.content { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.intro-card, .patient-card { padding: 18px; border-radius: 18px; background: #FFFFFF; box-shadow: 0 2px 12px rgba(45,45,45,.06); }
.intro-title, .label { font-size: 14px; color: #9CA3AF; }
.intro-name { display: block; margin-top: 8px; font-size: 22px; font-weight: 800; color: #2D2D2D; }
.intro-desc { display: block; margin-top: 6px; font-size: 15px; line-height: 1.55; color: #6B7280; }
.empty-state { padding: 34px 18px; border-radius: 18px; background: #FFFFFF; box-shadow: 0 2px 12px rgba(45,45,45,.06); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; }
.empty-title { font-size: 20px; font-weight: 800; color: #2D2D2D; }
.empty-desc { font-size: 15px; line-height: 1.55; color: #6B7280; }
.primary-btn, .submit-btn, .ghost-btn { display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 800; }
.primary-btn, .submit-btn { height: 52px; padding: 0 22px; border-radius: 14px; background: linear-gradient(135deg, #2B9A6F, #3DB88A); color: #FFFFFF; }
.primary-btn.large { width: 100%; height: 56px; }
.patient-card.current { border: 2px solid #2B9A6F; background: #F0FAF5; }
.row { display: flex; align-items: center; gap: 8px; }
.between { justify-content: space-between; }
.start { align-items: flex-start; }
.name-group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.patient-name { font-size: 20px; font-weight: 800; color: #2D2D2D; }
.tag { padding: 3px 8px; border-radius: 999px; background: #F3F0EB; color: #6B7280; font-size: 13px; font-weight: 700; }
.tag.green { background: #E8F5EE; color: #2B9A6F; }
.tag.blue { background: #EBF3FC; color: #4A90D9; }
.top-actions { display: flex; align-items: center; gap: 14px; }
.mini-link { font-size: 15px; font-weight: 700; color: #2B9A6F; }
.mini-link.danger { color: #E85D4A; }
.info-grid { margin-top: 14px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.info-item { padding: 12px; border-radius: 14px; background: #FAFAF8; display: flex; flex-direction: column; gap: 5px; }
.info-item.wide { grid-column: 1 / -1; }
.value { font-size: 17px; font-weight: 700; color: #2D2D2D; }
.value.note { line-height: 1.55; }
.card-actions { margin-top: 14px; display: flex; gap: 12px; }
.ghost-btn { flex: 1; min-height: 46px; border-radius: 14px; border: 1px solid #DDE7E1; background: #FFFFFF; color: #2D2D2D; }
.ghost-btn.active { border-color: #2B9A6F; background: #E8F5EE; color: #2B9A6F; }
.fixed-bar { position: fixed; left: 0; right: 0; bottom: 72px; z-index: 30; padding: 14px 20px calc(18px + env(safe-area-inset-bottom)); background: linear-gradient(to top, #FAFAF8 85%, transparent); }
.sheet-mask { position: fixed; inset: 0; z-index: 80; background: rgba(0,0,0,.35); display: flex; align-items: flex-end; }
.sheet { width: 100%; padding: 12px 24px calc(36px + env(safe-area-inset-bottom)); border-radius: 28px 28px 0 0; background: #FFFFFF; }
.sheet-handle { width: 40px; height: 4px; margin: 0 auto 18px; border-radius: 999px; background: #E8E5E0; }
.sheet-title { display: block; font-size: 20px; font-weight: 800; color: #2D2D2D; margin-bottom: 18px; }
.form-label { display: block; margin: 14px 0 8px; font-size: 16px; font-weight: 700; color: #2D2D2D; }
.input, .textarea { width: 100%; border-radius: 14px; border: 1px solid #E8E5E0; background: #FAFAF8; color: #2D2D2D; font-size: 16px; }
.input { height: 50px; padding: 0 14px; }
.textarea { min-height: 96px; padding: 14px; line-height: 1.55; }
.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 10px 16px; border-radius: 12px; background: #F3F0EB; color: #6B7280; font-size: 16px; font-weight: 700; border: 2px solid transparent; }
.chip.active { border-color: #2B9A6F; background: #E8F5EE; color: #2B9A6F; }
.check-row { margin-top: 14px; display: flex; align-items: center; gap: 10px; font-size: 16px; color: #2D2D2D; }
.check-box { width: 22px; height: 22px; border-radius: 6px; border: 1px solid #D1D5DB; display: flex; align-items: center; justify-content: center; }
.check-box.on { border-color: #2B9A6F; background: #2B9A6F; }
.submit-btn { margin-top: 22px; }
</style>
