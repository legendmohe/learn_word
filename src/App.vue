<template>
  <div id="app" :class="{ 'dark': isDark }" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
    <!-- 有导航栏的页面布局 -->
    <div v-if="!hideNavigation" class="max-w-md mx-auto min-h-screen flex flex-col relative">
      <!-- 主内容区域 -->
      <main class="flex-1 relative z-10 pb-20">
        <div class="px-4 pt-2 pb-2 h-full">
          <router-view v-slot="{ Component, route }">
            <transition
              :name="getTransitionName(route)"
              mode="out-in"
              appear
            >
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </div>
      </main>

      <!-- 底部导航栏 -->
      <BottomNavigation />
    </div>

    <!-- 无导航栏的页面布局（如学习页面） -->
    <div v-else class="w-full h-screen">
      <router-view v-slot="{ Component, route }">
        <transition
          :name="getTransitionName(route)"
          mode="out-in"
          appear
        >
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'
import BottomNavigation from './components/BottomNavigation.vue'

// 路由相关
const route = useRoute()

// 计算属性
const hideNavigation = computed(() => {
  return route.meta?.hideNavigation || false
})

// 获取过渡动画名称
const getTransitionName = (route) => {
  // 所有页面都使用简单的淡入淡出效果
  return 'fade'
}

// 深色模式状态管理
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'learn_word_dark_mode',
  disableTransition: false
})

// 组件挂载时的初始化
onMounted(() => {
  // 初始化应用
  console.log('📚 Learn Word 应用已启动')
})
</script>

<style scoped>
/* 自定义应用样式 */
#app {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* 移动端适配 */
@media (max-width: 640px) {
  #app {
    font-size: 14px;
  }
}

/* 页面过渡动画 - 简单的淡入淡出效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>