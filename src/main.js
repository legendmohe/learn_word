import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'
import './style.css'
import App from './App.vue'

// 创建路由
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/Home.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 创建应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')