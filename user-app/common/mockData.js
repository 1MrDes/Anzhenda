export const companions = [
	{
		id: '1',
		name: '张护士',
		avatar: '',
		rating: 4.9,
		reviewCount: 326,
		distance: '800米',
		distanceKm: 0.8,
		services: ['挂号陪诊', '检查协助', '术后护理'],
		certifications: ['护士执业资格证', '急救培训证书', '老年护理专项证书'],
		experience: '8年三甲医院护理经验',
		completedOrders: 1280,
		status: 'available',
		price: 198
	},
	{
		id: '2',
		name: '李阿姨',
		avatar: '',
		rating: 4.8,
		reviewCount: 215,
		distance: '1.2公里',
		distanceKm: 1.2,
		services: ['取药陪同', '慢性病复诊', '挂号陪诊'],
		certifications: ['健康管理师证书', '养老护理员证书'],
		experience: '5年社区医疗服务经验',
		completedOrders: 856,
		status: 'available',
		price: 168
	},
	{
		id: '3',
		name: '王医助',
		avatar: '',
		rating: 4.7,
		reviewCount: 189,
		distance: '1.5公里',
		distanceKm: 1.5,
		services: ['检查协助', '住院陪护', '术后护理'],
		certifications: ['医疗助理证书', '急救培训证书'],
		experience: '6年医院助理经验',
		completedOrders: 720,
		status: 'busy',
		price: 188
	},
	{
		id: '4',
		name: '陈护工',
		avatar: '',
		rating: 4.9,
		reviewCount: 412,
		distance: '2.0公里',
		distanceKm: 2,
		services: ['挂号陪诊', '取药陪同', '慢性病复诊'],
		certifications: ['护理员资格证', '老年护理专项证书', '心理咨询师证书'],
		experience: '10年专业陪诊经验',
		completedOrders: 2100,
		status: 'available',
		price: 218
	}
]

export const serviceTypes = [
	{
		id: 'registration',
		name: '挂号陪诊',
		icon: 'clipboard',
		description: '全程陪同挂号、候诊、就诊，协助与医生沟通病情',
		price: 198,
		duration: '约2-3小时',
		priority: 'normal',
		color: '#2B9A6F',
		bg: '#E8F5EE'
	},
	{
		id: 'medicine',
		name: '取药陪同',
		icon: 'pill',
		description: '陪同前往医院或药房取药，核对药品信息',
		price: 128,
		duration: '约1-2小时',
		priority: 'normal',
		color: '#4A90D9',
		bg: '#EBF3FC'
	},
	{
		id: 'examination',
		name: '检查协助',
		icon: 'stethoscope',
		description: '陪同完成各类医疗检查，协助理解检查结果',
		price: 168,
		duration: '约2-4小时',
		priority: 'normal',
		color: '#7C6BC4',
		bg: '#F3EEFB'
	},
	{
		id: 'emergency',
		name: '紧急陪诊',
		icon: 'siren',
		description: '30分钟内快速响应，适用于突发身体不适',
		price: 298,
		duration: '约1-4小时',
		priority: 'urgent',
		color: '#E85D4A',
		bg: '#FFF0ED'
	}
]

export const patients = [
	{
		id: 'patient-1',
		name: '张奶奶',
		age: 68,
		gender: '女',
		healthStatus: '慢性病',
		healthNote: '血压需要定期复查',
		remarkRelation: '本人',
		isDefault: true,
		isCurrent: true
	},
	{
		id: 'patient-2',
		name: '张爷爷',
		age: 72,
		gender: '男',
		healthStatus: '行动不便',
		healthNote: '步行较慢，需要陪同',
		remarkRelation: '配偶',
		isDefault: false,
		isCurrent: false
	},
	{
		id: 'patient-3',
		name: '王阿姨',
		age: 63,
		gender: '女',
		healthStatus: '术后恢复',
		healthNote: '复查时需要搀扶',
		remarkRelation: '姐妹',
		isDefault: false,
		isCurrent: false
	}
]

export const familyBindings = [
	{
		id: 'binding-1',
		name: '张明',
		relation: '子女',
		phone: '138****1122',
		bindStatus: '已绑定',
		canAssistBooking: true,
		permissions: {
			canBooking: true,
			canPay: true,
			canViewRecords: true
		}
	},
	{
		id: 'binding-2',
		name: '张丽',
		relation: '子女',
		phone: '139****7788',
		bindStatus: '已绑定',
		canAssistBooking: true,
		permissions: {
			canBooking: true,
			canPay: false,
			canViewRecords: true
		}
	}
]

