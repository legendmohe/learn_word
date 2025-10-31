<template>
  <div class="phonics-step">
    <div class="word-display text-center mb-8">
      <!-- WordCard 单词显示 -->
      <div class="flex justify-center">
        <WordCard
          :word="word"
          size="large"
          :show-phonemes="true"
          :show-audio="showResult"
          :show-meaning="true"
          :show-english-word="showResult"
        />
      </div>
    </div>

    <div class="phonics-info text-center">
      <div class="text-base text-gray-600 dark:text-gray-400 mb-4">
        按照音素顺序拼写出单词
      </div>

      <!-- 显示音素拆分 -->
      <div v-if="word.phonemes && word.phonemes.length > 0" class="phonemes-display">
        <!-- <div class="text-sm text-gray-500 dark:text-gray-400 mb-3">
          音素拆分：
        </div>
        <div class="flex gap-2 justify-center flex-wrap mb-4">
          <span
            v-for="(phoneme, index) in word.phonemes"
            :key="index"
            class="phoneme-chip px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-md text-sm font-medium"
          >
            {{ phoneme }}
          </span>
        </div> -->
      </div>
      <div v-else class="no-phonics-message text-sm text-yellow-600 dark:text-yellow-400 mb-4">
        ⚠️ 此单词暂无音素拆分，跳过此步骤
      </div>
    </div>

    
      <!-- 答案显示区域 -->
      <div class="answer-display mb-4">
        <div class="selected-phonemes flex gap-2 justify-center min-h-[40px] items-center">
          <span
            v-for="(phoneme, index) in selectedPhonemes"
            :key="index"
            class="selected-phoneme px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium"
          >
            {{ phoneme }}
          </span>
          <span v-if="selectedPhonemes.length === 0" class="text-gray-400 dark:text-gray-500 text-sm">
            点击音素进行拼写
          </span>
        </div>
      </div>

    <!-- 音素拼写输入区域 -->
    <div v-if="word.phonemes && word.phonemes.length > 0" class="phonics-input-area">
      <div class="phonics-grid grid gap-3 justify-center mb-6">
        <button
          v-for="(phoneme, index) in shuffledPhonemes"
          :key="phoneme"
          @click="selectPhoneme(phoneme, index)"
          :disabled="usedPhonemes.includes(index) || showResult"
          class="phoneme-button px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium"
          :class="{
            'border-orange-300 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:border-orange-400 hover:shadow-md': !usedPhonemes.includes(index) && !showResult,
            'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed': usedPhonemes.includes(index) && !showResult,
            'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400': showResult && isCorrect,
            'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400': showResult && !isCorrect
          }"
        >
          {{ phoneme }}
        </button>
      </div>

    </div>

    <!-- 结果反馈 -->
    <div v-if="showResult" class="result-feedback text-center mb-8">
      <div v-if="isCorrect" class="success-message">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400 mb-2 animate-bounce">
          拼写正确
        </div>
      </div>
      <div v-else-if="hasPhonemes" class="error-message">
        <div class="text-2xl font-bold text-red-600 dark:text-red-400 mb-2 animate-bounce">
          错了~
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons flex justify-center gap-4">
      <!-- 无音素情况：直接显示跳过按钮 -->
      <button
        v-if="!hasPhonemes"
        @click="skipStep"
        class="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        跳过此步骤
      </button>

      <!-- 有音素情况的逻辑 -->
      <template v-else>
        <button
          v-if="!showResult && selectedPhonemes.length > 0"
          @click="clearAnswer"
          class="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
        >
          清空
        </button>

        <button
          v-if="!showResult"
          @click="submitAnswer"
          :disabled="!canSubmit"
          class="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          提交答案
        </button>

        <button
          v-else
          @click="completeStep"
          class="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          {{ countdown > 0 ? `下一步 (${countdown}s)` : '下一步' }}
        </button>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import WordCard from './WordCard.vue'

