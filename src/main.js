import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

const app = createApp(App)

// 配置axios - 使用环境变量
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
app.config.globalProperties.$axios = axios
app.config.globalProperties.$notify = (options) => {
  // 这里可以替换为实际的通知组件调用
  console.log('通知:', options)
}

app.use(router)
app.use(store)
app.mount('#app')
