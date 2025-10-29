<template>
  <div id="app" :class="{ 'dark': isDark }" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
    <!-- 主容器 -->
    <div class="max-w-md mx-auto min-h-screen flex flex-col relative">

      <!-- 主内容区域 -->
      <main class="flex-1 relative z-10 pb-20">
        <div class="px-4 pt-2 pb-2 h-full">
          <router-view />
        </div>
      </main>

      <!-- 底部导航栏 -->
      <BottomNavigation />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import BottomNavigation from './components/BottomNavigation.vue'

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
  // 设置页面标题
  document.title = 'Learn Word - 英语单词学习'

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
</style>