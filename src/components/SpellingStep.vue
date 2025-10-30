<template>
  <div class="spelling-step">
    <div class="word-display text-center mb-8">
      <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
        {{ word.meaning }}
      </div>

      <!-- 语音播放按钮 -->
      <div class="audio-controls flex justify-center gap-4 mb-6">
        <button
          @click="playAudio"
          :disabled="isPlaying"
          class="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all duration-200 group"
          title="播放发音"
        >
          <svg
            class="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors"
            :class="{ 'animate-pulse': isPlaying }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
          </svg>
        </button>
      </div>

      <div class="text-base text-gray-600 dark:text-gray-400 mb-8">
        使用所有字母完整拼写出单词
      </div>
    </div>

    <!-- 字母输入面板 -->
    <div v-if="!showResult" class="letter-input-panel mb-8">
      <LetterInputPanel
        :word="word.word"
        :show-result="showResult"
        @answer="handleAnswer"
        @input-change="handleInputChange"
        ref="letterInputPanel"
      />
    </div>

    <!-- 结果显示 -->
    <div v-else class="result-display text-center mb-8">
      <div v-if="isCorrect" class="success-animation">
        <div class="success-icon mb-6">
          <div class="text-6xl mb-4">🎯</div>
        </div>

        <div class="success-message mb-4">
          <h3 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-2">
            拼写正确！
          </h3>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            太棒了！完整拼写成功
          </p>
        </div>

        <div class="word-display">
          <div class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {{ word.word }}
          </div>
          <div class="text-base text-gray-600 dark:text-gray-400">
            {{ word.meaning }}
          </div>
        </div>
      </div>

      <div v-else class="error-animation">
        <div class="error-icon mb-6">
          <div class="text-6xl mb-4">💡</div>
        </div>

        <div class="error-message mb-4">
          <h3 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            再接再厉！
          </h3>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            正确答案是：{{ word.word }}
          </p>
        </div>

        <div class="correct-answer mb-4">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <span class="text-blue-500">✓</span>
            <span class="text-sm font-medium text-blue-700 dark:text-blue-400">
              {{ word.word }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons flex justify-center mt-8">
      <button
        v-if="showResult"
        @click="completeStep"
        class="px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        {{ isLastStep ? '完成学习' : '下一个单词' }}
      </button>
    </div>

    <!-- 尝试次数提示 -->
    <div v-if="attempts > 0 && !showResult" class="attempts-info text-center mt-4">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        尝试次数：{{ attempts }} / {{ maxAttempts }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue'
import LetterInputPanel from './LetterInputPanel.vue'
import { playWordAudio } from '../utils/audioService'

export default {
  name: 'SpellingStep',
  components: {
    LetterInputPanel
  },
  props: {
    word: {
      type: Object,
      required: true
    },
    isLastStep: {
      type: Boolean,
      default: false
    }
  },
  emits: ['completed', 'answer'],
  setup(props, { emit }) {
    const letterInputPanel = ref(null)
    const isPlaying = ref(false)
    const showResult = ref(false)
    const isCorrect = ref(false)
    const attempts = ref(0)
    const maxAttempts = 2

    const playAudio = async () => {
      if (isPlaying.value) return

      try {
        isPlaying.value = true
        const success = await playWordAudio(props.word.word, {
          lang: 'en-US',
          rate: 0.8
        })

        if (!success) {
          console.warn('语音播放失败')
        }
      } catch (error) {
        console.error('语音播放错误:', error)
      } finally {
        isPlaying.value = false
      }
    }

    const handleAnswer = (answer) => {
      attempts.value++
      const correctAnswer = props.word.word.toLowerCase()
      const userAnswer = answer.toLowerCase()

      isCorrect.value = userAnswer === correctAnswer

      if (isCorrect.value || attempts.value >= maxAttempts) {
        showResult.value = true

        // 发送答案结果
        emit('answer', {
          word: props.word.word,
          correct: isCorrect.value,
          attempts: attempts.value,
          selectedAnswer: userAnswer,
          correctAnswer: correctAnswer,
          type: 'spelling'
        })
      } else {
        // 还有尝试机会，清空输入继续尝试
        setTimeout(() => {
          nextTick(() => {
            letterInputPanel.value?.clear()
          })
        }, 1500)
      }
    }

    const handleInputChange = () => {
      // 处理输入变化
    }

    const completeStep = () => {
      emit('completed', {
        word: props.word.word,
        correct: isCorrect.value,
        attempts: attempts.value
      })
    }

    return {
      letterInputPanel,
      isPlaying,
      showResult,
      isCorrect,
      attempts,
      maxAttempts,
      playAudio,
      handleAnswer,
      handleInputChange,
      completeStep
    }
  }
}
</script>

<style scoped>
.spelling-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  max-width: 500px;
  margin: 0 auto;
}

.letter-input-panel {
  width: 100%;
}

.audio-button {
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.audio-button:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.audio-button:active {
  transform: scale(0.95);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

.success-animation,
.error-animation {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .spelling-step {
    padding: 1rem;
  }

  .word-display {
    margin-bottom: 1.5rem;
  }

  .action-buttons {
    width: 100%;
  }

  .action-buttons button {
    width: 100%;
    max-width: 300px;
  }
}
</style>