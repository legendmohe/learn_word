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
        <div class="text-center">
          <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {{ studyProgress.streak }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">连续学习天数</div>
        </div>
      </div>

      <!-- 快速统计 -->
      <div class="grid grid-cols-3 gap-2">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3 flex flex-col items-center justify-center text-center min-h-[60px]">
          <div class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ studyProgress.totalLearned }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">总学习</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3 flex flex-col items-center justify-center text-center min-h-[60px]">
          <div class="text-lg font-bold text-green-600 dark:text-green-400">{{ accuracyRate }}%</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">正确率</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3 flex flex-col items-center justify-center text-center min-h-[60px]">
          <div class="text-lg font-bold text-accent-600 dark:text-accent-400">{{ formatTime(studyTime) }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">学习时长</div>
        </div>
      </div>
    </div>

    <!-- 单词列表页面（三级页面） -->
    <transition name="slide-left" mode="out-in">
      <WordList
        v-if="showWordList"
        :list-type="wordListType"
        @back="showWordList = false"
        @word-removed="loadData"
      />
    </transition>

    <!-- 标签页内容（仅在未显示WordList时显示） -->
    <div v-if="!showWordList">
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

      <div class="tab-content">
      <!-- 错误单词统计 -->
      <div v-if="activeTab === 'errors'" class="word-stats">
        <div class="stats-overview glass-effect rounded-xl p-6 card-shadow mb-6">
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">📊</div>
            <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              错误单词统计
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              需要重点复习的单词
            </p>
          </div>

          <!-- 统计卡片 -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="stat-card bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                {{ errorWords.length }}
              </div>
              <div class="text-sm text-red-600 dark:text-red-400">
                错误单词
              </div>
            </div>
            <div class="stat-card bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {{ getTodayErrorCount() }}
              </div>
              <div class="text-sm text-orange-600 dark:text-orange-400">
                今日新增
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3">
            <button
              v-if="errorWords.length > 0"
              @click="showWordListType('errors')"
              class="flex-1 py-3 px-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              查看详细列表
            </button>
            <button
              v-if="errorWords.length > 0"
              @click="clearErrorWords"
              class="py-3 px-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
            >
              清空全部
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="errorWords.length === 0" class="empty-state glass-effect rounded-xl p-8 card-shadow text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            太棒了！没有错误单词
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            继续保持，你的学习效果很好
          </p>
        </div>
      </div>

      <!-- 已学单词统计 -->
      <div v-else-if="activeTab === 'learned'" class="word-stats">
        <div class="stats-overview glass-effect rounded-xl p-6 card-shadow mb-6">
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">🏆</div>
            <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              已学单词统计
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              你已经掌握的单词
            </p>
          </div>

          <!-- 统计卡片 -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="stat-card bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {{ learnedWords.length }}
              </div>
              <div class="text-sm text-green-600 dark:text-green-400">
                已学单词
              </div>
            </div>
            <div class="stat-card bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {{ getMasteryRate() }}%
              </div>
              <div class="text-sm text-blue-600 dark:text-blue-400">
                掌握率
              </div>
            </div>
          </div>

          <!-- 掌握率进度条 -->
          <div class="mb-6">
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>学习进度</span>
              <span>{{ getMasteryRate() }}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                class="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                :style="{ width: `${getMasteryRate()}%` }"
              ></div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <button
            v-if="learnedWords.length > 0"
            @click="showWordListType('learned')"
            class="w-full py-3 px-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            查看详细列表
          </button>
        </div>

        <!-- 空状态 -->
        <div v-if="learnedWords.length === 0" class="empty-state glass-effect rounded-xl p-8 card-shadow text-center">
          <div class="text-6xl mb-4">📚</div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            开始你的学习之旅
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            完成第一次学习后，这里会显示你已掌握的单词
          </p>
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
                class="w-full py-2 px-4 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors text-left flex items-center gap-2"
              >
                <span>📤</span>
                <span>导出学习数据</span>
              </button>
              <label class="block w-full py-2 px-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors text-left cursor-pointer flex items-center gap-2">
                <span>📥</span>
                <span>导入学习数据</span>
                <input
                  type="file"
                  accept=".json"
                  @change="importDataFile"
                  class="hidden"
                />
              </label>
              <button
                @click="resetAllData"
                class="w-full py-2 px-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-left flex items-center gap-2"
              >
                <span>🗑️</span>
                <span>重置所有数据</span>
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
    </div>

    <!-- 对话框管理器 -->
    <DialogManager :dialogs="dialogs" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import {
  getStudyProgress,
  getErrorWords,
  getLearnedWords,
  removeErrorWord,
  updateStudyProgress,
  getStudyTime,
  clearAllErrorWords,
  exportAllData,
  importData,
  clearAllData
} from '../utils/studyData'
import DialogManager from './common/DialogManager.vue'
import { useDialog } from '../composables/useDialog.js'
import WordList from './WordList.vue'

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

// 页面状态
const showWordList = ref(false)
const wordListType = ref('errors')

// 设置相关
const isDarkMode = ref(false)
const notificationsEnabled = ref(false)
const assistModeEnabled = ref(true) // 默认开启辅助模式

// 使用对话框组合式函数
const { dialogs, deleteConfirm, dangerConfirm, success, info } = useDialog()


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

// 监听WordList页面的显示状态，当从WordList返回时重新加载数据
watch(showWordList, (newValue, oldValue) => {
  // 当从WordList页面返回时（从true变为false），重新加载数据
  if (oldValue === true && newValue === false) {
    loadData()
  }
})

// 加载数据
const loadData = () => {
  studyProgress.value = getStudyProgress()
  errorWords.value = getErrorWords()
  learnedWords.value = getLearnedWords()
  studyTime.value = getStudyTime()
  console.log('Profile.loadData - 学习时长:', studyTime.value, '分钟')
}

// 加载设置
const loadSettings = () => {
  isDarkMode.value = isDark.value
  notificationsEnabled.value = localStorage.getItem('learn_word_notifications') !== 'false'
  assistModeEnabled.value = localStorage.getItem('learn_word_assist_mode') !== 'false'
}

// 清空错误单词
const clearErrorWords = async () => {
  const confirmed = await deleteConfirm(
    '清空错误单词',
    '确定要清空所有错误单词吗？<br><strong>此操作不可恢复！</strong><br>清空后所有错误单词记录将被删除，这些单词将重新出现在学习列表中。'
  )

  if (confirmed) {
    clearAllErrorWords()
    errorWords.value = []
    showNotification('错误单词已清空')
  }
}

// 显示单词列表页面
const showWordListType = (type) => {
  wordListType.value = type
  showWordList.value = true
}

// 获取今日错误数量
const getTodayErrorCount = () => {
  const today = new Date().toDateString()
  return errorWords.value.filter(word =>
    new Date(word.lastErrorDate).toDateString() === today
  ).length
}

// 计算掌握率
const getMasteryRate = () => {
  const total = learnedWords.value.length + errorWords.value.length
  if (total === 0) return 0
  return Math.round((learnedWords.value.length / total) * 100)
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
  try {
    const data = exportAllData()

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `learn_word_data_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    showNotification('数据已导出', 'success')
  } catch (error) {
    console.error('导出数据失败:', error)
    showNotification('导出数据失败', 'error')
  }
}

// 导入数据文件
const importDataFile = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      const result = importData(data)

      if (result.success) {
        loadData()
        // 发送数据更新事件，通知其他组件
        window.dispatchEvent(new CustomEvent('dataImported'))

        const message = `导入成功：${result.imported.join('、')}`
        showNotification(message, 'success')
      } else {
        const errorMessage = result.errors.join('；')
        showNotification(`导入失败：${errorMessage}`, 'error')
      }
    } catch (error) {
      console.error('导入数据失败:', error)
      showNotification('导入失败：文件格式错误', 'error')
    }
  }

  reader.onerror = () => {
    showNotification('导入失败：文件读取错误', 'error')
  }

  reader.readAsText(file)

  // 清空文件选择，允许重复选择同一文件
  event.target.value = ''
}

// 重置所有数据
const resetAllData = async () => {
  // 第一次确认 - 使用 info 函数避免 key 冲突
  const firstConfirm = await info(
    '重置所有学习数据',
    '这将删除所有学习进度、错误单词、已学单词、学习时间等数据。<br><br><strong>此操作不可恢复！</strong>',
    {
      confirmText: '我知道了',
      cancelText: '取消',
      key: 'reset-first-confirm'
    }
  )

  if (!firstConfirm) return

  // 第二次确认 - 使用 dangerConfirm
  const finalConfirm = await dangerConfirm(
    '<strong>再次确认：这将删除所有学习进度、错误单词、已学单词等数据！</strong><br><br>这是一个危险操作，一旦执行就无法撤销。请确认您真的要重置所有数据。',
    () => {
      const resetSuccess = clearAllData()

      if (resetSuccess) {
        loadData()

        // 发送数据重置事件，通知其他组件更新数据
        window.dispatchEvent(new CustomEvent('dataReset'))

        showNotification('所有数据已重置', 'success')
      } else {
        showNotification('重置数据失败', 'error')
      }
    },
    '最终确认'
  )
}

// 格式化时间
const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes}分`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours}时`
    } else {
      return `${hours}时${remainingMinutes}分`
    }
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

/* 页面切换动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
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