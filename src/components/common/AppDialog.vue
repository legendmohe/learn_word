<template>
  <!-- 遮罩层 -->
  <div v-if="show" class="dialog-overlay" @click="handleOverlayClick">
    <!-- 对话框主体 -->
    <div
      class="dialog-container"
      :class="[`dialog-${type}`, { 'dialog-entering': isEntering }]"
      @click.stop
    >
      <!-- 标题区域 -->
      <div class="dialog-header">
        <div class="dialog-icon">
          <!-- 信息图标 -->
          <svg v-if="type === 'info'" class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <!-- 警告图标 -->
          <svg v-else-if="type === 'warning'" class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <!-- 错误图标 -->
          <svg v-else-if="type === 'error'" class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
          </svg>
        </div>
        <h3 class="dialog-title">{{ title }}</h3>
      </div>

      <!-- 内容区域 -->
      <div class="dialog-content">
        <div class="dialog-message" v-html="message"></div>
      </div>

      <!-- 按钮区域 -->
      <div class="dialog-footer">
        <button
          v-if="showCancel"
          @click="handleCancel"
          class="dialog-button cancel-button"
        >
          {{ cancelText }}
        </button>
        <button
          @click="handleConfirm"
          class="dialog-button confirm-button"
          :class="{ 'full-width': !showCancel }"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { TIMING, TOUCH, ANIMATION } from '../../config/constants'

// Props 定义
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'warning', 'error'].includes(value)
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

// Emits 定义
const emit = defineEmits(['confirm', 'cancel', 'close'])

// 响应式数据
const isEntering = ref(false)

// 处理确认按钮点击
const handleConfirm = () => {
  emit('confirm')
  closeDialog()
}

// 处理取消按钮点击
const handleCancel = () => {
  emit('cancel')
  closeDialog()
}

// 处理遮罩点击
const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    closeDialog()
  }
}

// 关闭对话框
const closeDialog = () => {
  emit('close')
}

// 监听显示状态变化，添加进入动画
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 下一个渲染帧后添加动画类
    setTimeout(() => {
      isEntering.value = true
    }, TIMING.ANIMATION_FRAME_DELAY)
  } else {
    isEntering.value = false
  }
})

// 组件挂载时的处理
onMounted(() => {
  if (props.show) {
    setTimeout(() => {
      isEntering.value = true
    }, TIMING.ANIMATION_FRAME_DELAY)
  }
})
</script>

<style scoped>
/* 遮罩层 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
  opacity: 1;
  transition: opacity 0.3s ease;
}

/* 对话框容器 */
.dialog-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 320px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  transform: scale(0.9) translateY(20px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-container.dialog-entering {
  transform: scale(1) translateY(0);
  opacity: 1;
}

/* 深色主题 */
@media (prefers-color-scheme: dark) {
  .dialog-container {
    background: rgba(31, 41, 55, 0.95);
    border: 1px solid rgba(75, 85, 99, 0.3);
  }
}

/* 标题区域 */
.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.1);
}

/* 深色主题边框 */
@media (prefers-color-scheme: dark) {
  .dialog-header {
    border-bottom-color: rgba(75, 85, 99, 0.3);
  }
}

/* 图标样式 */
.dialog-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

/* 信息类型图标 */
.dialog-info .dialog-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

/* 警告类型图标 */
.dialog-warning .dialog-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

/* 错误类型图标 */
.dialog-error .dialog-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.icon {
  width: 20px;
  height: 20px;
}

/* 标题文本 */
.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}

@media (prefers-color-scheme: dark) {
  .dialog-title {
    color: #f9fafb;
  }
}

/* 内容区域 */
.dialog-content {
  padding: 16px 20px;
}

.dialog-message {
  font-size: 15px;
  line-height: 1.5;
  color: #6b7280;
  margin: 0;
}

.dialog-message :deep(strong) {
  color: #374151;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  .dialog-message {
    color: #d1d5db;
  }

  .dialog-message :deep(strong) {
    color: #f3f4f6;
  }
}

/* 按钮区域 */
.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px 20px 20px;
}

/* 按钮基础样式 */
.dialog-button {
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px; /* 触控友好的最小高度 */
}

/* 取消按钮 */
.cancel-button {
  background: rgba(156, 163, 175, 0.1);
  color: #6b7280;
}

.cancel-button:hover {
  background: rgba(156, 163, 175, 0.15);
  transform: translateY(-1px);
}

@media (prefers-color-scheme: dark) {
  .cancel-button {
    background: rgba(107, 114, 128, 0.2);
    color: #d1d5db;
  }

  .cancel-button:hover {
    background: rgba(107, 114, 128, 0.3);
  }
}

/* 确认按钮 - 信息类型 */
.dialog-info .confirm-button {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.dialog-info .confirm-button:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* 确认按钮 - 警告类型 */
.dialog-warning .confirm-button {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.dialog-warning .confirm-button:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* 确认按钮 - 错误类型 */
.dialog-error .confirm-button {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.dialog-error .confirm-button:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* 全宽按钮（仅确认按钮时） */
.confirm-button.full-width {
  flex: 1;
}

/* 按钮激活状态 */
.dialog-button:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 380px) {
  .dialog-overlay {
    padding: 12px;
  }

  .dialog-container {
    max-width: 100%;
  }

  .dialog-header {
    padding: 16px;
  }

  .dialog-content {
    padding: 12px 16px;
  }

  .dialog-footer {
    padding: 12px 16px 16px 16px;
  }

  .dialog-button {
    padding: 10px 14px;
    font-size: 14px;
  }
}

/* 深色主题下的遮罩层 */
@media (prefers-color-scheme: dark) {
  .dialog-overlay {
    background: rgba(0, 0, 0, 0.6);
  }
}
</style>