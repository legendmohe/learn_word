<template>
  <div class="spelling-step">
    <div class="word-display text-center mb-2">
      <div class="flex items-center justify-center gap-1">
        <div class="text-center">
          <div class="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
            {{ word.meaning }}
          </div>
        </div>

        <!-- 语音播放按钮 -->
        <button
          @click="playAudio"
          :disabled="isPlaying"
          class="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all duration-200 group"
          title="播放发音"
        >
          <svg
            class="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors"
            :class="{ 'animate-pulse': isPlaying }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="showResult" class="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
        {{ word.word }}
    </div>

    <div v-if="!showResult" class="spelling-info text-center mb-8">
      <div class="text-base text-gray-600 dark:text-gray-400">
        使用所有字母完整拼写出单词
      </div>
    </div>
    

    <!-- 字母输入面板 -->
    <div v-if="!showResult" class="letter-input-panel mb-8">
      <LetterInputPanelV2
        :word="word.word"
        :meaning="word.meaning"
        :show-result="showResult"
        :is-last-step="isLastStep"
        @answer="handleAnswer"
        @completed="completeStep"
        ref="letterInputPanel"
      />
    </div>

    <!-- 结果显示 -->
    <div v-else class="result-feedback text-center mb-8">
      <div v-if="isCorrect" class="success-message">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
          拼写正确
        </div>
      </div>
      <div v-else class="error-message">
        <div class="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
          哎呀！
        </div>
        <div class="text-gray-600 dark:text-gray-400">
          正确答案是：{{ word.word }}
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
import LetterInputPanelV2 from './LetterInputPanelV2.vue'
import { playWordAudio } from '../utils/audioService'

export default {
  name: 'SpellingStep',
  components: {
    LetterInputPanelV2
  },
  props: {
    word: {
      type: Object,
      required: true
    },
    isLastStep: {
      type: Boolean,
      default: false
    },
    // 初始状态（用于恢复用户的选择）
    initialState: {
      type: Object,
      default: () => ({
        attempts: 0,
        showResult: false,
        completed: false
      })
    }
  },
  emits: ['completed', 'answer'],
  setup(props, { emit }) {
    const letterInputPanel = ref(null)
    const isPlaying = ref(false)
    const showResult = ref(props.initialState?.showResult || false)
    const isCorrect = ref(false)
    const attempts = ref(props.initialState?.attempts || 0)
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

    const handleAnswer = (answerData) => {
      attempts.value++
      isCorrect.value = answerData.correct

      if (isCorrect.value || attempts.value >= maxAttempts) {
        showResult.value = true

        // 发送答案结果（转发新组件的结果）
        emit('answer', answerData)
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
  max-width: 600px;
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

  .action-buttons {
    width: 100%;
  }

  .action-buttons button {
    width: 100%;
    max-width: 300px;
  }
}
</style>