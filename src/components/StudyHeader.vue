<template>
  <header class="study-header">
    <div class="header-content">
      <!-- 左侧：课程信息和进度 -->
      <div class="header-left">
        <div class="course-info">
          <span class="course-name">{{ courseName }}</span>
          <span class="progress-text">{{ progressText }}</span>
        </div>
      </div>

      <!-- 右侧：退出按钮 -->
      <div class="header-right">
        <button
          @click.stop="confirmExit"
          class="exit-button"
          :disabled="isExiting"
        >
          <svg class="exit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          退出学习
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { getSelectedCourse } from '../utils/studyData'

// Props
const props = defineProps({
  progress: {
    type: Object,
    default: () => ({
      current: 0,
      total: 0
    })
  },
  isExiting: {
    type: Boolean,
    default: false
  }
})


// 计算属性
const courseName = computed(() => {
  const selectedCourse = getSelectedCourse()
  return selectedCourse?.name || '默认课程'
})

const progressText = computed(() => {
  if (!props.progress.total) return '准备开始'
  return `${props.progress.current}/${props.progress.total} 单词`
})

// 方法
const confirmExit = () => {
  console.log('🔄 [StudyHeader] confirmExit 开始')
  // 触发请求确认退出的事件，让父组件处理确认对话框
  emit('request-exit')
}

// 事件
const emit = defineEmits(['exit', 'request-exit'])
</script>

<style scoped>
.study-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 60px;
}

.dark .study-header {
  background: rgba(17, 24, 39, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 20px;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.course-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.course-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.dark .course-name {
  color: #f9fafb;
}

.progress-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.dark .progress-text {
  color: #9ca3af;
}

.header-right {
  flex-shrink: 0;
}

.exit-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.exit-button:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.exit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.exit-icon {
  width: 16px;
  height: 16px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .header-content {
    padding: 0 16px;
  }

  .course-name {
    font-size: 16px;
    max-width: 150px;
  }

  .progress-text {
    font-size: 12px;
  }

  .exit-button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .exit-icon {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 380px) {
  .course-name {
    max-width: 120px;
  }

  .exit-button span {
    display: none; /* 在小屏幕上只显示图标 */
  }
}
</style>