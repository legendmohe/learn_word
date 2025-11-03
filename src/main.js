import { createApp } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import './style.css'
import App from './App.vue'
import router from './router'

// 创建应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')