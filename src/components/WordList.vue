<template>
  <div class="word-list-page">
    <!-- 页面头部 -->
    <header class="page-header mb-6">
      <div class="flex items-center gap-3 mb-4">
        <button
          @click="goBack"
          class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {{ listType === 'errors' ? '错误单词' : '已学单词' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ listType === 'errors' ? '需要重点复习的单词' : '已经掌握的单词' }}
          </p>
        </div>
      </div>
    </header>

    <!-- 错误单词列表 -->
    <div v-if="listType === 'errors'" class="error-words">
      <div v-if="errorWords.length === 0" class="empty-state text-center py-8">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          太棒了！没有错误单词
        </h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          继续保持，你的学习效果很好
        </p>
      </div>

      <div v-else class="error-words-list">
        <!-- 统计信息 -->
        <div class="stats-card glass-effect rounded-xl p-4 mb-6 card-shadow">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              错误单词总数
            </div>
            <div class="text-lg font-bold text-red-600 dark:text-red-400">
              {{ errorWords.length }} 个
            </div>
          </div>
          <div class="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>今日错误: {{ getTodayErrorCount() }}</span>
            <span>本周错误: {{ getWeekErrorCount() }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
            单词列表
          </h3>
          <button
            @click="clearErrorWords"
            class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            清空全部
          </button>
        </div>

        <!-- 单词列表 -->
        <div class="space-y-3">
          <div
            v-for="word in errorWords"
            :key="word.word"
            class="error-word-item glass-effect rounded-lg p-4 card-shadow transform transition-all duration-200 hover:scale-102"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-bold text-gray-800 dark:text-gray-200 text-lg">
                    {{ word.word }}
                  </span>
                  <span class="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-full">
                    错误 {{ word.errorCount }} 次
                  </span>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {{ word.meaning }}
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>最后错误：{{ formatDate(word.lastErrorDate) }}</span>
                </div>
                <div v-if="word.userAnswer" class="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded mt-2">
                  <div class="font-medium mb-1">你的答案：</div>
                  <div>{{ word.userAnswer }}</div>
                </div>
              </div>
              <div class="flex flex-col gap-2 ml-3">
                <button
                  @click="removeWord(word.word)"
                  class="word-action-btn px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  移除
                </button>
                <button
                  @click="markAsLearned(word)"
                  class="word-action-btn px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-all duration-200"
                >
                  标记已掌握
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 已学单词列表 -->
    <div v-else-if="listType === 'learned'" class="learned-words">
      <div v-if="learnedWords.length === 0" class="empty-state text-center py-8">
        <div class="text-6xl mb-4">📚</div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          开始你的学习之旅
        </h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          完成第一次学习后，这里会显示你已掌握的单词
        </p>
      </div>

      <div v-else class="learned-words-list">
        <!-- 统计信息 -->
        <div class="stats-card glass-effect rounded-xl p-4 mb-6 card-shadow">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              已掌握单词总数
            </div>
            <div class="text-lg font-bold text-green-600 dark:text-green-400">
              {{ learnedWords.length }} 个
            </div>
          </div>
          <div class="mt-2">
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>掌握率</span>
              <span>{{ Math.round((learnedWords.length / (learnedWords.length + errorWords.length)) * 100) }}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${Math.round((learnedWords.length / (learnedWords.length + errorWords.length)) * 100)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
            单词列表
          </h3>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            显示前 {{ Math.min(learnedWords.length, 50) }} 个
          </div>
        </div>

        <!-- 单词列表 -->
        <div class="space-y-3">
          <div
            v-for="word in learnedWords.slice(0, 50)"
            :key="word.word"
            class="learned-word-item glass-effect rounded-lg p-4 card-shadow transform transition-all duration-200 hover:scale-102"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-bold text-gray-800 dark:text-gray-200 text-lg">
                    {{ word.word }}
                  </span>
                  <span class="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-full">
                    已掌握
                  </span>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {{ word.meaning }}
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>复习 {{ word.reviewCount || 1 }} 次</span>
                  <span>学习于 {{ formatDate(word.learnedDate) }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-2 ml-3">
                <button
                  @click="markAsError(word)"
                  class="word-action-btn px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-all duration-200"
                >
                  需要复习
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 更多单词提示 -->
        <div v-if="learnedWords.length > 50" class="text-center mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            还有 {{ learnedWords.length - 50 }} 个已掌握单词
          </p>
        </div>
      </div>
    </div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getErrorWords,
  getLearnedWords,
  removeErrorWord,
  clearAllErrorWords,
  addErrorWord,
  addLearnedWord
} from '../utils/studyData'

// 定义事件
const emit = defineEmits(['back'])

// Props
const props = defineProps({
  listType: {
    type: String,
    required: true,
    validator: (value) => ['errors', 'learned'].includes(value)
  }
})

// 响应式数据
const errorWords = ref([])
const learnedWords = ref([])

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})

