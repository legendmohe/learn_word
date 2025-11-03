<template>
  <div class="study-page">
    <!-- 顶部导航栏 -->
    <StudyHeader
      :progress="studyProgress"
      :is-exiting="isExiting"
      @request-exit="handleRequestExit"
      @exit="handleExit"
    />

    <!-- 学习内容区域 -->
    <main class="study-content">
      <TodayStudy
        v-if="studyStatus === 'ready' || studyStatus === 'studying' || studyStatus === 'completed'"
        :course-id="courseId"
        :auto-start="shouldAutoStart"
        :show-welcome="shouldShowWelcome"
        @completed="handleStudyCompleted"
        @study-status-changed="handleStudyStatusChanged"
        @progress-update="updateProgressFromTodayStudy"
      />

      <!-- 欢迎引导（如果需要的话） -->
      <WelcomeGuide
        v-if="showWelcomeGuide"
        @completed="handleWelcomeCompleted"
      />

    </main>

    <!-- 退出确认对话框（通过 useDialog 管理） -->
    <DialogManager :dialogs="dialogs" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import StudyHeader from '../components/StudyHeader.vue'
import TodayStudy from '../components/TodayStudy.vue'
import WelcomeGuide from '../components/WelcomeGuide.vue'
import DialogManager from '../components/common/DialogManager.vue'
import { useDialog } from '../composables/useDialog'
import { getSelectedCourse, setSelectedCourse } from '../utils/studyData'
import { clearStudySession } from '../utils/studyData'
import { getAllCourses } from '../utils/coursesParser'

// Props
const props = defineProps({
  courseId: {
    type: String,
    default: null
  }
})

const router = useRouter()
const route = useRoute()
const { warning, dialogs } = useDialog()

// 响应式数据
const studyStatus = ref('ready') // ready, studying, completed
const isExiting = ref(false)
const showWelcomeGuide = ref(false)
const studyProgress = ref({
  current: 0,
  total: 0
})

// 计算属性
const courseId = computed(() => {
  return props.courseId || getSelectedCourse()?.id || 'default'
})

const shouldAutoStart = computed(() => {
  return route.query.autoStart === 'true'
})

const shouldShowWelcome = computed(() => {
  return route.query.showWelcome === 'true'
})

// 监听课程ID变化
watch(courseId, (newCourseId) => {
  if (newCourseId) {
    // 设置选中的课程
    const courses = getAllCourses()
    const course = courses.find(c => c.id === newCourseId)
    if (course) {
      setSelectedCourse(course)
    }
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  console.log('🎯 [StudyPage] 页面加载完成:', {
    courseId: courseId.value,
    routeParams: route.params,
    timestamp: Date.now()
  })

  // 检查是否需要显示欢迎引导
  checkWelcomeGuide()

  // 监听浏览器返回按钮
  window.addEventListener('popstate', handleBrowserBack)
})

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener('popstate', handleBrowserBack)
})

// 方法
const checkWelcomeGuide = () => {
  // 检查用户是否第一次使用
  const hasShownWelcome = localStorage.getItem('learn_word_welcome_shown')
  if (!hasShownWelcome) {
    showWelcomeGuide.value = true
  }
}

const handleWelcomeCompleted = () => {
  showWelcomeGuide.value = false
  localStorage.setItem('learn_word_welcome_shown', 'true')
}

const handleStudyCompleted = (result) => {
  console.log('🏆 [StudyPage] 学习完成:', result)
  studyStatus.value = 'completed'

  // 学习完成后的处理可以在这里添加
  // 比如显示完成统计、分享选项等
}

const handleStudyStatusChanged = (status) => {
  console.log('📊 [StudyPage] 学习状态变化:', status)
  studyStatus.value = status

  // 更新进度信息
  if (status === 'studying') {
    updateProgress()
  }
}

const updateProgress = () => {
  // 这里需要从 TodayStudy 组件获取进度信息
  // 可以通过事件或者全局状态管理来实现
  // 暂时使用模拟数据
  studyProgress.value = {
    current: 1,
    total: 10
  }
}

const handleRequestExit = async () => {
  console.log('📱 [StudyPage] 收到退出请求，显示确认对话框')

  try {
    const result = await warning(
      '确认退出学习',
      '退出后本次学习进度将丢失，确定退出吗？',
      {
        confirmText: '确定退出',
        cancelText: '继续学习',
        showCancel: true
      }
    )

    console.log('📝 [StudyPage] warning 返回结果:', result)

    if (result) {
      console.log('✅ [StudyPage] 用户确认退出')
      handleExit()
    } else {
      console.log('❌ [StudyPage] 用户取消退出')
    }
  } catch (error) {
    console.error('❌ [StudyPage] 退出确认对话框出错:', error)
  }
}

const handleExit = async () => {
  console.log('🚪 [StudyPage] 用户确认退出学习')
  isExiting.value = true

  try {
    // 清理学习会话（不计入统计）
    clearStudySession()

    // 清理其他相关数据
    // 这里可以添加更多的清理逻辑

    console.log('✅ [StudyPage] 学习会话已清理')

    // 返回主页
    router.push({ name: 'Home' })
  } catch (error) {
    console.error('❌ [StudyPage] 退出学习时出错:', error)
    // 即使出错也要尝试返回主页
    router.push({ name: 'Home' })
  } finally {
    isExiting.value = false
  }
}

const handleBrowserBack = (event) => {
  // 防止用户通过浏览器返回键意外退出
  event.preventDefault()

  // 可以在这里添加自定义的返回处理逻辑
  console.log('🔙 [StudyPage] 检测到浏览器返回操作')
}

// 今天Study组件需要传递进度信息
const updateProgressFromTodayStudy = (progress) => {
  studyProgress.value = {
    current: progress.current || 0,
    total: progress.total || 0
  }
}

</script>

<style scoped>
.study-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  position: relative;
  overflow: hidden;
}

.dark .study-page {
  background: #111827;
}

.study-content {
  flex: 1;
  margin-top: 60px; /* 为顶部导航栏留出空间 */
  padding: 0 20px 20px; /* 左右内边距20px，底部内边距20px */
  overflow-y: auto;
  position: relative;
  max-width: 100%; /* 确保不超出视口宽度 */
}

/* 全局样式重置 */
.study-page * {
  box-sizing: border-box;
}

/* 移除可能的滚动条样式 */
.study-content::-webkit-scrollbar {
  width: 0;
  display: none;
}

.study-content {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .study-page {
    height: 100vh;
    height: 100dvh; /* 使用动态视口高度 */
  }

  .study-content {
    margin-top: 56px; /* 移动端顶部导航栏较小 */
    padding: 0 16px 16px; /* 移动端使用较小的内边距 */
  }
}

@media (max-width: 380px) {
  .study-content {
    margin-top: 52px; /* 超小屏幕进一步调整 */
    padding: 0 12px 12px; /* 超小屏幕使用更小的内边距 */
  }
}

/* 大屏幕优化 */
@media (min-width: 768px) {
  .study-content {
    padding: 0 32px 32px; /* 平板和桌面端使用更大的内边距 */
    max-width: 1200px; /* 限制最大宽度，避免在大屏幕上文字过于分散 */
    margin-left: auto;
    margin-right: auto;
  }
}

@media (min-width: 1024px) {
  .study-content {
    padding: 0 48px 48px; /* 桌面端使用更大的内边距 */
  }
}
</style>