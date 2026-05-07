<template>
	<AzShell active="">
		<view class="page">
			<view class="nav">
				<view class="back" @tap="back"><AzIcon name="left" :size="24" color="#2D2D2D" /></view>
				<text>家人绑定</text>
			</view>

			<view class="content">
				<view class="guide-card">
					<text class="guide-title">绑定后更方便</text>
					<text class="guide-desc">绑定后，子女可协助老人预约、代缴费、查看记录，家庭协同更省心。</text>
					<view class="invite-card">
						<text class="invite-label">当前邀请码</text>
						<text class="invite-code">{{ inviteCode }}</text>
						<view class="small-btn" @tap="refreshInviteCode">重新生成</view>
					</view>
				</view>

				<view class="section-title">已绑定家人</view>

				<view v-if="bindings.length === 0" class="empty-state">
					<text class="empty-title">还没有绑定家人</text>
					<text class="empty-desc">点击下方按钮，可通过手机号添加第一位家人</text>
				</view>

				<view
					v-for="item in bindings"
					:key="item.id"
					class="binding-card"
				>
					<view class="row between start">
						<view class="main">
							<view class="name-row">
								<text class="name">{{ item.name }}</text>
								<text class="tag">{{ item.relation }}</text>
								<text class="tag green">{{ item.bindStatus }}</text>
							</view>
							<text class="phone">{{ item.phone }}</text>
							<view class="permission-row">
								<text class="permission-tag" :class="{ off: !item.permissions.canBooking }">可协助预约</text>
								<text class="permission-tag" :class="{ off: !item.permissions.canPay }">可代缴费</text>
								<text class="permission-tag" :class="{ off: !item.permissions.canViewRecords }">可查看记录</text>
							</view>
						</view>
						<view class="unlink" @tap="confirmRemove(item)">解绑</view>
					</view>
				</view>
			</view>

			<view class="fixed-bar">
				<view class="primary-btn" @tap="openForm">绑定新家人</view>
			</view>

			<view v-if="formOpen" class="sheet-mask" @tap="closeForm">
				<view class="sheet" @tap.stop>
					<view class="sheet-handle" />
					<text class="sheet-title">绑定新家人</text>
					<text class="form-label">家人姓名</text>
					<input v-model="form.name" class="input" placeholder="请输入家人姓名" />
					<text class="form-label">手机号码</text>
					<input v-model="form.phone" class="input" type="number" placeholder="请输入手机号" />
					<text class="form-label">与本人关系</text>
					<view class="chip-row">
						<text
							v-for="item in relations"
							:key="item"
							class="chip"
							:class="{ active: form.relation === item }"
							@tap="form.relation = item"
						>
							{{ item }}
						</text>
					</view>
					<text class="helper">演示版本采用手机号绑定，提交后会直接生成已绑定状态。</text>
					<view class="submit-btn" @tap="submitForm">确认绑定</view>
				</view>
			</view>
		</view>
	</AzShell>
</template>

<script>
import AzShell from '@/components/AzShell.vue'
import AzIcon from '@/components/AzIcon.vue'
import { addFamilyBinding, familyCareState, initFamilyCareStore, removeFamilyBinding } from '@/utils/family-care.js'

