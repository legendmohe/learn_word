<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
    <div class="max-w-md mx-auto px-4">
      <div class="flex justify-around items-center h-16">
        <!-- 今日学习 -->
        <button
          @click="switchTab('today')"
          :class="[
            'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1',
            currentTab === 'today'
              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          <div class="relative">
            <svg class="w-6 h-6 mb-1" :class="{ 'animate-pulse': currentTab === 'today' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <!-- 今日学习完成指示器 -->
            <span
              v-if="todayProgress.isCompleted"
              class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"
            ></span>
          </div>
          <span class="text-xs font-medium truncate">今日学习</span>
        </button>

        <!-- 课程 -->
        <button
          @click="switchTab('courses')"
          :class="[
            'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1',
            currentTab === 'courses'
              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          <svg class="w-6 h-6 mb-1" :class="{ 'animate-pulse': currentTab === 'courses' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
          <span class="text-xs font-medium truncate">课程</span>
        </button>

        <!-- 个人中心 -->
        <button
          @click="switchTab('profile')"
          :class="[
            'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1',
            currentTab === 'profile'
              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          <svg class="w-6 h-6 mb-1" :class="{ 'animate-pulse': currentTab === 'profile' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span class="text-xs font-medium truncate">个人中心</span>
        </button>
      </div>

      <!-- 激活指示器 -->
      <div class="relative h-0.5 bg-gray-200 dark:bg-gray-700">
        <div
          class="absolute top-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300 ease-out"
          :style="indicatorStyle"
        ></div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getTodayProgress } from '../utils/studyData'

// 当前选中的标签页
const currentTab = ref('today')

// 今日进度
const todayProgress = ref({})

// 计算指示器位置和宽度
const indicatorStyle = computed(() => {
  const tabWidth = 100 / 3 // 三个标签页平均分配宽度
  const leftOffset = currentTab.value === 'today' ? 0 :
                   currentTab.value === 'courses' ? tabWidth :
                   tabWidth * 2

  return {
    left: `${leftOffset}%`,
    width: `${tabWidth}%`
  }
})

// 切换标签页
const switchTab = (tab) => {
  currentTab.value = tab

  // 发送标签页切换事件
  window.dispatchEvent(new CustomEvent('tabChange', {
    detail: { tab }
  }))

  // 添加触觉反馈效果（如果支持）
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }
}

// 加载今日进度
const loadTodayProgress = () => {
  todayProgress.value = getTodayProgress()
}

// 监听窗口事件
onMounted(() => {
  loadTodayProgress()

  // 监听学习完成事件，更新进度
  window.addEventListener('studyCompleted', loadTodayProgress)
})

// 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('studyCompleted', loadTodayProgress)
})
</script>

<style scoped>
/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

</style>