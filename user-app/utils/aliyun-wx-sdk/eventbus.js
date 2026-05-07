export default class EventBus {
	on(event, fn, context) {
		if (typeof fn !== 'function') {
			console.error('fn must be a function')
			return
		}
		this._stores = this._stores || {}
		;(this._stores[event] = this._stores[event] || []).push({ cb: fn, ctx: context })
	}

	emit(event, ...args) {
		this._stores = this._stores || {}
		let store = this._stores[event]
		if (store) {
			store = store.slice(0)
			for (let i = 0, len = store.length; i < len; i += 1) {
				store[i].cb.apply(store[i].ctx, args)
			}
		}
	}

	off(event, fn) {
		this._stores = this._stores || {}

		if (!arguments.length) {
			this._stores = []
			return
		}

		const store = this._stores[event]
		if (!store) return

		if (arguments.length === 1) {
			delete this._stores[event]
			return
		}

		for (let i = 0, len = store.length; i < len; i += 1) {
			if (fn === store[i].cb) {
				store.splice(i, 1)
			}
		}
	}
}
