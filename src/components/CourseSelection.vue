<template>
  <div class="course-selection-page">
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
          <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">选择课程</h2>
          <p class="text-gray-600 dark:text-gray-400">选择适合你的词汇课程</p>
        </div>
      </div>
    </header>

    <!-- 当前选中课程 -->
    <div v-if="selectedCourse" class="current-course glass-effect rounded-xl p-4 mb-6 card-shadow">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">当前学习</div>
          <div class="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {{ selectedCourse }}
          </div>
        </div>
        <div class="text-3xl">📖</div>
      </div>
    </div>

    <!-- 课程列表 -->
    <div class="courses-grid">
      <div
        v-for="course in courses"
        :key="course.name"
        @click="selectCourse(course)"
        class="course-card glass-effect rounded-xl p-6 card-shadow cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
        :class="{ 'ring-2 ring-primary-500': selectedCourse === course.name }"
      >
        <!-- 课程图标 -->
        <div class="course-icon mb-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-r from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold">
            {{ getCourseEmoji(course.name) }}
          </div>
        </div>

        <!-- 课程信息 -->
        <div class="course-info">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {{ course.name }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {{ getCourseDescription(course.name) }}
          </p>

          <!-- 课程统计 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ course.wordCount }} 个单词
            </span>
            <div v-if="selectedCourse === course.name" class="selected-indicator">
              <svg class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- 学习进度条 -->
        <div v-if="getCourseProgress(course.name) > 0" class="course-progress mt-4">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs text-gray-500 dark:text-gray-400">学习进度</span>
            <span class="text-xs font-medium text-primary-600 dark:text-primary-400">
              {{ getCourseProgress(course.name) }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              class="bg-gradient-to-r from-primary-500 to-accent-500 h-1.5 rounded-full transition-all duration-300"
              :style="{ width: `${getCourseProgress(course.name)}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习设置 -->
    <div class="study-settings mt-8">
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
            min="5"
            max="50"
            step="5"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>5</span>
            <span>50</span>
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
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getAllCourses } from '../utils/coursesParser'
import { getSelectedCourse, setSelectedCourse, getDailyGoal, setDailyGoal, getLearnedWords } from '../utils/studyData'

// 定义事件
const emit = defineEmits(['back', 'course-selected'])

// 课程数据
const courses = ref([])
const selectedCourse = ref('')

// 学习设置
const dailyGoal = ref(10)
const smartReviewEnabled = ref(true)

// 组件挂载时加载数据
onMounted(() => {
  loadCourses()
  loadSettings()
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

// 返回上一页
const goBack = () => {
  emit('back')
}

// 选择课程
const selectCourse = (course) => {
  setSelectedCourse(course.name)
  selectedCourse.value = course.name

  // 触觉反馈
  if (navigator.vibrate) {
    navigator.vibrate(100)
  }

  // 显示选择提示
  showCourseSelectedToast(course.name)

  // 触发课程选择事件
  emit('course-selected', course.name)

  // 延迟返回，让用户看到选择效果
  setTimeout(() => {
    goBack()
  }, 1000)
}

// 获取课程图标
const getCourseEmoji = (courseName) => {
  const emojiMap = {
    '基础词汇': '🔤',
    '日常用语': '💬',
    '食物词汇': '🍔',
    '动物词汇': '🐾',
    '颜色词汇': '🎨',
    '学习用品': '✏️',
    '数字词汇': '🔢',
    '家庭成员': '👨‍👩‍👧‍👦',
    '身体部位': '🤚',
    '交通工具': '🚗',
    '天气词汇': '🌤️'
  }
  return emojiMap[courseName] || '📚'
}

// 获取课程描述
const getCourseDescription = (courseName) => {
  const descriptions = {
    '基础词汇': '适合初学者的基础英语单词',
    '日常用语': '日常生活中常用的词汇表达',
    '食物词汇': '各种食物和餐饮相关词汇',
    '动物词汇': '常见动物的英文名称',
    '颜色词汇': '基本和常用颜色词汇',
    '学习用品': '学习和办公用品相关词汇',
    '数字词汇': '基础数字和计数相关词汇',
    '家庭成员': '家庭关系和亲属称谓词汇',
    '身体部位': '人体各个部位的英文名称',
    '交通工具': '各种交通出行工具词汇',
    '天气词汇': '天气现象和气候相关词汇'
  }
  return descriptions[courseName] || '精选词汇课程'
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

// 显示课程选择提示
const showCourseSelectedToast = (courseName) => {
  // 创建临时提示元素
  const toast = document.createElement('div')
  toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300'
  toast.textContent = `已选择课程：${courseName}`
  document.body.appendChild(toast)

  // 动画显示
  setTimeout(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translate(-50%, 0)'
  }, 10)

  // 3秒后移除
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translate(-50%, -20px)'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

// 监听每日学习目标变化
watch(dailyGoal, (newValue) => {
  if (newValue >= 5 && newValue <= 50) {
    setDailyGoal(newValue)
  }
})
</script>

<style scoped>
.course-selection-page {
  min-height: 100vh;
  padding-bottom: 80px; /* 为底部导航留出空间 */
}

.page-header {
  animation: slideDown 0.4s ease-out;
}

.courses-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

.course-card {
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.4s ease-out;
}

.course-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s;
}

.course-card:hover::before {
  left: 100%;
}

.course-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}

.selected-indicator {
  animation: checkmark 0.3s ease-out;
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

@keyframes checkmark {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
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
@media (min-width: 768px) {
  .courses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 380px) {
  .course-card {
    padding: 1rem;
  }

  .text-lg {
    font-size: 1rem;
  }
}
</style>