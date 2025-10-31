<template>
  <div class="step-indicator">
    <!-- 步骤点 -->
    <div class="step-dots">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="step-dot"
        :class="{
          'active': currentStep === index,
          'completed': isStepCompleted(index),
          'clickable': false
        }"
      >
        <!-- 步骤图标 -->
        <div class="step-icon">
          <svg v-if="isStepCompleted(index)" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <span v-else>{{ index + 1 }}</span>

          <!-- 错误指示器 -->
          <div v-if="stepErrors[step.id]" class="error-indicator">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </div>

    
          </div>

        <!-- 步骤标签 -->
        <div class="step-label">{{ step.label }}</div>

        </div>
    </div>

    <!-- 导航按钮 -->
    <div class="navigation-buttons">
      <button
        class="nav-btn prev-btn"
        :disabled="currentStep === 0"
        @click="goToPreviousStep"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
        上一步
      </button>

      <button
        class="nav-btn next-btn"
        :disabled="!isStepCompleted(currentStep)"
        @click="goToNextStep"
      >
        {{ isLastStep ? '完成学习' : (currentStep === steps.length - 1 ? '下一个单词' : '下一步') }}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StepIndicator',
  props: {
    currentStep: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0 && value <= 3
    },
    stepProgress: {
      type: Object,
      default: () => ({
        listen: false,
        test: false,
        phonics: false,
        spelling: false
      })
    },
    allowStepNavigation: {
      type: Boolean,
      default: true
    },
    stepErrors: {
      type: Object,
      default: () => ({
        test: false,
        phonics: false,
        spelling: false
      })
    },
    isLastStep: {
      type: Boolean,
      default: false
    }
  },
  emits: ['step-change', 'previous-step', 'next-step'],
  data() {
    return {
      steps: [
        {
          id: 'listen',
          label: '听音学义',
          description: '听发音，记词义'
        },
        {
          id: 'test',
          label: '小测试',
          description: '选词义，验理解'
        },
        {
          id: 'phonics',
          label: '拆分拼写',
          description: '拼音素，记结构'
        },
        {
          id: 'spelling',
          label: '全字母拼',
          description: '完整拼写，巩固记忆'
        }
      ]
    }
  },
  computed: {
    progressPercentage() {
      const completedSteps = Object.values(this.stepProgress).filter(Boolean).length
      return (completedSteps / this.steps.length) * 100
    },
    isDev() {
      return import.meta.env.DEV
    }
  },
    methods: {
    isStepCompleted(index) {
      // 添加边界检查
      if (index < 0 || index >= this.steps.length) {
        return false
      }
      const stepId = this.steps[index].id
      return this.stepProgress[stepId] === true
    },

    canClickStep(index) {
      if (!this.allowStepNavigation) return false

      // 添加安全检查，确保index和currentStep有效
      if (index < 0 || index >= this.steps.length || typeof this.currentStep !== 'number') {
        return false
      }

      // 只允许点击：
      // 1. 已完成的步骤（可以回顾）
      // 2. 紧邻的下一步，但前提是当前步骤已完成
      const isNextStep = index === this.currentStep + 1 && this.isStepCompleted(this.currentStep)
      const isCompleted = this.isStepCompleted(index)

      return isCompleted || isNextStep
    },

    handleStepClick(index) {
      if (this.canClickStep(index)) {
        this.$emit('step-change', index)
      }
    },

    goToPreviousStep() {
      if (this.currentStep > 0) {
        this.$emit('previous-step')
      }
    },

    goToNextStep() {
      // 添加安全检查，确保currentStep有效
      if (typeof this.currentStep === 'number' && this.currentStep >= 0 && this.currentStep < this.steps.length) {
        // 只要当前步骤完成就允许进入下一步
        if (this.isStepCompleted(this.currentStep)) {
          this.$emit('next-step')
        }
      }
    }
  }
}
</script>

<style scoped>
.step-indicator {
  width: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.8);
}

.dark .step-indicator {
  background: rgba(31, 41, 55, 0.8);
  border: 1px solid rgba(75, 85, 99, 0.8);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  margin-bottom: 20px;
  overflow: hidden;
}

.dark .progress-bar {
  background: #374151;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.step-dots {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
}

.step-dots::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 30px;
  right: 30px;
  height: 2px;
  background: #e5e7eb;
  z-index: 0;
}

.dark .step-dots::before {
  background: #374151;
}

.step-dot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 1;
  flex: 1;
  cursor: default;
  transition: all 0.2s ease;
  min-width: 50px;
}

.step-dot.clickable {
  cursor: pointer;
}

.step-dot.clickable:hover {
  transform: translateY(-2px);
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #d1d5db;
  transition: all 0.2s ease;
  position: relative;
}

.dark .step-icon {
  background: #374151;
  color: #9ca3af;
  border: 2px solid #4b5563;
}

.error-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  color: white;
  animation: errorPulse 2s infinite;
}

.dark .error-indicator {
  border-color: #1f2937;
}

@keyframes errorPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.step-dot.active .step-icon {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.step-dot.completed .step-icon {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.step-label {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  line-height: 1.2;
  transition: color 0.2s ease;
}

.dark .step-label {
  color: #d1d5db;
}

.step-dot.active .step-label,
.step-dot.completed .step-label {
  color: #111827;
}

.dark .step-dot.active .step-label,
.dark .step-dot.completed .step-label {
  color: #f9fafb;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
  justify-content: center;
}

.dark .nav-btn {
  border: 1px solid #4b5563;
  background: #1f2937;
  color: #d1d5db;
}

.nav-btn:hover:not(:disabled) {
  background: #f9fafb;
  transform: translateY(-1px);
}

.dark .nav-btn:hover:not(:disabled) {
  background: #374151;
}

.nav-btn:active:not(:disabled) {
  transform: translateY(0);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f3f4f6;
}

.dark .nav-btn:disabled {
  background: #374151;
}

.next-btn {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  margin-left: auto;
}

.next-btn:disabled {
  background: #93c5fd;
  border-color: #93c5fd;
  color: #dbeafe;
}

.next-btn:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}


.prev-btn svg {
  order: -1;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .step-indicator {
    padding: 12px;
  }

  .step-dots {
    gap: 4px;
  }

  .step-icon {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .step-label {
    font-size: 10px;
  }

  .navigation-buttons {
    gap: 8px;
  }

  .nav-btn {
    padding: 8px 12px;
    font-size: 13px;
    min-width: 80px;
  }
}

@media (max-width: 380px) {
  .step-label {
    font-size: 9px;
  }

  .navigation-buttons {
    gap: 6px;
  }

  .nav-btn {
    padding: 8px 10px;
    font-size: 12px;
    min-width: 70px;
  }
}
</style>