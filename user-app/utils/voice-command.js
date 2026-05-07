export function normalizeVoiceText(text) {
	return String(text || '')
		.replace(/[，。！？、,.!?：:；;"'“”‘’（）()]/g, '')
		.replace(/\s+/g, '')
		.trim()
}

const PERIOD_COMMANDS = [
	{ label: '上午', periodId: 'morning', patterns: ['选择上午', '上午'] },
	{ label: '中午', periodId: 'noon', patterns: ['选择中午', '中午'] },
	{ label: '下午', periodId: 'afternoon', patterns: ['选择下午', '下午'] },
	{ label: '晚上', periodId: 'evening', patterns: ['选择晚上', '晚上'] },
	{ label: '凌晨', periodId: 'midnight', patterns: ['选择凌晨', '凌晨'] }
]

const OPTION_PATTERNS = {
	1: ['1', '一', '壹', '选1', '选一', '序号1', '序号一', '1号', '一号', '第1个', '第一个'],
	2: ['2', '二', '贰', '选2', '选二', '序号2', '序号二', '2号', '二号', '第2个', '第二个'],
	3: ['3', '三', '叁', '选3', '选三', '序号3', '序号三', '3号', '三号', '第3个', '第三个'],
	4: ['4', '四', '肆', '选4', '选四', '序号4', '序号四', '4号', '四号', '第4个', '第四个'],
	5: ['5', '五', '伍', '选5', '选五', '序号5', '序号五', '5号', '五号', '第5个', '第五个'],
	6: ['6', '六', '陆', '选6', '选六', '序号6', '序号六', '6号', '六号', '第6个', '第六个'],
	7: ['7', '七', '柒', '选7', '选七', '序号7', '序号七', '7号', '七号', '第7个', '第七个']
}

function extractPeriodCommand(normalizedText) {
	for (const item of PERIOD_COMMANDS) {
		if (item.patterns.some(pattern => normalizedText.includes(pattern))) {
			return {
				periodId: item.periodId,
				periodLabel: item.label
			}
		}
	}
	return null
}

export function parseOptionIndex(text, max = 4) {
	const normalizedText = normalizeVoiceText(text)
	if (!normalizedText) return null

	for (let index = 1; index <= max; index += 1) {
		const patterns = OPTION_PATTERNS[index] || []
		if (patterns.includes(normalizedText)) {
			return index
		}
	}

	return null
}

export function extractDateHint(text) {
	const normalizedText = normalizeVoiceText(text)
	if (!normalizedText) return null

	if (normalizedText.includes('今天')) {
		return { type: 'relative', offset: 0, label: '今天' }
	}
	if (normalizedText.includes('明天')) {
		return { type: 'relative', offset: 1, label: '明天' }
	}
	if (normalizedText.includes('后天')) {
		return { type: 'relative', offset: 2, label: '后天' }
	}

	const monthDayMatch = normalizedText.match(/(\d{1,2})月(\d{1,2})(日|号)?/)
	if (monthDayMatch) {
		return {
			type: 'month_day',
			month: Number(monthDayMatch[1]),
			day: Number(monthDayMatch[2]),
			label: `${Number(monthDayMatch[1])}月${Number(monthDayMatch[2])}日`
		}
	}

	const dayOnlyMatch = normalizedText.match(/(\d{1,2})(日|号)/)
	if (dayOnlyMatch) {
		return {
			type: 'day_only',
			day: Number(dayOnlyMatch[1]),
			label: `${Number(dayOnlyMatch[1])}日`
		}
	}

	const weekdayMap = {
		周日: 0,
		星期日: 0,
		周天: 0,
		星期天: 0,
		周一: 1,
		星期一: 1,
		周二: 2,
		星期二: 2,
		周三: 3,
		星期三: 3,
		周四: 4,
		星期四: 4,
		周五: 5,
		星期五: 5,
		周六: 6,
		星期六: 6
	}

	for (const key of Object.keys(weekdayMap)) {
		if (normalizedText.includes(key)) {
			return {
				type: 'weekday',
				weekday: weekdayMap[key],
				label: key.startsWith('星期') ? key.replace('星期', '周') : key
			}
		}
	}

	return null
}

export function extractScheduleSelection(text) {
	const normalizedText = normalizeVoiceText(text)
	return {
		dateHint: extractDateHint(normalizedText),
		...(extractPeriodCommand(normalizedText) || {})
	}
}

export function parseVoiceCommand(text) {
	const rawText = String(text || '').trim()
	const normalizedText = normalizeVoiceText(text)
	if (!normalizedText) return null

	if (normalizedText.includes('播报当前预约信息') || (normalizedText.includes('播报') && normalizedText.includes('预约信息'))) {
		return { type: 'broadcast_booking', rawText, normalizedText }
	}

	if (normalizedText === '确认' || normalizedText.includes('确认预约')) {
		return { type: 'confirm_booking', rawText, normalizedText }
	}

	if (normalizedText.includes('一键下单') || normalizedText.includes('立即下单')) {
		return { type: 'quick_order', rawText, normalizedText }
	}

	if (normalizedText.includes('返回首页') || normalizedText.includes('回到首页') || normalizedText.includes('回首页')) {
		return { type: 'go_home', rawText, normalizedText }
	}

	if (
		normalizedText.includes('帮我预约') ||
		normalizedText.includes('我要预约') ||
		normalizedText.includes('开始预约') ||
		normalizedText.includes('预约服务') ||
		normalizedText.includes('去预约')
	) {
		return { type: 'start_booking', rawText, normalizedText }
	}

	const scheduleSelection = extractScheduleSelection(normalizedText)
	if (scheduleSelection.dateHint || scheduleSelection.periodId) {
		return {
			type: 'select_schedule',
			rawText,
			normalizedText,
			...scheduleSelection
		}
	}

	const optionIndex = parseOptionIndex(normalizedText, 7)
	if (optionIndex) {
		return {
			type: 'choose_option',
			rawText,
			normalizedText,
			index: optionIndex
		}
	}

	return null
}

export function getDefaultVoiceCommandHints() {
	return ['我要预约', '一键下单', '返回首页']
}
