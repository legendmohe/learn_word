<template>
  <div class="letter-input-panel">
    <!-- 单词下划线显示 -->
    <div class="word-display">
      <div
        class="letter-slots-container"
        :class="{ 'long-word': isLongWord }"
      >
        <div
          v-for="(letter, index) in wordLetters"
          :key="index"
          class="letter-slot"
          :class="{ 'filled': currentInput[index] }"
        >
          <span v-if="currentInput[index]" class="letter-text">
            {{ currentInput[index] }}
          </span>
          <div v-else class="underline"></div>
        </div>
      </div>
    </div>

    <!-- 字母输入面板 -->
    <div class="letter-keyboard">
      <!-- 第一行字母 -->
      <div class="keyboard-row">
        <button
          v-for="letter in ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']"
          :key="letter"
          @click="inputLetter(letter)"
          :disabled="isLetterUsed(letter) || showResult"
          :class="[
            'letter-key',
            { 'used': isLetterUsed(letter), 'disabled': showResult }
          ]"
        >
          {{ letter }}
        </button>
      </div>

      <!-- 第二行字母 -->
      <div class="keyboard-row">
        <button
          v-for="letter in ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']"
          :key="letter"
          @click="inputLetter(letter)"
          :disabled="isLetterUsed(letter) || showResult"
          :class="[
            'letter-key',
            { 'used': isLetterUsed(letter), 'disabled': showResult }
          ]"
        >
          {{ letter }}
        </button>
      </div>

      <!-- 第三行字母 -->
      <div class="keyboard-row">
        <button
          v-for="letter in ['Z', 'X', 'C', 'V', 'B', 'N', 'M']"
          :key="letter"
          @click="inputLetter(letter)"
          :disabled="isLetterUsed(letter) || showResult"
          :class="[
            'letter-key',
            { 'used': isLetterUsed(letter), 'disabled': showResult }
          ]"
        >
          {{ letter }}
        </button>
      </div>

      <!-- 操作按钮 - 删除和清空在同一行 -->
      <div class="action-row">
        <button
          @click="clearLastLetter"
          :disabled="currentInput.length === 0 || showResult"
          class="action-key backspace"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"></path>
          </svg>
          删除
        </button>

        <button
          @click="clearAll"
          :disabled="currentInput.length === 0 || showResult"
          class="action-key clear"
        >
          清空
        </button>
      </div>

      <!-- 提交按钮单独一行 -->
      <div class="action-row submit-row">
        <button
          @click="submitAnswer"
          :disabled="currentInput.length !== wordLetters.length || showResult"
          class="action-key submit"
        >
          提交
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  word: {
    type: String,
    required: true
  },
  showResult: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['answer', 'input-change'])

// 响应式数据
const currentInput = ref([])
const letterCounts = ref({}) // 记录每个字母的使用次数

// 辅助模式状态
const assistModeEnabled = ref(localStorage.getItem('learn_word_assist_mode') !== 'false')

// 监听storage变化
const handleStorageChange = (e) => {
  if (e.key === 'learn_word_assist_mode') {
    assistModeEnabled.value = e.newValue !== 'false'
  }
}

// 计算属性
const wordLetters = computed(() => {
  return props.word.toUpperCase().split('')
})

// 计算单词中每个字母的数量
const wordLetterCounts = computed(() => {
  const counts = {}
  wordLetters.value.forEach(letter => {
    counts[letter] = (counts[letter] || 0) + 1
  })
  return counts
})

// 检测是否为长单词，用于动态调整显示
const isLongWord = computed(() => {
  return wordLetters.value.length >= 10
})

// 输入字母
const inputLetter = (letter) => {
  if (currentInput.value.length >= wordLetters.value.length) return

  let canInput = true
  if (assistModeEnabled.value) {
    // 辅助模式：检查字母数量限制
    const currentCount = letterCounts.value[letter] || 0
    const maxCount = wordLetterCounts.value[letter] || 0
    canInput = currentCount < maxCount
  }
  // 非辅助模式：任何字母都可以输入

  if (canInput) {
    currentInput.value.push(letter)
    letterCounts.value[letter] = (letterCounts.value[letter] || 0) + 1
    emit('input-change', currentInput.value.join(''))
  }
}

// 清除最后一个字母
const clearLastLetter = () => {
  if (currentInput.value.length > 0) {
    const lastLetter = currentInput.value.pop()
    letterCounts.value[lastLetter] = Math.max(0, (letterCounts.value[lastLetter] || 0) - 1)
    emit('input-change', currentInput.value.join(''))
  }
}

// 清空所有输入
const clearAll = () => {
  currentInput.value = []
  letterCounts.value = {}
  emit('input-change', '')
}

// 提交答案
const submitAnswer = () => {
  if (currentInput.value.length === wordLetters.value.length) {
    emit('answer', currentInput.value.join(''))
  }
}

// 检查字母是否已使用（达到单词中的最大数量）
const isLetterUsed = (letter) => {
  if (!assistModeEnabled.value) {
    // 非辅助模式：所有字母都可用
    return false
  }

  // 辅助模式：检查字母数量限制
  const currentCount = letterCounts.value[letter] || 0
  const maxCount = wordLetterCounts.value[letter] || 0
  return currentCount >= maxCount
}

// 键盘输入支持
const handleKeydown = (event) => {
  if (props.showResult) return

  const key = event.key.toUpperCase()

  // 字母键输入
  if (/^[A-Z]$/.test(key)) {
    event.preventDefault()
    inputLetter(key)
  }
  // 退格键
  else if (event.key === 'Backspace') {
    event.preventDefault()
    clearLastLetter()
  }
  // 回车键提交
  else if (event.key === 'Enter' && currentInput.value.length === wordLetters.value.length) {
    event.preventDefault()
    submitAnswer()
  }
  // Escape键清空
  else if (event.key === 'Escape') {
    event.preventDefault()
    clearAll()
  }
}

