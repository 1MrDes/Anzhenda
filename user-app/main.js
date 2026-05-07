import App from './App'
import { initAccessibilitySettings } from './utils/accessibility.js'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
initAccessibilitySettings()
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  initAccessibilitySettings()
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif
