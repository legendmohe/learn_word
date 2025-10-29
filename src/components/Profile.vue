<template>
  <div class="profile-page">
    <!-- 用户信息卡片 -->
    <div class="user-card glass-effect rounded-2xl p-6 mb-6 card-shadow text-center">
      <div class="user-avatar mb-4">
        <div class="w-20 h-20 rounded-full bg-gradient-to-r from-primary-400 to-accent-400 flex items-center justify-center text-white text-3xl font-bold mx-auto">
          👨‍🎓
        </div>
      </div>
      <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">英语学习者</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">坚持学习，每天进步</p>

      <!-- 学习连续天数 -->
      <div class="flex justify-center items-center gap-2 mb-4">
        <span class="text-3xl">🔥</span>
        <div class="text-center">
          <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {{ studyProgress.streak }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">连续学习天数</div>
        </div>
      </div>

      <!-- 快速统计 -->
      <div class="grid grid-cols-3 gap-2">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ studyProgress.totalLearned }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">总学习</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div class="text-lg font-bold text-green-600 dark:text-green-400">{{ accuracyRate }}%</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">正确率</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
          <div class="text-lg font-bold text-accent-600 dark:text-accent-400">{{ formatTime(studyTime) }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">学习时长</div>
        </div>
      </div>
    </div>

    <!-- 标签页导航 -->
    <div class="tab-navigation mb-6">
      <div class="flex bg-white dark:bg-gray-800 rounded-lg p-1 card-shadow">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200',
            activeTab === tab.key
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          ]"
        >
          <span class="flex items-center justify-center gap-1">
            <span>{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </span>
        </button>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="tab-content">
      <!-- 错误单词 -->
      <div v-if="activeTab === 'errors'" class="error-words">
        <div v-if="errorWords.length === 0" class="empty-state text-center py-8">
          <div class="text-5xl mb-4">🎉</div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            太棒了！没有错误单词
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            继续保持，你的学习效果很好
          </p>
        </div>

        <div v-else class="error-words-list">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              错误单词 ({{ errorWords.length }})
            </h3>
            <button
              @click="clearErrorWords"
              class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              清空
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="word in errorWords"
              :key="word.word"
              class="error-word-item glass-effect rounded-lg p-4 card-shadow"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="font-bold text-gray-800 dark:text-gray-200">
                      {{ word.word }}
                    </span>
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ word.meaning }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    错误 {{ word.errorCount }} 次 ·
                    最后错误：{{ formatDate(word.lastErrorDate) }}
                  </div>
                  <div v-if="word.userAnswer" class="text-xs text-red-600 dark:text-red-400 mt-1">
                    你的答案：{{ word.userAnswer }}
                  </div>
                </div>
                <button
                  @click="retryWord(word)"
                  class="ml-3 px-3 py-1 bg-primary-500 text-white text-sm rounded-full hover:bg-primary-600 transition-colors"
                >
                  重试
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 已学单词 -->
      <div v-else-if="activeTab === 'learned'" class="learned-words">
        <div v-if="learnedWords.length === 0" class="empty-state text-center py-8">
          <div class="text-5xl mb-4">📚</div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            开始你的学习之旅
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            完成第一次学习后，这里会显示你已掌握的单词
          </p>
        </div>

        <div v-else class="learned-words-list">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              已学单词 ({{ learnedWords.length }})
            </h3>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              掌握率：{{ Math.round((learnedWords.length / (learnedWords.length + errorWords.length)) * 100) }}%
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="word in learnedWords.slice(0, 20)"
              :key="word.word"
              class="learned-word-item bg-white dark:bg-gray-800 rounded-lg p-3 card-shadow"
            >
              <div class="font-medium text-gray-800 dark:text-gray-200 mb-1">
                {{ word.word }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400">
                {{ word.meaning }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                复习 {{ word.reviewCount || 1 }} 次
              </div>
            </div>
          </div>

          <div v-if="learnedWords.length > 20" class="text-center mt-4">
            <button
              class="text-primary-600 dark:text-primary-400 text-sm hover:text-primary-700 dark:hover:text-primary-300"
            >
              查看更多 ({{ learnedWords.length - 20 }} 个单词)
            </button>
          </div>
        </div>
      </div>

      <!-- 设置 -->
      <div v-else-if="activeTab === 'settings'" class="settings">
        <div class="space-y-4">
          <!-- 深色模式 -->
          <div class="setting-item glass-effect rounded-lg p-4 card-shadow">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-gray-800 dark:text-gray-200">
                  深色模式
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  保护眼睛，适合夜间学习
                </div>
              </div>
              <button
                @click="toggleDarkMode"
                :class="[
                  'w-12 h-6 rounded-full transition-colors duration-200',
                  isDarkMode ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                ]"
              >
                <div
                  :class="[
                    'w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200',
                    isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
                  ]"
                ></div>
              </button>
            </div>
          </div>

          <!-- 学习提醒 -->
          <div class="setting-item glass-effect rounded-lg p-4 card-shadow">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-gray-800 dark:text-gray-200">
                  学习提醒
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  每天定时提醒你学习
                </div>
              </div>
              <button
                @click="toggleNotification"
                :class="[
                  'w-12 h-6 rounded-full transition-colors duration-200',
                  notificationsEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                ]"
              >
                <div
                  :class="[
                    'w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200',
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  ]"
                ></div>
              </button>
            </div>
          </div>

          <!-- 辅助模式 -->
          <div class="setting-item glass-effect rounded-lg p-4 card-shadow">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-gray-800 dark:text-gray-200">
                  辅助模式
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  关闭后所有字母按钮都可用（适合高级用户）
                </div>
              </div>
              <button
                @click="toggleAssistMode"
                :class="[
                  'w-12 h-6 rounded-full transition-colors duration-200',
                  assistModeEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                ]"
              >
                <div
                  :class="[
                    'w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200',
                    assistModeEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  ]"
                ></div>
              </button>
            </div>
          </div>

          <!-- 数据管理 -->
          <div class="setting-item glass-effect rounded-lg p-4 card-shadow">
            <div class="font-medium text-gray-800 dark:text-gray-200 mb-3">
              数据管理
            </div>
            <div class="space-y-2">
              <button
                @click="exportData"
                class="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left"
              >
                导出学习数据
              </button>
              <button
                @click="resetAllData"
                class="w-full py-2 px-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-left"
              >
                重置所有数据
              </button>
            </div>
          </div>

          <!-- 关于 -->
          <div class="setting-item glass-effect rounded-lg p-4 card-shadow">
            <div class="font-medium text-gray-800 dark:text-gray-200 mb-2">
              关于应用
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>Learn Word v1.0.0</div>
              <div>一款优雅的英语单词学习应用</div>
              <div>让学习变得简单有趣</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 重试单词模态框 -->
    <div v-if="showRetryModal" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="modal-content bg-white dark:bg-gray-800 rounded-xl p-6 m-4 max-w-sm w-full">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          单词重试
        </h3>
        <div class="mb-4">
          <div class="text-xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            {{ retryWordData.meaning }}
          </div>
          <input
            v-model="retryAnswer"
            type="text"
            placeholder="请输入英文单词"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            @keyup.enter="checkRetryAnswer"
          />
        </div>
        <div class="flex gap-3">
          <button
            @click="closeRetryModal"
            class="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            @click="checkRetryAnswer"
            class="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            提交
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import {
  getStudyProgress,
  getErrorWords,
  getLearnedWords,
  removeErrorWord,
  updateStudyProgress,
  getStudyTime
} from '../utils/studyData'

// 标签页配置
const tabs = [
  { key: 'errors', label: '错误单词', icon: '❌' },
  { key: 'learned', label: '已学单词', icon: '✅' },
  { key: 'settings', label: '设置', icon: '⚙️' }
]

// 响应式数据
const activeTab = ref('errors')
const studyProgress = ref({})
const errorWords = ref([])
const learnedWords = ref([])
const studyTime = ref(0)

// 设置相关
const isDarkMode = ref(false)
const notificationsEnabled = ref(false)
const assistModeEnabled = ref(true) // 默认开启辅助模式

// 重试模态框
const showRetryModal = ref(false)
const retryWordData = ref({})
const retryAnswer = ref('')

// 深色模式控制
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'learn_word_dark_mode',
  disableTransition: false
})

const toggleDark = useToggle(isDark)

// 计算属性
const accuracyRate = computed(() => {
  const total = studyProgress.value.correctCount + studyProgress.value.wrongCount
  return total > 0 ? Math.round((studyProgress.value.correctCount / total) * 100) : 0
})

// 组件挂载时加载数据
onMounted(() => {
  loadData()
  loadSettings()
})

// 加载数据
const loadData = () => {
  studyProgress.value = getStudyProgress()
  errorWords.value = getErrorWords()
  learnedWords.value = getLearnedWords()
  studyTime.value = getStudyTime()
}

// 加载设置
const loadSettings = () => {
  isDarkMode.value = isDark.value
  notificationsEnabled.value = localStorage.getItem('learn_word_notifications') !== 'false'
  assistModeEnabled.value = localStorage.getItem('learn_word_assist_mode') !== 'false'
}

// 清空错误单词
const clearErrorWords = () => {
  if (confirm('确定要清空所有错误单词吗？')) {
    localStorage.removeItem('learn_word_error_words')
    errorWords.value = []
    showNotification('错误单词已清空')
  }
}

// 重试单词
const retryWord = (word) => {
  retryWordData.value = word
  retryAnswer.value = ''
  showRetryModal.value = true
}

// 检查重试答案
const checkRetryAnswer = () => {
  if (!retryAnswer.value.trim()) return

  const isCorrect = retryAnswer.value.trim().toLowerCase() === retryWordData.value.word.toLowerCase()

  if (isCorrect) {
    removeErrorWord(retryWordData.value.word)
    updateStudyProgress(true)
    loadData()
    closeRetryModal()
    showNotification('回答正确！单词已从错误列表中移除', 'success')
  } else {
    showNotification('回答错误，请再试试', 'error')
  }
}

// 关闭重试模态框
const closeRetryModal = () => {
  showRetryModal.value = false
  retryWordData.value = {}
  retryAnswer.value = ''
}

// 切换深色模式
const toggleDarkMode = () => {
  toggleDark()
  isDarkMode.value = isDark.value
}

// 切换通知
const toggleNotification = () => {
  notificationsEnabled.value = !notificationsEnabled.value
  localStorage.setItem('learn_word_notifications', notificationsEnabled.value.toString())

  if (notificationsEnabled.value && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

// 切换辅助模式
const toggleAssistMode = () => {
  assistModeEnabled.value = !assistModeEnabled.value
  localStorage.setItem('learn_word_assist_mode', assistModeEnabled.value.toString())

  // 显示提示信息
  const message = assistModeEnabled.value ? '辅助模式已开启' : '辅助模式已关闭'
  showNotification(message)
}

// 导出数据
const exportData = () => {
  const data = {
    studyProgress: studyProgress.value,
    errorWords: errorWords.value,
    learnedWords: learnedWords.value,
    exportDate: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `learn_word_data_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)

  showNotification('数据已导出')
}

// 重置所有数据
const resetAllData = () => {
  if (confirm('确定要重置所有学习数据吗？此操作不可恢复！')) {
    const keys = [
      'learn_word_study_progress',
      'learn_word_error_words',
      'learn_word_learned_words',
      'learn_word_daily_goal',
      'learn_word_selected_course',
      'learn_word_study_time'
    ]

    keys.forEach(key => localStorage.removeItem(key))

    loadData()
    showNotification('所有数据已重置')
  }
}

// 格式化时间
const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes}分钟`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}小时${remainingMinutes}分钟`
  }
}

// 格式化日期
const formatDate = (dateString) => {
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
.profile-page {
  max-width: 100%;
}

.user-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(217, 70, 239, 0.1) 100%);
}

.setting-item {
  transition: transform 0.2s;
}

.setting-item:hover {
  transform: translateY(-1px);
}

/* 模态框样式 */
.modal-overlay {
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  animation: slideUp 0.3s ease-out;
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

/* 空状态样式 */
.empty-state {
  animation: fadeIn 0.5s ease-out;
}

/* 响应式设计 */
@media (max-width: 380px) {
  .text-xl {
    font-size: 1.125rem;
  }

  .text-lg {
    font-size: 1rem;
  }
}
</style>