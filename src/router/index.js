import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import StudyPage from '../views/StudyPage.vue'

/**
 * 路由配置
 * 支持独立的学习页面和主页面导航
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Learn Word - 英语词汇学习'
    }
  },
  {
    path: '/study/:courseId?',
    name: 'Study',
    component: StudyPage,
    props: true,
    meta: {
      title: (route) => {
        // 动态标题，根据课程名称设置
        const courseId = route.params.courseId
        return courseId ? `${courseId} - Learn Word` : '学习页面 - Learn Word'
      },
      requiresAuth: false, // 未来可能需要认证
      hideNavigation: true // 标识隐藏导航栏
    }
  },
  {
    // 404页面重定向
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫 - 更新浏览器标题
router.beforeEach((to, from, next) => {
  // 更新页面标题
  if (to.meta.title) {
    if (typeof to.meta.title === 'function') {
      document.title = to.meta.title(to)
    } else {
      document.title = to.meta.title
    }
  }
  next()
})

// 全局后置钩子 - 路由切换后的处理
router.afterEach((to, from) => {
  // 可以在这里添加页面切换的通用逻辑
  console.log(`路由切换: ${from.name} -> ${to.name}`)
})

export default router