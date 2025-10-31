<template>
  <div class="test-step">
    <div class="question-area text-center mb-8">
      <div class="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-6">
        {{ word.word }}
      </div>
      <div class="text-lg text-gray-600 dark:text-gray-400">
        选择正确的中文意思
      </div>
    </div>

    <div class="options-grid grid grid-cols-2 gap-4 mb-8">
      <button
        v-for="(option, index) in options"
        :key="index"
        @click="selectOption(index)"
        :disabled="showResult"
        class="option-button p-4 rounded-lg border-2 transition-all duration-200 text-left"
        :class="{
          'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600': !showResult,
          'border-green-500 bg-green-50 dark:bg-green-900/20': showResult && index === correctIndex,
          'border-red-500 bg-red-50 dark:bg-red-900/20': showResult && selectedIndex === index && index !== correctIndex,
          'opacity-50 cursor-not-allowed': showResult
        }"
      >
        <div class="flex items-center">
          <span class="option-label mr-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                :class="{
                  'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400': !showResult,
                  'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': showResult && index === correctIndex,
                  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400': showResult && selectedIndex === index && index !== correctIndex,
                  'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400': showResult && index !== correctIndex && selectedIndex !== index
                }">
            {{ String.fromCharCode(65 + index) }}
          </span>
          <span class="option-text text-gray-800 dark:text-gray-200">
            {{ option }}
          </span>
        </div>
      </button>
    </div>

    <!-- 结果反馈 -->
    <div v-if="showResult" class="result-feedback text-center mb-8">
      <div v-if="isCorrect" class="success-message">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
          回答正确
        </div>
      </div>
      <div v-else class="error-message">
        <div class="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
          错了~
        </div>
        <div class="text-gray-600 dark:text-gray-400">
          正确答案是：{{ word.meaning }}
        </div>
      </div>
    </div>

    <div class="action-buttons flex justify-center">
      <button
        v-if="!showResult"
        @click="submitAnswer"
        :disabled="selectedIndex === null"
        class="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        提交答案
      </button>
      <button
        v-else
        @click="completeStep"
        class="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        {{ countdown > 0 ? `下一步 (${countdown}s)` : '下一步' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'TestStep',
  props: {
    word: {
      type: Object,
      required: true
    },
    // 用于生成干扰项的其他单词
    otherWords: {
      type: Array,
      default: () => []
    },
    // 初始状态（用于恢复用户的选择）
    initialState: {
      type: Object,
      default: () => ({
        selectedIndex: null,
        showResult: false,
        completed: false,
        options: [] // 保存选项顺序
      })
    }
  },
  emits: ['completed', 'answer'],
  setup(props, { emit }) {
    const selectedIndex = ref(props.initialState?.selectedIndex)
    const showResult = ref(props.initialState?.showResult)
    const options = ref([])
    const countdown = ref(0)
    let countdownTimer = null

    // 获取干扰选项
    const generateOptions = () => {
      // 如果有保存的选项顺序，直接使用
      if (props.initialState.options && props.initialState.options.length > 0) {
        options.value = props.initialState.options
        return
      }

      const correctAnswer = props.word.meaning
      const distractors = []

      // 从其他单词中获取干扰项
      if (props.otherWords && props.otherWords.length > 0) {
        const availableWords = props.otherWords.filter(w => w.meaning !== correctAnswer)

        // 随机选择3个干扰项
        for (let i = 0; i < Math.min(3, availableWords.length); i++) {
          const randomIndex = Math.floor(Math.random() * availableWords.length)
          distractors.push(availableWords[randomIndex].meaning)
          availableWords.splice(randomIndex, 1)
        }
      }

      // 如果没有足够的干扰项，使用一些常见的干扰词
      const commonDistractors = ['书', '桌子', '椅子', '电脑', '手机', '房子', '汽车', '食物']
      while (distractors.length < 3) {
        const randomWord = commonDistractors[Math.floor(Math.random() * commonDistractors.length)]
        if (!distractors.includes(randomWord) && randomWord !== correctAnswer) {
          distractors.push(randomWord)
        }
      }

      // 组合正确答案和干扰项
      const allOptions = [correctAnswer, ...distractors.slice(0, 3)]

      // 随机排序
      for (let i = allOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]]
      }

      options.value = allOptions
    }

    const correctIndex = computed(() => {
      return options.value.findIndex(option => option === props.word.meaning)
    })

    const isCorrect = computed(() => {
      return selectedIndex.value === correctIndex.value
    })

    const selectOption = (index) => {
      if (showResult.value) return
      selectedIndex.value = index
    }

    const submitAnswer = () => {
      if (selectedIndex.value === null) return
      showResult.value = true

      // 发送答案结果
      emit('answer', {
        word: props.word.word,
        correct: isCorrect.value,
        selectedAnswer: options.value[selectedIndex.value],
        correctAnswer: props.word.meaning,
        selectedIndex: selectedIndex.value, // 添加选中的索引
        options: options.value, // 保存选项顺序
        type: 'test'
      })

      // 开始3秒倒计时自动跳转
      startCountdown()
    }

    const startCountdown = () => {
      // 答对时2秒自动跳转，答错时不跳转（只显示提示）
      const autoJumpTime = isCorrect.value ? 2 : null
      countdown.value = autoJumpTime || 0

      if (autoJumpTime) {
        countdownTimer = setInterval(() => {
          countdown.value--
          if (countdown.value <= 0) {
            clearInterval(countdownTimer)
            countdownTimer = null
            completeStep()
          }
        }, 1000)
      }
    }

    const completeStep = () => {
      // 清除倒计时
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
      emit('completed')
    }

    onMounted(() => {
      generateOptions()
    })

    onUnmounted(() => {
      // 清理倒计时定时器
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    })

    return {
      selectedIndex,
      showResult,
      options,
      correctIndex,
      isCorrect,
      countdown,
      selectOption,
      submitAnswer,
      completeStep
    }
  }
}
</script>

<style scoped>
.test-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  max-width: 500px;
  margin: 0 auto;
}

.option-button {
  transition: all 0.2s ease;
  min-height: 60px;
}

.option-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.15);
}

.option-button:active:not(:disabled) {
  transform: translateY(0);
}

.option-label {
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .option-button {
    min-height: 50px;
    padding: 12px;
  }

  .option-label {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .option-text {
    font-size: 15px;
  }
}

</style>