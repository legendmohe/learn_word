<template>
  <div class="courses-page">
    <!-- 课程选择页面 -->
    <CourseSelection
      v-if="showCourseSelection"
      @back="showCourseSelection = false"
      @course-selected="handleCourseSelected"
    />

    <!-- 主页面 -->
    <div v-else>
      <!-- 页面标题 -->
      <header class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">课程管理</h2>
        <p class="text-gray-600 dark:text-gray-400">
          管理你的学习课程和设置
        </p>
      </header>

      <!-- 当前选中课程卡片 -->
      <div class="current-course-section mb-6">
        <div v-if="selectedCourse" class="current-course glass-effect rounded-xl p-6 card-shadow mb-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-gradient-to-r from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold">
                {{ getCourseEmoji(selectedCourse) }}
              </div>
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">当前学习</div>
                <div class="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {{ selectedCourse }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ getCourseWordCount(selectedCourse) }} 个单词
                </div>
              </div>
            </div>
            <div class="text-4xl">📖</div>
          </div>

          <!-- 学习进度 -->
          <div v-if="getCourseProgress(selectedCourse) > 0" class="course-progress">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">学习进度</span>
              <span class="text-sm font-medium text-primary-600 dark:text-primary-400">
                {{ getCourseProgress(selectedCourse) }}%
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${getCourseProgress(selectedCourse)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 切换课程按钮 -->
        <button
          @click="showCourseSelection = true"
          class="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          {{ selectedCourse ? '切换课程' : '选择课程' }}
        </button>
      </div>

      <!-- 快速统计 -->
      <div class="quick-stats glass-effect rounded-xl p-6 card-shadow mb-6">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">学习统计</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="stat-item text-center">
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              {{ totalCourses }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">可用课程</div>
          </div>
          <div class="stat-item text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {{ completedCourses }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">已完成</div>
          </div>
        </div>
      </div>

      <!-- 学习设置 -->
      <div class="study-settings">
        <div class="glass-effect rounded-xl p-6 card-shadow">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            学习设置
          </h3>

          <!-- 每日学习目标 -->
          <div class="setting-item mb-4">
            <div class="flex justify-between items-center mb-2">
              <label class="text-gray-700 dark:text-gray-300">每日学习目标</label>
              <span class="text-primary-600 dark:text-primary-400 font-medium">
                {{ dailyGoal }} 个单词
              </span>
            </div>
            <input
              v-model.number="dailyGoal"
              type="range"
              :min="minDailyGoal"
              :max="maxDailyGoal"
              :step="dailyGoalStep"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{{ minDailyGoal }}</span>
              <span>{{ maxDailyGoal }}</span>
            </div>
          </div>

          <!-- 学习模式 -->
          <div class="setting-item">
            <div class="flex justify-between items-center">
              <label class="text-gray-700 dark:text-gray-300">智能复习</label>
              <button
                @click="toggleSmartReview"
                :class="[
                  'w-12 h-6 rounded-full transition-colors duration-200',
                  smartReviewEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                ]"
              >
                <div
                  :class="[
                    'w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200',
                    smartReviewEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  ]"
                ></div>
              </button>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              优先复习易错单词，提高学习效率
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { getAllCourses, getCourseByName, getDefaultSettings } from '../utils/coursesParser'
import { getSelectedCourse, setSelectedCourse, getDailyGoal, setDailyGoal, getLearnedWords } from '../utils/studyData'
import CourseSelection from './CourseSelection.vue'

// 页面状态
const showCourseSelection = ref(false)

// 课程数据
const courses = ref([])
const selectedCourse = ref('')

// 获取默认设置
const defaultSettings = getDefaultSettings()

// 学习设置
const dailyGoal = ref(10)
const smartReviewEnabled = ref(true)

// 设置相关的计算属性
const minDailyGoal = computed(() => defaultSettings.minDailyGoal)
const maxDailyGoal = computed(() => defaultSettings.maxDailyGoal)
const dailyGoalStep = computed(() => defaultSettings.dailyGoalStep)

// 计算属性
const totalCourses = computed(() => courses.value.length)

const completedCourses = computed(() => {
  return courses.value.filter(course => getCourseProgress(course.name) >= 100).length
})

// 组件挂载时加载数据
onMounted(() => {
  loadCourses()
  loadSettings()

  // 监听显示课程选择页面的事件
  const handleShowCourseSelection = () => {
    showCourseSelection.value = true
  }

  window.addEventListener('showCourseSelection', handleShowCourseSelection)

  // 保存事件监听器引用，以便后续清理
  window._coursesShowCourseSelectionHandler = handleShowCourseSelection
})

// 组件卸载时清理事件监听器
onUnmounted(() => {
  if (window._coursesShowCourseSelectionHandler) {
    window.removeEventListener('showCourseSelection', window._coursesShowCourseSelectionHandler)
    delete window._coursesShowCourseSelectionHandler
  }
})

// 加载课程列表
const loadCourses = () => {
  courses.value = getAllCourses()
  selectedCourse.value = getSelectedCourse()
}

// 加载设置
const loadSettings = () => {
  dailyGoal.value = getDailyGoal()
  smartReviewEnabled.value = localStorage.getItem('learn_word_smart_review') !== 'false'
}

// 处理课程选择
const handleCourseSelected = (courseName) => {
  selectedCourse.value = courseName
}

// 获取课程图标
const getCourseEmoji = (courseName) => {
  const course = getCourseByName(courseName)
  return course ? course.emoji : '📚'
}

// 获取课程单词数量
const getCourseWordCount = (courseName) => {
  const course = courses.value.find(c => c.name === courseName)
  return course ? course.wordCount : 0
}

// 获取课程学习进度
const getCourseProgress = (courseName) => {
  const learnedWords = getLearnedWords()
  const course = courses.value.find(c => c.name === courseName)

  if (!course) return 0

  const learnedInCourse = learnedWords.filter(word => {
    // 这里需要根据实际的课程判断逻辑来实现
    // 暂时使用简单的单词匹配
    return course.words.some(courseWord => courseWord.word === word.word)
  })

  return Math.round((learnedInCourse.length / course.wordCount) * 100)
}

// 切换智能复习
const toggleSmartReview = () => {
  smartReviewEnabled.value = !smartReviewEnabled.value
  localStorage.setItem('learn_word_smart_review', smartReviewEnabled.value.toString())
}

// 监听每日学习目标变化
watch(dailyGoal, (newValue) => {
  if (newValue >= minDailyGoal.value && newValue <= maxDailyGoal.value) {
    setDailyGoal(newValue)
  }
})
</script>

<style scoped>
.courses-page {
  min-height: 100vh;
  padding-bottom: 80px; /* 为底部导航留出空间 */
}

.current-course-section {
  animation: slideIn 0.4s ease-out;
}

.quick-stats {
  animation: slideIn 0.5s ease-out;
}

.study-settings {
  animation: slideIn 0.6s ease-out;
}

.stat-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark .stat-item {
  background: rgba(31, 41, 55, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dark .stat-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.course-progress {
  margin-top: 1rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 自定义滑块样式 */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* 响应式设计 */
@media (max-width: 380px) {
  .current-course {
    padding: 1rem;
  }

  .text-xl {
    font-size: 1.125rem;
  }

  .text-lg {
    font-size: 1rem;
  }
}
</style>