// 加载数据
const loadData = () => {
  errorWords.value = getErrorWords()
  learnedWords.value = getLearnedWords()
}

// 返回上一页
const goBack = () => {
  emit('back')
}

// 清空错误单词
const clearErrorWords = () => {
  if (confirm('确定要清空所有错误单词吗？')) {
    clearAllErrorWords()
    errorWords.value = []
    showNotification('错误单词已清空', 'success')
  }
}

// 移除单个错误单词
const removeWord = (word) => {
  if (confirm(`确定要移除单词 "${word}" 吗？`)) {
    removeErrorWord(word)
    loadData()
    showNotification('单词已移除', 'success')
  }
}

// 标记错误单词为已掌握
const markAsLearned = (word) => {
  if (confirm(`确定要将单词 "${word}" 标记为已掌握吗？`)) {
    addLearnedWord({ word: word.word, meaning: word.meaning })
    removeErrorWord(word.word)
    loadData()
    showNotification('单词已标记为已掌握', 'success')
  }
}

// 标记已学单词为错误
const markAsError = (word) => {
  if (confirm(`确定要将单词 "${word}" 标记为需要复习吗？`)) {
    addErrorWord({
      word: word.word,
      meaning: word.meaning,
      userAnswer: '',
      errorCount: 1,
      lastErrorDate: new Date().toISOString()
    })
    loadData()
    showNotification('单词已标记为需要复习', 'info')
  }
}


// 获取今日错误数量
const getTodayErrorCount = () => {
  const today = new Date().toDateString()
  return errorWords.value.filter(word =>
    new Date(word.lastErrorDate).toDateString() === today
  ).length
}

// 获取本周错误数量
const getWeekErrorCount = () => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return errorWords.value.filter(word =>
    new Date(word.lastErrorDate) >= weekAgo
  ).length
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'

  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

// 显示通知
const showNotification = (message, type = 'info') => {
  const toast = document.createElement('div')
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'

  toast.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.transform = 'translateX(0)'
  }, 10)

  setTimeout(() => {
    toast.style.transform = 'translateX(200%)'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}
</script>

<style scoped>
.word-list-page {
  min-height: auto; /* 让内容自然撑开高度 */
  padding-bottom: 20px; /* 减少底部间距 */
}

.page-header {
  animation: slideDown 0.4s ease-out;
}

.stats-card {
  animation: slideUp 0.5s ease-out;
}

/* 统一的列表项样式 */
.error-word-item,
.learned-word-item {
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.3s ease;
}

.error-word-item:hover,
.learned-word-item:hover {
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px) scale(1.01);
}

/* 列表项悬停动画 */
.error-word-item::before,
.learned-word-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s;
}

.error-word-item:hover::before,
.learned-word-item:hover::before {
  left: 100%;
}

/* 按钮统一样式 */
.word-action-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
}

.word-action-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.word-action-btn:active::after {
  width: 200px;
  height: 200px;
}

/* 模态框样式 */
.modal-overlay {
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  animation: slideUp 0.3s ease-out;
}

/* 空状态样式 */
.empty-state {
  animation: fadeIn 0.5s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .error-word-item,
  .learned-word-item {
    padding: 1rem;
  }

  .word-action-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 380px) {
  .page-header {
    padding: 0.5rem;
  }

  .text-2xl {
    font-size: 1.5rem;
  }

  .error-word-item,
  .learned-word-item {
    padding: 0.75rem;
  }

  .word-action-btn {
    padding: 0.375rem 0.625rem;
    font-size: 0.8rem;
  }

  .flex.items-center.gap-2 {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .flex.items-center.gap-4 {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style>