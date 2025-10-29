<template>
  <div class="guide-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="guide-content bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full card-shadow transform transition-all duration-300 scale-100">
      <!-- 头部图标 -->
      <div class="text-center mb-6">
        <div class="w-20 h-20 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          欢迎使用 Learn Word
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          让学习英语单词变得简单有趣
        </p>
      </div>

      <!-- 功能介绍 -->
      <div class="space-y-4 mb-6">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-primary-600 dark:text-primary-400 text-sm font-bold">1</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-1">智能辅助模式</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              默认开启，只显示单词中的字母按钮，避免输入错误
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-8 h-8 bg-accent-100 dark:bg-accent-900/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-accent-600 dark:text-accent-400 text-sm font-bold">2</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-1">自定义设置</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              可以在设置页面关闭辅助模式，让所有字母按钮都可用
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-green-600 dark:text-green-400 text-sm font-bold">3</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-1">个性化学习</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              根据你的水平选择合适的学习模式，享受定制化体验
            </p>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <div class="flex items-start gap-2">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <p class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              💡 小贴士
            </p>
            <p class="text-sm text-blue-700 dark:text-blue-300">
              辅助模式非常适合初学者，当你熟悉后可以随时在设置中调整
            </p>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3">
        <button
          @click="skipGuide"
          class="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          跳过
        </button>
        <button
          @click="startLearning"
          class="flex-1 py-3 px-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          开始学习
        </button>
      </div>

      <!-- 链接到设置 -->
      <div class="text-center mt-4">
        <button
          @click="goToSettings"
          class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          先去设置看看 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

// 定义事件
const emit = defineEmits(['close', 'skip', 'start-learning', 'go-settings'])

// 处理键盘事件
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    skipGuide()
  } else if (event.key === 'Enter') {
    startLearning()
  }
}

// 跳过引导
const skipGuide = () => {
  emit('skip')
  emit('close')
}

// 开始学习
const startLearning = () => {
  // 标记首次引导已完成
  localStorage.setItem('learn_word_welcome_shown', 'true')
  emit('start-learning')
  emit('close')
}

// 前往设置
const goToSettings = () => {
  // 标记首次引导已完成
  localStorage.setItem('learn_word_welcome_shown', 'true')
  emit('go-settings')
  emit('close')
}

// 组件挂载时添加键盘事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  // 防止背景滚动
  document.body.style.overflow = 'hidden'
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // 恢复背景滚动
  document.body.style.overflow = ''
})
</script>

<style scoped>
.guide-overlay {
  animation: fadeIn 0.3s ease-out;
}

.guide-content {
  animation: slideUp 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 380px) {
  .guide-content {
    padding: 1.25rem;
  }

  .text-2xl {
    font-size: 1.5rem;
  }

  .w-20 {
    width: 4rem;
    height: 4rem;
  }

  .w-10 {
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>