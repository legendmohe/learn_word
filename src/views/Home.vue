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
            <div class="text-center pt-3 border-t border-gray-100 dark:border-gray-700">
              <div class="text-sm text-gray-500 dark:text-gray-400">
                当前课程：<span class="font-medium text-gray-700 dark:text-gray-300">{{ selectedCourse || '未选择课程' }}</span>
              </div>
            </div>
          </div>
        </div>

        <TodayStudy
          @completed="handleStudyCompleted"
          @study-status-changed="handleStudyStatusChanged"
        />
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { getStudyProgress, getTodayProgress, getSelectedCourse } from '../utils/studyData'
import TodayStudy from '../components/TodayStudy.vue'
import Courses from '../components/Courses.vue'
import Profile from '../components/Profile.vue'

// 当前选中的标签页
const currentTab = ref('today')

// 学习进度数据
const studyProgress = ref({})
const todayProgress = ref({})

// 学习状态
const isStudying = ref(false)

// 计算属性
const selectedCourse = computed(() => {
  return getSelectedCourse()
})

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