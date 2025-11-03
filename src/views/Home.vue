<template>
  <div class="home-page">
    <!-- 动态内容区域 -->
    <div class="current-view">
      <!-- 今日学习页面 -->
      <div v-if="currentTab === 'today'" class="fade-in h-full flex flex-col">
        <!-- 页面标题和进度卡片（仅在非学习状态时显示） -->
        <div v-if="!isStudying">
          <!-- 页面标题 -->
          <header class="mb-6 mt-4 text-center">
            <h1 class="text-2xl font-bold gradient-text mb-1">Learn Word</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">简单有趣的英语单词学习</p>
          </header>

          <!-- 今日进度卡片 -->
          <div class="glass-effect rounded-2xl p-5 mb-5 card-shadow fade-in">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">今日学习进度</h2>
              <span class="text-2xl">🎯</span>
            </div>

            <div class="space-y-3">
              <!-- 进度条 -->
              <div class="relative">
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    class="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all duration-500 ease-out"
                    :style="{ width: `${todayProgress.progress}%` }"
                  ></div>
                </div>
                <div class="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{{ todayProgress.todayCount }} / {{ todayProgress.dailyGoal }}</span>
                  <span>{{ Math.round(todayProgress.progress) }}%</span>
                </div>
              </div>

              <!-- 学习统计 -->
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ studyProgress.totalLearned }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">已学单词</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div class="text-xl font-bold text-green-600 dark:text-green-400">{{ studyProgress.correctCount }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">正确次数</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div class="text-xl font-bold text-red-600 dark:text-red-400">{{ studyProgress.wrongCount }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">错误次数</div>
                </div>
              </div>
            </div>

            <!-- 当前学习课程 -->
            <div class="text-center pt-3">
              <div class="text-sm text-gray-500 dark:text-gray-400">
                当前课程：
                <button
                  @click="goToCourses"
                  class="font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-1 py-0.5"
                  :class="{ 'text-primary-600 dark:text-primary-400': currentTab === 'courses' }"
                >
                  {{ selectedCourse || '未选择课程' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 开始学习按钮 -->
        <div class="text-center mt-6">
          <button
            @click="startLearning"
            class="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            :disabled="!selectedCourse"
          >
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1h4a1 1 0 110 2H7a1 1 0 01-1-1z" />
              </svg>
              开始学习
            </span>
          </button>

          <!-- 提示信息 -->
          <p v-if="!selectedCourse" class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            请先选择一个课程
          </p>
        </div>
      </div>

      <!-- 课程页面 -->
      <div v-else-if="currentTab === 'courses'" class="fade-in">
        <Courses />
      </div>

      <!-- 个人中心页面 -->
      <div v-else-if="currentTab === 'profile'" class="fade-in">
        <Profile />
      </div>
    </div>

    <!-- 对话框管理器 -->
    <DialogManager :dialogs="dialogs" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getStudyProgress, getTodayProgress, getSelectedCourse, getDailyGoal } from '../utils/studyData'
import Courses from '../components/Courses.vue'
import Profile from '../components/Profile.vue'
import DialogManager from '../components/common/DialogManager.vue'
import { useDialog } from '../composables/useDialog.js'

// 激励语句
const MOTIVATIONAL_QUOTES = [
  '每学一个新单词，你都离流利英语更近一步！',
  '坚持学习，成功就在眼前！',
  '今天的努力是明天的收获！',
  '词汇量决定了你表达世界的宽度！',
  '学习英语，打开看世界的新窗户！',
  '相信自己，你可以做到的！',
  '每一个单词都是通向成功的垫脚石！',
  '积少成多，聚沙成塔！',
  '学习是一种习惯，坚持是一种品质！',
  '突破自己，成就更好的未来！'
]

// 路由实例
const router = useRouter()
const { info, dialogs } = useDialog()

// 当前选中的标签页
const currentTab = ref('today')

// 学习进度数据
const studyProgress = ref({})
const todayProgress = ref({})

// 学习状态
const isStudying = ref(false)

// 计算属性
const dailyGoal = computed(() => {
  return getDailyGoal()
})

// 计算属性
const selectedCourse = computed(() => {
  return getSelectedCourse()
})

// 获取激励语句
const getMotivationalQuote = () => {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
}

// 组件挂载时加载数据
onMounted(() => {
  loadProgressData()
})

// 加载进度数据
const loadProgressData = () => {
  studyProgress.value = getStudyProgress()
  todayProgress.value = getTodayProgress()
}

// 处理学习完成
const handleStudyCompleted = () => {
  isStudying.value = false
  loadProgressData()
}

// 处理学习状态变化
const handleStudyStatusChanged = (status) => {
  isStudying.value = status === 'studying'
}

// 开始学习
const startLearning = async () => {
  const course = getSelectedCourse()
  if (!course) {
    console.warn('未选择课程，无法开始学习')
    return
  }

  console.log('🚀 [Home] 开始学习，显示确认对话框:', {
    courseId: course.id,
    courseName: course.name,
    timestamp: Date.now()
  })

  // 添加触觉反馈效果（如果支持）
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }

  try {
    // 显示确认对话框
    const confirmed = await info(
      '准备好开始学习了吗？',
      getStartStudyMessage(),
      {
        confirmText: '开始学习！',
        cancelText: '再想想',
        onConfirm: () => confirmStartLearning(course)
      }
    )

    if (!confirmed) {
      console.log('❌ [Home] 用户取消开始学习')
    }
  } catch (error) {
    console.error('❌ [Home] 显示确认对话框失败:', error)
  }
}

// 获取开始学习对话框的消息
const getStartStudyMessage = () => {
  return `今天的努力是明天成功的基础！<br>
让我们一起坚持，每一个单词都是进步！<br><br>
<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1)); border-radius: 8px; padding: 12px; margin: 8px 0;">
  <div style="font-size: 14px; font-weight: 500; color: #3b82f6;">
    💪 ${getMotivationalQuote()}
  </div>
</div>
<br>
今日需要学习 <strong>${dailyGoal.value}</strong> 个单词，准备好挑战了吗？`
}

// 确认开始学习
const confirmStartLearning = async (course) => {
  console.log('✅ [Home] 用户确认开始学习，跳转到学习页面:', {
    courseId: course.id,
    courseName: course.name,
    timestamp: Date.now()
  })

  // 检查是否首次使用
  const isFirstTime = !localStorage.getItem('learn_word_welcome_shown')
  if (isFirstTime) {
    console.log('👋 [Home] 首次使用，将显示欢迎引导')
    // 标记为已显示
    localStorage.setItem('learn_word_welcome_shown', 'true')
  }

  // 跳转到独立的学习页面
  router.push({
    name: 'Study',
    params: {
      courseId: course.id
    },
    query: {
      autoStart: 'true',
      showWelcome: isFirstTime ? 'true' : 'false'
    }
  })
}

// 跳转到课程tab
const goToCourses = () => {
  currentTab.value = 'courses'
  // 发送标签页切换事件给底部导航组件
  window.dispatchEvent(new CustomEvent('tabChange', {
    detail: { tab: 'courses' }
  }))
  // 发送显示课程选择页面的事件
//   setTimeout(() => {
//     window.dispatchEvent(new CustomEvent('showCourseSelection'))
//   }, 100) // 稍微延迟确保tab切换完成
  // 添加触觉反馈效果（如果支持）
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }
}

// 监听标签页切换
window.addEventListener('tabChange', (event) => {
  currentTab.value = event.detail.tab
})

// 监听数据重置事件
const handleDataReset = () => {
  loadProgressData()
}

// 监听课程变更事件
const handleCourseChange = () => {
  // 强制重新计算 selectedCourse
  // 由于是计算属性，Vue 会自动处理更新
}

window.addEventListener('dataReset', handleDataReset)
window.addEventListener('courseChanged', handleCourseChange)

// 组件卸载时清理事件监听器
onUnmounted(() => {
  window.removeEventListener('dataReset', handleDataReset)
  window.removeEventListener('courseChanged', handleCourseChange)
})

// 暴露方法给子组件调用
defineExpose({
  handleStudyCompleted
})
</script>

<style scoped>
.home-page {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.current-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 动画效果 */
.slide-up {
  animation: slideUp 0.6s ease-out;
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
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
@media (max-width: 380px) {
  .text-3xl {
    font-size: 1.75rem;
  }

  .text-lg {
    font-size: 1rem;
  }
}
</style>