function createInviteCode() {
	return `AZ${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export default {
	components: { AzShell, AzIcon },
	data() {
		return {
			formOpen: false,
			inviteCode: createInviteCode(),
			form: {
				name: '',
				phone: '',
				relation: '子女'
			},
			relations: ['子女', '父母', '配偶', '兄弟姐妹', '其他']
		}
	},
	computed: {
		bindings() {
			return familyCareState.familyBindings
		}
	},
	created() {
		initFamilyCareStore()
	},
	methods: {
		back() {
			uni.navigateBack()
		},
		refreshInviteCode() {
			this.inviteCode = createInviteCode()
			uni.showToast({ title: '已生成新邀请码', icon: 'none' })
		},
		openForm() {
			this.formOpen = true
		},
		closeForm() {
			this.formOpen = false
		},
		submitForm() {
			if (!this.form.name.trim()) {
				uni.showToast({ title: '请先填写家人姓名', icon: 'none' })
				return
			}
			if (!this.form.phone.trim()) {
				uni.showToast({ title: '请先填写手机号', icon: 'none' })
				return
			}
			addFamilyBinding({
				name: this.form.name.trim(),
				phone: this.form.phone.trim(),
				relation: this.form.relation
			})
			this.formOpen = false
			this.form = { name: '', phone: '', relation: '子女' }
			uni.showToast({ title: '绑定成功', icon: 'success' })
		},
		confirmRemove(item) {
			uni.showModal({
				title: '解除绑定',
				content: `确认解除与${item.name}的绑定关系吗？`,
				success: ({ confirm }) => {
					if (!confirm) return
					removeFamilyBinding(item.id)
					uni.showToast({ title: '已解绑', icon: 'success' })
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
.guide-card, .binding-card, .invite-card { padding: 18px; border-radius: 18px; background: #FFFFFF; box-shadow: 0 2px 12px rgba(45,45,45,.06); }
.guide-title { display: block; font-size: 22px; font-weight: 800; color: #2D2D2D; }
.guide-desc { display: block; margin-top: 8px; font-size: 15px; line-height: 1.6; color: #6B7280; }
.invite-card { margin-top: 14px; background: #FAFAF8; box-shadow: none; }
.invite-label { font-size: 14px; color: #9CA3AF; }
.invite-code { display: block; margin-top: 8px; font-size: 26px; font-weight: 800; color: #2B9A6F; letter-spacing: 1px; }
.small-btn, .unlink, .primary-btn, .submit-btn { display: flex; align-items: center; justify-content: center; }
.small-btn { margin-top: 12px; width: 108px; height: 40px; border-radius: 12px; background: #E8F5EE; color: #2B9A6F; font-size: 15px; font-weight: 700; }
.section-title { font-size: 18px; font-weight: 800; color: #2D2D2D; }
.empty-state { padding: 28px 18px; border-radius: 18px; background: #FFFFFF; box-shadow: 0 2px 12px rgba(45,45,45,.06); display: flex; flex-direction: column; gap: 8px; text-align: center; }
.empty-title { font-size: 20px; font-weight: 800; color: #2D2D2D; }
.empty-desc { font-size: 15px; line-height: 1.55; color: #6B7280; }
.row { display: flex; align-items: center; gap: 10px; }
.between { justify-content: space-between; }
.start { align-items: flex-start; }
.main { flex: 1; min-width: 0; }
.name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.name { font-size: 20px; font-weight: 800; color: #2D2D2D; }
.tag, .permission-tag { padding: 3px 8px; border-radius: 999px; font-size: 13px; font-weight: 700; }
.tag { background: #F3F0EB; color: #6B7280; }
.tag.green { background: #E8F5EE; color: #2B9A6F; }
.phone { display: block; margin-top: 8px; font-size: 16px; color: #6B7280; }
.permission-row { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
.permission-tag { background: #E8F5EE; color: #2B9A6F; }
.permission-tag.off { background: #F3F0EB; color: #9CA3AF; }
.unlink { min-width: 64px; height: 38px; border-radius: 12px; background: #FFF0ED; color: #E85D4A; font-size: 15px; font-weight: 700; }
.fixed-bar { position: fixed; left: 0; right: 0; bottom: 72px; z-index: 30; padding: 14px 20px calc(18px + env(safe-area-inset-bottom)); background: linear-gradient(to top, #FAFAF8 85%, transparent); }
.primary-btn, .submit-btn { width: 100%; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #2B9A6F, #3DB88A); color: #FFFFFF; font-size: 18px; font-weight: 800; }
.sheet-mask { position: fixed; inset: 0; z-index: 80; background: rgba(0,0,0,.35); display: flex; align-items: flex-end; }
.sheet { width: 100%; padding: 12px 24px calc(36px + env(safe-area-inset-bottom)); border-radius: 28px 28px 0 0; background: #FFFFFF; }
.sheet-handle { width: 40px; height: 4px; margin: 0 auto 18px; border-radius: 999px; background: #E8E5E0; }
.sheet-title { display: block; font-size: 20px; font-weight: 800; color: #2D2D2D; margin-bottom: 18px; }
.form-label { display: block; margin: 14px 0 8px; font-size: 16px; font-weight: 700; color: #2D2D2D; }
.input { height: 50px; width: 100%; padding: 0 14px; border-radius: 14px; border: 1px solid #E8E5E0; background: #FAFAF8; font-size: 16px; color: #2D2D2D; }
.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 10px 16px; border-radius: 12px; background: #F3F0EB; color: #6B7280; font-size: 16px; font-weight: 700; border: 2px solid transparent; }
.chip.active { border-color: #2B9A6F; background: #E8F5EE; color: #2B9A6F; }
.helper { display: block; margin-top: 12px; font-size: 14px; line-height: 1.55; color: #9CA3AF; }
.submit-btn { margin-top: 20px; }
</style>
