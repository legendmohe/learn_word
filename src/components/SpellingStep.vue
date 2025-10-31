<template>
  <div class="spelling-step">
    <div class="word-display text-center mb-2">
      <!-- WordCard 单词显示 -->
      <div class="flex justify-center">
        <WordCard
          :word="word"
          size="large"
          :show-phonemes="true"
          :show-audio="true"
          :show-meaning="true"
          :show-english-word="showResult"
        />
      </div>
    </div>

    <div v-if="!showResult" class="spelling-info text-center mb-8">
      <div class="text-base text-gray-600 dark:text-gray-400">
        使用所有字母完整拼写出单词
      </div>
    </div>
    

    <!-- 字母输入面板 -->
    <div class="letter-input-panel">
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
    <div v-if="showResult" class="result-feedback text-center">
      <div v-if="isCorrect" class="success-message">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
          拼写正确
        </div>
      </div>
      <div v-else class="error-message">
        <div class="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
          错了~
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
import WordCard from './WordCard.vue'

export default {
  name: 'SpellingStep',
  components: {
    LetterInputPanelV2,
    WordCard
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
    const showResult = ref(props.initialState?.showResult || false)
    const isCorrect = ref(false)
    const attempts = ref(props.initialState?.attempts || 0)
    const maxAttempts = 2

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
      showResult,
      isCorrect,
      attempts,
      maxAttempts,
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