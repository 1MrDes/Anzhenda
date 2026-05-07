export const DEFAULT_MAP_CENTER = {
	latitude: 31.23037,
	longitude: 121.4737,
	address: '上海市'
}

export const MAP_STYLE_CONFIG = {
	subkey: 'GUXBZ-IQKEJ-WLZFK-XKQEU-FAEVE-KFBTO',
	layerStyle: ''
}

const EARTH_RADIUS_KM = 6371

function toRadians(value) {
	return (value * Math.PI) / 180
}

function toDegrees(value) {
	return (value * 180) / Math.PI
}

export function normalizeCoordinate(location = {}) {
	const latitude = Number(location.latitude)
	const longitude = Number(location.longitude)
	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
		return null
	}
	return {
		latitude,
		longitude
	}
}

export function formatDistance(distanceKm) {
	const value = Number(distanceKm)
	if (!Number.isFinite(value) || value < 0) return '--'
	if (value < 1) {
		return `${Math.max(1, Math.round(value * 1000))}米`
	}
	return `${value.toFixed(value >= 10 ? 0 : 1)}公里`
}

export function calculateDistanceKm(from, to) {
	const start = normalizeCoordinate(from)
	const end = normalizeCoordinate(to)
	if (!start || !end) return 0

	const latDiff = toRadians(end.latitude - start.latitude)
	const lngDiff = toRadians(end.longitude - start.longitude)
	const lat1 = toRadians(start.latitude)
	const lat2 = toRadians(end.latitude)

	const a =
		Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return EARTH_RADIUS_KM * c
}

export function offsetCoordinate(center, distanceKm = 0, bearingDeg = 0) {
	const origin = normalizeCoordinate(center) || DEFAULT_MAP_CENTER
	const angularDistance = distanceKm / EARTH_RADIUS_KM
	const bearing = toRadians(bearingDeg)
	const lat1 = toRadians(origin.latitude)
	const lng1 = toRadians(origin.longitude)

	const lat2 = Math.asin(
		Math.sin(lat1) * Math.cos(angularDistance) +
			Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
	)
	const lng2 =
		lng1 +
		Math.atan2(
			Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
			Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
		)

	return {
		latitude: Number(toDegrees(lat2).toFixed(6)),
		longitude: Number(toDegrees(lng2).toFixed(6))
	}
}

export async function getCurrentLocation() {
	return new Promise((resolve, reject) => {
		uni.getLocation({
			type: 'gcj02',
			isHighAccuracy: true,
			highAccuracyExpireTime: 5000,
			success: res => {
				resolve({
					latitude: Number(res.latitude),
					longitude: Number(res.longitude),
					accuracy: res.accuracy,
					address: res.address || ''
				})
			},
			fail: reject
		})
	})
}

export function buildCompanionLocations(center, companions = []) {
	const base = normalizeCoordinate(center) || DEFAULT_MAP_CENTER
	const bearings = [26, 112, 208, 318, 64, 154]
	return companions.reduce((acc, companion, index) => {
		acc[companion.id] = offsetCoordinate(base, companion.distanceKm || 0.8, bearings[index % bearings.length])
		return acc
	}, {})
}