export default {
  name: 'PhonicsStep',
  components: {
    WordCard
  },
  props: {
    word: {
      type: Object,
      required: true
    },
    // 初始状态（用于恢复用户的选择）
    initialState: {
      type: Object,
      default: () => ({
        selectedPhonemes: [],
        showResult: false,
        completed: false
      })
    }
  },
  emits: ['completed', 'answer'],
  setup(props, { emit }) {
    const selectedPhonemes = ref(props.initialState?.selectedPhonemes || [])
    const usedPhonemes = ref([])
    const showResult = ref(props.initialState?.showResult || false)
    const isCorrect = ref(false)
    const shuffledPhonemes = ref([])
    const countdown = ref(0)
    let countdownTimer = null

    // 检查单词是否有音素数据
    const hasPhonemes = computed(() => {
      return props.word.phonemes && props.word.phonemes.length > 0
    })

    // 是否可以提交答案
    const canSubmit = computed(() => {
      return hasPhonemes.value && selectedPhonemes.value.length === props.word.phonemes.length
    })

    // 打乱音素顺序
    const shufflePhonemes = () => {
      if (!hasPhonemes.value) return

      const phonemes = [...props.word.phonemes]
      for (let i = phonemes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [phonemes[i], phonemes[j]] = [phonemes[j], phonemes[i]]
      }
      shuffledPhonemes.value = phonemes
    }

    // 选择音素
    const selectPhoneme = (phoneme, originalIndex) => {
      if (usedPhonemes.value.includes(originalIndex) || showResult.value) return

      selectedPhonemes.value.push(phoneme)
      usedPhonemes.value.push(originalIndex)
    }

    // 清空答案
    const clearAnswer = () => {
      selectedPhonemes.value = []
      usedPhonemes.value = []
      showResult.value = false
      isCorrect.value = false
    }

    // 提交答案
    const submitAnswer = () => {
      if (!canSubmit.value) return

      const userAnswer = selectedPhonemes.value.join('')
      const correctAnswer = props.word.phonemes.join('')

      isCorrect.value = userAnswer === correctAnswer
      showResult.value = true

      // 发送答案结果
      emit('answer', {
        word: props.word.word,
        correct: isCorrect.value,
        selectedAnswer: userAnswer,
        correctAnswer: correctAnswer,
        selectedPhonemes: selectedPhonemes.value, // 保存选中的音素
        type: 'phonics'
      })

      // 开始3秒倒计时自动跳转
      startCountdown()
    }

    // 开始倒计时
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

    // 完成步骤
    const completeStep = () => {
      // 清除倒计时
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
      emit('completed')
    }

    // 跳过步骤（无音素情况）
    const skipStep = () => {
      // 发送跳过的事件，标记为正确
      emit('answer', {
        word: props.word.word,
        correct: true,
        selectedAnswer: '',
        correctAnswer: '',
        selectedPhonemes: [],
        type: 'phonics',
        skipped: true
      })
      // 完成步骤
      emit('completed')
    }

    onMounted(() => {
      if (hasPhonemes.value) {
        shufflePhonemes()
        // 恢复usedPhonemes状态
        if (props.initialState?.selectedPhonemes && props.initialState.selectedPhonemes.length > 0) {
          usedPhonemes.value = []
          props.initialState.selectedPhonemes.forEach(selectedPhoneme => {
            const originalIndex = props.word.phonemes.findIndex(phoneme => phoneme === selectedPhoneme)
            if (originalIndex !== -1 && !usedPhonemes.value.includes(originalIndex)) {
              usedPhonemes.value.push(originalIndex)
            }
          })
        }

        // 如果初始状态显示结果，重新计算isCorrect
        if (props.initialState?.showResult) {
          const userAnswer = props.initialState.selectedPhonemes.join('')
          const correctAnswer = props.word.phonemes.join('')
          isCorrect.value = userAnswer === correctAnswer
        }
      }
    })

    onUnmounted(() => {
      // 清理倒计时定时器
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    })

    return {
      selectedPhonemes,
      usedPhonemes,
      showResult,
      isCorrect,
      shuffledPhonemes,
      hasPhonemes,
      canSubmit,
      countdown,
      selectPhoneme,
      clearAnswer,
      submitAnswer,
      completeStep,
      skipStep
    }
  }
}
</script>

<style scoped>
.phonics-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  max-width: 600px;
  margin: 0 auto;
}

.phonics-grid {
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  max-width: 500px;
}

.phoneme-button {
  transition: all 0.2s ease;
  user-select: none;
}

.phoneme-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.15);
}

.phoneme-button:active:not(:disabled) {
  transform: translateY(0);
}

.phoneme-chip {
  font-family: 'Courier New', monospace;
}

.selected-phoneme {
  font-family: 'Courier New', monospace;
}

.answer-display {
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .phonics-grid {
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: 8px;
  }

  .phoneme-button {
    padding: 8px 12px;
    font-size: 14px;
  }

  .selected-phonemes {
    gap: 8px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 250px;
  }

  .action-buttons button {
    width: 100%;
  }
}
</style>