export const orders = [
	{
		id: 'ORD-20250415-001',
		companionId: '1',
		companionName: '张护士',
		patientId: 'patient-1',
		patientName: '张奶奶',
		patientRelation: '本人',
		serviceType: '挂号陪诊',
		status: 'in_progress',
		date: '2025-04-16',
		time: '09:00',
		hospital: '上海市第一人民医院',
		baseFee: 198,
		extraFee: 0,
		totalFee: 198,
		canPay: false
	},
	{
		id: 'ORD-20250413-002',
		companionId: '2',
		companionName: '李阿姨',
		patientId: 'patient-2',
		patientName: '张爷爷',
		patientRelation: '配偶',
		serviceType: '取药陪同',
		status: 'completed',
		date: '2025-04-13',
		time: '14:00',
		hospital: '华山医院',
		baseFee: 128,
		extraFee: 20,
		totalFee: 148,
		canPay: false,
		rating: 5,
		review: '李阿姨非常耐心，全程细心照顾，非常感谢。'
	},
	{
		id: 'ORD-20250410-003',
		companionId: '4',
		companionName: '陈护工',
		patientId: 'patient-3',
		patientName: '王阿姨',
		patientRelation: '姐妹',
		serviceType: '检查协助',
		status: 'completed',
		date: '2025-04-10',
		time: '08:30',
		hospital: '瑞金医院',
		baseFee: 168,
		extraFee: 30,
		totalFee: 198,
		canPay: false,
		rating: 4,
		review: '服务很专业，帮忙跑了很多科室，辛苦了。'
	},
	{
		id: 'ORD-20250418-004',
		companionId: '1',
		companionName: '张护士',
		patientId: 'patient-2',
		patientName: '张爷爷',
		patientRelation: '配偶',
		serviceType: '挂号陪诊',
		status: 'pending',
		date: '2025-04-18',
		time: '10:30',
		hospital: '中山医院',
		baseFee: 198,
		extraFee: 0,
		totalFee: 198,
		canPay: true
	}
]

export const familyTaskOrders = [
	{
		id: 'TASK-ORDER-1',
		patientId: 'patient-2',
		patientName: '张爷爷',
		patientRelation: '配偶',
		hospital: '中山医院',
		date: '2025-04-18',
		time: '10:30',
		serviceType: '挂号陪诊',
		status: '待支付',
		canPay: true
	},
	{
		id: 'TASK-ORDER-2',
		patientId: 'patient-3',
		patientName: '王阿姨',
		patientRelation: '姐妹',
		hospital: '瑞金医院',
		date: '2025-04-20',
		time: '14:00',
		serviceType: '检查协助',
		status: '已预约',
		canPay: false
	}
]

export const familyRecords = [
	{
		id: 'record-1',
		patientId: 'patient-1',
		patientName: '张奶奶',
		hospital: '上海市第一人民医院',
		date: '2025-04-16',
		serviceType: '挂号陪诊',
		status: '进行中'
	},
	{
		id: 'record-2',
		patientId: 'patient-2',
		patientName: '张爷爷',
		hospital: '华山医院',
		date: '2025-04-13',
		serviceType: '取药陪同',
		status: '已完成'
	},
	{
		id: 'record-3',
		patientId: 'patient-3',
		patientName: '王阿姨',
		hospital: '瑞金医院',
		date: '2025-04-10',
		serviceType: '检查协助',
		status: '已完成'
	}
]

export const reviews = [
	{
		id: '1',
		userName: '王奶奶',
		rating: 5,
		date: '2025-04-14',
		content: '张护士非常有耐心，一直陪着我排队等候，还帮我记录了医嘱，下次还找她。'
	},
	{
		id: '2',
		userName: '刘爷爷',
		rating: 5,
		date: '2025-04-12',
		content: '很专业，检查前帮我准备好了所有材料，检查过程中一直在旁边鼓励我。'
	},
	{
		id: '3',
		userName: '陈阿姨',
		rating: 4,
		date: '2025-04-10',
		content: '服务很周到，帮我取了药还细心地讲解了用药注意事项。'
	}
]