// 监听props.word变化，重置输入
watch(() => props.word, () => {
  clearAll()
})

// 组件挂载时添加事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('storage', handleStorageChange)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('storage', handleStorageChange)
})

// 清空方法暴露给父组件
const clear = () => {
  clearAll()
}

// 暴露方法
defineExpose({
  clear
})
</script>

<style scoped>
.letter-input-panel {
  user-select: none;
}

/* 单词显示区域 */
.word-display {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  width: 100%;
}

.letter-slots-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 4px;
  flex-wrap: nowrap; /* 强制保持在一行 */
}

.letter-slot {
  width: clamp(40px, 8vw, 50px); /* 动态宽度：最小40px，最大50px */
  height: clamp(50px, 10vw, 60px); /* 动态高度：最小50px，最大60px */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 1; /* 允许收缩以适应容器 */
  flex-grow: 0; /* 不允许增长 */
}

.letter-text {
  font-size: clamp(1.5rem, 4vw, 2rem); /* 动态字体大小：最小1.5rem，最大2rem */
  font-weight: bold;
  color: #3b82f6;
  text-transform: uppercase;
  animation: letterAppear 0.3s ease-out;
  line-height: 1;
}

.underline {
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
  animation: underlinePulse 2s infinite;
}

@keyframes letterAppear {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes underlinePulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* 键盘样式 */
.letter-keyboard {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 12px 6px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
}

.dark .letter-keyboard {
  background: rgba(31, 41, 55, 0.95);
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 3px;
  margin-bottom: 8px;
}

.letter-key {
  min-width: 28px;
  height: 48px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.dark .letter-key {
  background: linear-gradient(135deg, #4b5563, #374151);
  color: #e5e7eb;
}

.letter-key:hover:not(.used):not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #ddd6fe, #c4b5fd);
  color: #5b21b6;
}

.dark .letter-key:hover:not(.used):not(.disabled) {
  background: linear-gradient(135deg, #6d28d9, #5b21b6);
  color: #e9d5ff;
}

.letter-key:active:not(.used):not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.letter-key.used {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
  color: #991b1b;
  opacity: 0.6;
  cursor: not-allowed;
}

.dark .letter-key.used {
  background: linear-gradient(135deg, #7f1d1d, #991b1b);
  color: #fecaca;
}

.letter-key.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 操作按钮行 - 水平布局 */
.action-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.action-row.submit-row {
  margin-top: 8px; /* 提交按钮与上方按钮组的间距稍小 */
}

.action-key {
  flex: 1; /* 均匀分配宽度 */
  height: 52px; /* 保持相同高度 */
  min-height: 52px;
  border: none;
  border-radius: 12px;
  font-size: 1rem; /* 保持字体大小 */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px; /* 稍微减少间距适应水平布局 */
}

.action-key:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-key.backspace {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
}

.action-key.backspace:hover:not(:disabled) {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  transform: translateY(-1px);
}

.action-key.clear {
  background: linear-gradient(135deg, #94a3b8, #64748b);
  color: white;
}

.action-key.clear:hover:not(:disabled) {
  background: linear-gradient(135deg, #64748b, #475569);
  transform: translateY(-1px);
}

.action-key.submit {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.action-key.submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .letter-keyboard {
    padding: 14px 8px;
  }

  .keyboard-row {
    gap: 3px;
    margin-bottom: 8px;
  }

  .letter-key {
    min-width: 32px;
    height: 48px;
    font-size: 1rem;
  }

  .action-column {
    gap: 10px;
  }

  .action-key {
    height: 50px; /* 中等屏幕尺寸 */
    font-size: 0.95rem;
  }
}

@media (max-width: 380px) {
  .letter-keyboard {
    padding: 12px 6px;
  }

  .keyboard-row {
    gap: 2px;
    margin-bottom: 6px;
  }

  .letter-key {
    min-width: 30px;
    height: 44px;
    font-size: 0.95rem;
    border-radius: 10px;
  }

  .letter-slot {
    width: 32px;
    height: 42px;
  }

  .letter-text {
    font-size: 1.2rem;
  }

  /* 在小屏幕上进一步调整单词显示 */
  .word-display {
    padding: 0 5px;
  }

  .letter-slots-container {
    gap: 2px;
  }

  /* 极小屏幕（<320px）的特殊处理 */
  @media (max-width: 320px) {
    .letter-slot {
      width: clamp(35px, 10vw, 40px);
      height: clamp(45px, 12vw, 50px);
    }

    .letter-text {
      font-size: clamp(1.2rem, 5vw, 1.5rem);
    }

    .letter-slots-container {
      gap: 1px;
    }
  }

  /* 长单词的适配 - 使用类名方式 */
  .letter-slots-container.long-word {
    .letter-slot {
      width: clamp(30px, 7vw, 40px);
      height: clamp(40px, 9vw, 50px);
    }

    .letter-text {
      font-size: clamp(1rem, 3.5vw, 1.2rem);
    }

    gap: 2px;
  }

  .action-key {
    height: 48px; /* 在小屏幕上稍微小一点，但仍保持较大 */
    font-size: 0.95rem;
  }

  .action-column {
    gap: 10px; /* 小屏幕上稍微减少间距 */
  }
}

/* 触摸优化 */
@media (hover: none) {
  .letter-key:active:not(.used):not(.disabled) {
    background: linear-gradient(135deg, #ddd6fe, #c4b5fd);
    color: #5b21b6;
  }

  .dark .letter-key:active:not(.used):not(.disabled) {
    background: linear-gradient(135deg, #6d28d9, #5b21b6);
    color: #e9d5ff;
  }
}
</style>