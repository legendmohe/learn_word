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

      <!-- 搜索框 -->
      <div class="search-container">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索课程名称或描述..."
            class="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
            <!-- 搜索加载状态 -->
            <div v-if="searchLoading" class="search-loading">
              <svg class="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <!-- 清除按钮 -->
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
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
    <div class="courses-list">
      <!-- 搜索结果统计 -->
      <div v-if="searchQuery" class="search-result-info mb-4 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          找到 {{ filteredCourses.length }} 个相关课程
        </p>
      </div>

      <!-- 无搜索结果提示 -->
      <div v-if="searchQuery && filteredCourses.length === 0" class="no-results glass-effect rounded-xl p-8 card-shadow text-center mb-6">
        <div class="text-4xl mb-4">🔍</div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">未找到相关课程</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          尝试使用其他关键词搜索
        </p>
        <button
          @click="clearSearch"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          清除搜索
        </button>
      </div>

      <div
        v-for="course in filteredCourses"
        :key="course.name"
        @click="selectCourse(course)"
        class="course-item glass-effect rounded-xl p-4 card-shadow cursor-pointer transform transition-all duration-200 hover:shadow-xl hover:translate-x-1"
        :class="{ 'ring-2 ring-primary-500': selectedCourse === course.name }"
      >
        <div class="flex items-center gap-4">
          <!-- 课程图标 -->
          <div class="course-icon flex-shrink-0">
            <div class="w-12 h-12 rounded-full bg-gradient-to-r from-primary-400 to-accent-400 flex items-center justify-center text-white text-lg font-bold">
              {{ getCourseEmoji(course.name) }}
            </div>
          </div>

          <!-- 课程信息 -->
          <div class="course-info flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200 truncate">
                <span v-html="highlightText(course.name, searchQuery)"></span>
              </h3>
              <div v-if="selectedCourse === course.name" class="selected-indicator flex-shrink-0 ml-2">
                <svg class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
              <span v-html="highlightText(getCourseDescription(course.name), searchQuery)"></span>
            </p>

            <!-- 课程统计和进度 -->
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ course.wordCount }} 个单词
              </span>

              <!-- 学习进度条 -->
              <div v-if="getCourseProgress(course.name) > 0" class="flex items-center gap-2 flex-1 max-w-[120px]">
                <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    class="bg-gradient-to-r from-primary-500 to-accent-500 h-1.5 rounded-full transition-all duration-300"
                    :style="{ width: `${getCourseProgress(course.name)}%` }"
                  ></div>
                </div>
                <span class="text-xs font-medium text-primary-600 dark:text-primary-400">
                  {{ getCourseProgress(course.name) }}%
                </span>
              </div>
            </div>
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
import { ref, onMounted, watch, computed } from 'vue'
import { getAllCourses, getCourseByName } from '../utils/coursesParser'
import { getSelectedCourse, setSelectedCourse, getDailyGoal, setDailyGoal, getLearnedWords } from '../utils/studyData'

// 防抖函数
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 定义事件
const emit = defineEmits(['back', 'course-selected'])

// 课程数据
const courses = ref([])
const selectedCourse = ref('')

// 搜索功能
const searchQuery = ref('')
const searchLoading = ref(false)
const debouncedSearch = ref('')

// 学习设置
const dailyGoal = ref(10)
const smartReviewEnabled = ref(true)

// 计算属性：过滤后的课程列表
const filteredCourses = computed(() => {
  if (!debouncedSearch.value.trim()) {
    return courses.value
  }

  const query = debouncedSearch.value.toLowerCase().trim()
  return courses.value.filter(course => {
    // 搜索课程名称
    const nameMatch = course.name.toLowerCase().includes(query)
    // 搜索课程描述
    const descriptionMatch = getCourseDescription(course.name).toLowerCase().includes(query)
    // 搜索单词数量（如果输入的是数字）
    const wordCountMatch = !isNaN(query) && course.wordCount.toString().includes(query)

    return nameMatch || descriptionMatch || wordCountMatch
  })
})

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

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
  debouncedSearch.value = ''
  searchLoading.value = false
}

// 高亮搜索关键词
const highlightText = (text, query) => {
  if (!query || !query.trim()) {
    return text
  }

  const regex = new RegExp(`(${query.trim()})`, 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
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
  const course = getCourseByName(courseName)
  return course ? course.emoji : '📚'
}

// 获取课程描述
const getCourseDescription = (courseName) => {
  const course = getCourseByName(courseName)
  return course ? course.description : '精选词汇课程'
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

// 防抖搜索处理
const handleSearch = debounce((query) => {
  debouncedSearch.value = query
  searchLoading.value = false
}, 300)

// 监听搜索输入变化
watch(searchQuery, (newValue) => {
  if (newValue.trim()) {
    searchLoading.value = true
  }
  handleSearch(newValue)
})

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

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.course-item {
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.4s ease-out;
}

.course-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s;
}

.course-item:hover::before {
  left: 100%;
}

.course-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

/* 搜索相关样式 */
.search-container {
  animation: fadeIn 0.3s ease-out;
}

.search-highlight {
  background-color: #fef08a;
  color: #713f12;
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 600;
}

.dark .search-highlight {
  background-color: #713f12;
  color: #fef08a;
}

.search-result-info {
  animation: slideDown 0.3s ease-out;
}

.no-results {
  animation: fadeIn 0.4s ease-out;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
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
  .course-item {
    padding: 0.75rem;
  }

  .course-icon div {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .text-base {
    font-size: 0.875rem;
  }

  .text-sm {
    font-size: 0.75rem;
  }

  .search-container input {
    padding-left: 2.5rem;
    padding-right: 3rem;
    font-size: 0.875rem;
  }
}
</style>