import { reactive } from 'vue'
import {
	patients as patientSeed,
	familyBindings as bindingSeed,
	familyTaskOrders as taskOrderSeed,
	familyRecords as familyRecordSeed
} from '@/common/mockData.js'

const PATIENT_STORAGE_KEY = 'familyCarePatients'
const BINDING_STORAGE_KEY = 'familyCareBindings'

function cloneData(data) {
	if (data === undefined || data === null || data === '') {
		return data
	}
	return JSON.parse(JSON.stringify(data))
}

function normalizePatients(list) {
	const source = Array.isArray(list) && list.length ? list : cloneData(patientSeed)
	let hasCurrent = false
	let hasDefault = false
	const normalized = source.map((item, index) => {
		const patient = {
			...item,
			isDefault: Boolean(item.isDefault),
			isCurrent: Boolean(item.isCurrent)
		}
		if (patient.isCurrent && !hasCurrent) {
			hasCurrent = true
		} else {
			patient.isCurrent = false
		}
		if (patient.isDefault && !hasDefault) {
			hasDefault = true
		} else if (hasDefault) {
			patient.isDefault = false
		}
		if (!patient.id) {
			patient.id = `patient-${index + 1}`
		}
		return patient
	})

	if (!normalized.length) return []

	if (!hasDefault) {
		normalized[0].isDefault = true
	}
	if (!hasCurrent) {
		const defaultPatient = normalized.find(item => item.isDefault) || normalized[0]
		defaultPatient.isCurrent = true
	}
	return normalized
}

function normalizeBindings(list) {
	if (Array.isArray(list) && list.length) {
		return list.map(item => ({
			...item,
			permissions: {
				canBooking: Boolean(item.permissions && item.permissions.canBooking),
				canPay: Boolean(item.permissions && item.permissions.canPay),
				canViewRecords: Boolean(item.permissions && item.permissions.canViewRecords)
			},
			canAssistBooking: Boolean(item.canAssistBooking)
		}))
	}
	return cloneData(bindingSeed)
}

export const familyCareState = reactive({
	inited: false,
	patients: [],
	familyBindings: [],
	familyTaskOrders: cloneData(taskOrderSeed),
	familyRecords: cloneData(familyRecordSeed)
})

function persistPatients() {
	uni.setStorageSync(PATIENT_STORAGE_KEY, cloneData(familyCareState.patients))
}

function persistBindings() {
	uni.setStorageSync(BINDING_STORAGE_KEY, cloneData(familyCareState.familyBindings))
}

export function initFamilyCareStore() {
	if (familyCareState.inited) return

	const cachedPatients = uni.getStorageSync(PATIENT_STORAGE_KEY)
	const cachedBindings = uni.getStorageSync(BINDING_STORAGE_KEY)

	familyCareState.patients = normalizePatients(cloneData(cachedPatients))
	familyCareState.familyBindings = normalizeBindings(cloneData(cachedBindings))
	familyCareState.inited = true
}

export function getCurrentPatient() {
	initFamilyCareStore()
	return familyCareState.patients.find(item => item.isCurrent) || familyCareState.patients[0] || null
}

export function getDefaultPatient() {
	initFamilyCareStore()
	return familyCareState.patients.find(item => item.isDefault) || familyCareState.patients[0] || null
}

export function setCurrentPatient(patientId) {
	initFamilyCareStore()
	familyCareState.patients = normalizePatients(
		familyCareState.patients.map(item => ({
			...item,
			isCurrent: item.id === patientId
		}))
	)
	persistPatients()
}

export function setDefaultPatient(patientId) {
	initFamilyCareStore()
	familyCareState.patients = normalizePatients(
		familyCareState.patients.map(item => ({
			...item,
			isDefault: item.id === patientId
		}))
	)
	persistPatients()
}

export function addPatient(payload) {
	initFamilyCareStore()
	const patient = {
		id: `patient-${Date.now()}`,
		name: payload.name || '',
		age: Number(payload.age || 0),
		gender: payload.gender || '女',
		healthStatus: payload.healthStatus || '健康',
		healthNote: payload.healthNote || '',
		remarkRelation: payload.remarkRelation || '家人',
		isDefault: Boolean(payload.isDefault),
		isCurrent: Boolean(payload.isCurrent)
	}
	familyCareState.patients = normalizePatients([...familyCareState.patients, patient])
	persistPatients()
	return patient
}

export function updatePatient(patientId, payload) {
	initFamilyCareStore()
	familyCareState.patients = normalizePatients(
		familyCareState.patients.map(item => item.id === patientId
			? {
				...item,
				...payload
			}
			: item)
	)
	persistPatients()
}

export function removePatient(patientId) {
	initFamilyCareStore()
	const nextPatients = familyCareState.patients.filter(item => item.id !== patientId)
	familyCareState.patients = normalizePatients(nextPatients)
	persistPatients()
}

export function addFamilyBinding(payload) {
	initFamilyCareStore()
	const binding = {
		id: `binding-${Date.now()}`,
		name: payload.name || '',
		relation: payload.relation || '子女',
		phone: payload.phone || '',
		bindStatus: '已绑定',
		canAssistBooking: true,
		permissions: {
			canBooking: true,
			canPay: true,
			canViewRecords: true
		}
	}
	familyCareState.familyBindings = [...familyCareState.familyBindings, binding]
	persistBindings()
	return binding
}

export function removeFamilyBinding(bindingId) {
	initFamilyCareStore()
	familyCareState.familyBindings = familyCareState.familyBindings.filter(item => item.id !== bindingId)
	persistBindings()
}

export function getPatientById(patientId) {
	initFamilyCareStore()
	return familyCareState.patients.find(item => item.id === patientId) || null
}

export function getOrderForPatient(patientId) {
	return familyCareState.familyTaskOrders.filter(item => item.patientId === patientId)
}
