<template>
  <div class="spelling-step">

    <!-- 字母输入显示区域 -->
    <div class="letter-input-area mb-2">
      <div class="letter-display-grid grid gap-3 justify-center mb-6">
        <div
          v-for="(letter, index) in wordLetters"
          :key="index"
          class="letter-slot px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium"
          :class="{
            'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300': currentInput[index],
            'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400': !currentInput[index]
          }"
        >
          <span v-if="currentInput[index]" class="text-xl font-bold">
            {{ currentInput[index] }}
          </span>
          <span v-else class="text-xl">_</span>
        </div>
      </div>
    </div>

    <!-- 字母选择区域 -->
    <div class="letter-selection-area mb-8">
      <div class="letter-grid grid gap-3 justify-center">
        <button
          v-for="(letter, index) in shuffledLetters"
          :key="`${letter}-${index}`"
          @click="selectLetter(letter, index)"
          :disabled="usedLetters.includes(index) || showResult"
          class="letter-button px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium"
          :class="{
            'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:border-indigo-400 hover:shadow-md': !usedLetters.includes(index) && !showResult,
            'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed': usedLetters.includes(index) && !showResult,
            'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400': showResult && isCorrect,
            'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400': showResult && !isCorrect
          }"
        >
          {{ letter }}
        </button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons flex justify-center gap-4">
      <button
        v-if="!showResult && currentInput.length > 0"
        @click="clearLastLetter"
        class="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
      >
        删除
      </button>

      <button
        v-if="!showResult"
        @click="submitAnswer"
        :disabled="currentInput.length !== wordLetters.length"
        class="px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        提交答案
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Props
const props = defineProps({
  word: {
    type: String,
    required: true
  },
  meaning: {
    type: String,
    required: true
  },
  showResult: {
    type: Boolean,
    default: false
  },
  isLastStep: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['answer', 'completed'])

// 响应式数据
const currentInput = ref([])
const usedLetters = ref([])
const isCorrect = ref(false)
const shuffledLetters = ref([])

// 计算属性
const wordLetters = computed(() => {
  return props.word.toLowerCase().split('')
})

// 打乱字母顺序
const shuffleLetters = () => {
  const letters = [...wordLetters.value]
  // 添加一些干扰字母
  const extraLetters = ['e', 't', 'a', 'o', 'i', 'n', 's', 'h', 'r', 'd']
  const shuffledExtra = extraLetters
    .filter(letter => !letters.includes(letter))
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(5, letters.length))

  const allLetters = [...letters, ...shuffledExtra]
  shuffledLetters.value = allLetters.sort(() => Math.random() - 0.5)
}

// 选择字母
const selectLetter = (letter, originalIndex) => {
  if (usedLetters.value.includes(originalIndex) || currentInput.value.length >= wordLetters.value.length) return

  currentInput.value.push(letter)
  usedLetters.value.push(originalIndex)
}

// 删除最后一个字母
const clearLastLetter = () => {
  if (currentInput.value.length > 0) {
    // 找到最后一个使用的字母的原始索引
    const lastLetter = currentInput.value.pop()
    const letterIndex = shuffledLetters.value.lastIndexOf(lastLetter)
    if (letterIndex !== -1 && usedLetters.value.includes(letterIndex)) {
      const indexToRemove = usedLetters.value.lastIndexOf(letterIndex)
      usedLetters.value.splice(indexToRemove, 1)
    }
  }
}

// 清空所有输入
const clearAll = () => {
  currentInput.value = []
  usedLetters.value = []
}

// 提交答案
const submitAnswer = () => {
  if (currentInput.value.length !== wordLetters.value.length) return

  const userAnswer = currentInput.value.join('')
  const correctAnswer = props.word.toLowerCase()

  isCorrect.value = userAnswer === correctAnswer

  // 发送答案结果
  emit('answer', {
    word: props.word,
    correct: isCorrect.value,
    selectedAnswer: userAnswer,
    correctAnswer: correctAnswer,
    attempts: 1,
    type: 'spelling'
  })
}

// 完成步骤
const completeStep = () => {
  emit('completed', {
    word: props.word,
    correct: isCorrect.value,
    attempts: 1
  })
}

// 监听showResult变化
watch(() => props.showResult, (newVal) => {
  if (!newVal) {
    // 重置状态
    clearAll()
    isCorrect.value = false
  }
})

// 监听word变化
watch(() => props.word, () => {
  clearAll()
  isCorrect.value = false
  shuffleLetters()
})

onMounted(() => {
  shuffleLetters()
})
</script>

<style scoped>

.letter-display-grid {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  max-width: 100%;
}

.letter-slot {
  transition: all 0.2s ease;
  user-select: none;
  min-height: 50px;
  min-width: 40px;
  max-width: 50px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.letter-grid {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  max-width: 100%;
}

.letter-button {
  transition: all 0.2s ease;
  user-select: none;
  min-height: 45px;
  min-width: 35px;
  max-width: 45px;
  flex: 0 0 auto;
}

.letter-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.letter-button:active:not(:disabled) {
  transform: translateY(0);
}

.result-feedback {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .spelling-step {
    padding: 0 0.5rem;
    max-width: 100%;
  }

  .letter-display-grid {
    gap: 6px;
  }

  .letter-slot {
    min-height: 45px;
    min-width: 35px;
    max-width: 45px;
    font-size: 0.9rem;
  }

  .letter-grid {
    gap: 6px;
  }

  .letter-button {
    padding: 6px 8px;
    font-size: 13px;
    min-height: 40px;
    max-width: 45px;
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