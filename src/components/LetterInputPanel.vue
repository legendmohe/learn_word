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
    <div class="letter-keyboard" :class="{ 'assist-mode': assistModeEnabled }">
      <!-- 动态字母行 -->
      <div
        v-for="(row, rowIndex) in keyboardRows"
        :key="rowIndex"
        class="keyboard-row"
        :class="{ 'assist-mode-row': assistModeEnabled }"
      >
        <button
          v-for="(letter, letterIndex) in row"
          :key="`${rowIndex}-${letterIndex}-${letter}`"
          @click="inputLetter(letter)"
          :disabled="isSpecificLetterUsed(letter, rowIndex, letterIndex) || showResult"
          :class="[
            'letter-key',
            {
              'used': isSpecificLetterUsed(letter, rowIndex, letterIndex),
              'disabled': showResult,
              'assist-mode-key': assistModeEnabled
            }
          ]"
        >
          {{ letter }}
        </button>
      </div>

      <!-- 操作按钮 - 两个按钮在同一行 -->
      <div class="action-row">
        <button
          @click="clearLastLetter"
          :disabled="currentInput.length === 0 || showResult"
          class="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"></path>
          </svg>
          删除
        </button>

        <button
          @click="submitAnswer"
          :disabled="currentInput.length !== wordLetters.length || showResult"
          class="px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
const usedLetterIndices = ref(new Set()) // 记录辅助模式下已使用的具体字母按钮索引

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

// 生成动态键盘行
const keyboardRows = computed(() => {
  if (assistModeEnabled.value) {
    // 辅助模式：仅显示单词所含的字母
    return generateAssistModeKeyboard()
  } else {
    // 非辅助模式：显示单词字母 + 额外字母，凑成整行
    return generateNormalModeKeyboard()
  }
})

// 辅助模式键盘生成
const generateAssistModeKeyboard = () => {
  // 获取单词中的所有字母（包括重复字母）
  const allLetters = [...wordLetters.value]
  // 随机打乱字母顺序，但保持字母数量
  const shuffledLetters = shuffleArray([...allLetters])
  const rows = []

  // 辅助模式每行显示较少字母，确保舒适间距
  const lettersPerRow = Math.max(3, Math.min(5, Math.ceil(shuffledLetters.length / 2))) // 每行3-5个字母

  // 将字母分行显示，保持舒适的间距
  for (let i = 0; i < shuffledLetters.length; i += lettersPerRow) {
    rows.push(shuffledLetters.slice(i, i + lettersPerRow))
  }

  return rows
}

// 非辅助模式键盘生成
const generateNormalModeKeyboard = () => {
  const wordLettersSet = new Set(wordLetters.value)
  const wordLettersArray = Array.from(wordLettersSet)

  // 常用英文字母（按使用频率排序）
  const commonLetters = ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R', 'D', 'L', 'C', 'U', 'M', 'W', 'F', 'G', 'Y', 'P', 'B', 'V', 'K', 'J', 'X', 'Q', 'Z']

  // 获取额外的字母（不在单词中但常用的字母）
  const extraLetters = commonLetters.filter(letter => !wordLettersSet.has(letter))

  // 根据单词长度决定添加多少额外字母（单词字母数量的一半）
  const extraCount = Math.min(
    Math.max(2, Math.ceil(wordLettersArray.length * 0.5)), // 至少添加2个，或单词字母数的50%
    extraLetters.length // 不超过可用的额外字母数
  )

  // 选取需要添加的干扰字母
  const selectedExtraLetters = extraLetters.slice(0, extraCount)

  // 合并字母：单词字母 + 干扰字母
  const allLetters = [...wordLettersArray, ...selectedExtraLetters]

  // 打乱所有字母的顺序（包括单词字母和干扰字母）
  const finalLetters = shuffleArray([...allLetters])

  // 分行显示，根据字母总数动态调整每行数量，防止溢出
  const getLettersPerRow = (totalLetters) => {
    if (totalLetters <= 6) return 6      // 6个或更少：每行6个
    if (totalLetters <= 10) return 5    // 7-10个：每行5个
    if (totalLetters <= 15) return 6    // 11-15个：每行6个
    if (totalLetters <= 21) return 7    // 16-21个：每行7个
    return 8                           // 21个以上：每行8个
  }

  const lettersPerRow = getLettersPerRow(finalLetters.length)
  const rows = []

  for (let i = 0; i < finalLetters.length; i += lettersPerRow) {
    rows.push(finalLetters.slice(i, i + lettersPerRow))
  }

  return rows
}

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

    // 在辅助模式下标记对应的字母按钮为已使用
    if (assistModeEnabled.value) {
      const letterPosition = findLetterPositionInKeyboard(letter)
      if (letterPosition) {
        markLetterAsUsed(letter, letterPosition.rowIndex, letterPosition.letterIndex)
      }
    }

    emit('input-change', currentInput.value.join(''))
  }
}

// 在键盘中找到字母的位置
const findLetterPositionInKeyboard = (targetLetter) => {
  const rows = keyboardRows.value
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex]
    for (let letterIndex = 0; letterIndex < row.length; letterIndex++) {
      const letter = row[letterIndex]
      const buttonKey = `${rowIndex}-${letterIndex}-${letter}`
      // 检查这个按钮是否还未被使用且字母匹配
      if (letter === targetLetter && !usedLetterIndices.value.has(buttonKey)) {
        return { rowIndex, letterIndex }
      }
    }
  }
  return null
}

// 清除最后一个字母
const clearLastLetter = () => {
  if (currentInput.value.length > 0) {
    const lastLetter = currentInput.value.pop()
    letterCounts.value[lastLetter] = Math.max(0, (letterCounts.value[lastLetter] || 0) - 1)

    // 在辅助模式下取消标记对应的字母按钮
    if (assistModeEnabled.value) {
      unmarkLetterAsUsed(lastLetter)
    }

    emit('input-change', currentInput.value.join(''))
  }
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

// 检查具体位置的字母按钮是否已使用（辅助模式专用）
const isSpecificLetterUsed = (letter, rowIndex, letterIndex) => {
  if (!assistModeEnabled.value) {
    return false
  }

  const buttonKey = `${rowIndex}-${letterIndex}-${letter}`
  return usedLetterIndices.value.has(buttonKey)
}

// 在辅助模式下标记具体字母按钮为已使用
const markLetterAsUsed = (letter, rowIndex, letterIndex) => {
  if (assistModeEnabled.value) {
    const buttonKey = `${rowIndex}-${letterIndex}-${letter}`
    usedLetterIndices.value.add(buttonKey)
  }
}

// 在辅助模式下取消标记具体字母按钮（用于删除操作）
const unmarkLetterAsUsed = (letter) => {
  if (assistModeEnabled.value) {
    // 找到并移除第一个匹配的字母按钮索引
    for (const key of usedLetterIndices.value) {
      if (key.endsWith(`-${letter}`)) {
        usedLetterIndices.value.delete(key)
        break
      }
    }
  }
}

// 随机打乱数组（Fisher-Yates 洗牌算法）
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
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
    currentInput.value = []
    letterCounts.value = {}
    usedLetterIndices.value.clear()
    emit('input-change', '')
  }
}

// 监听props.word变化，重置输入
watch(() => props.word, () => {
  currentInput.value = []
  letterCounts.value = {}
  usedLetterIndices.value.clear()
  emit('input-change', '')
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
  currentInput.value = []
  letterCounts.value = {}
  usedLetterIndices.value.clear()
  emit('input-change', '')
}

// 暴露方法
defineExpose({
  clear
})
</script>

<style scoped>
/* 单词显示区域 */
.word-display {
  text-align: center;
  margin-bottom: 2rem;
}

.letter-slots-container {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.letter-slot {
  min-width: 40px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 3px solid #3b82f6;
}

.letter-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
  text-transform: uppercase;
}

.letter-slots-container.long-word .letter-slot {
  min-width: 30px;
  height: 40px;
}

.letter-slots-container.long-word .letter-text {
  font-size: 1.2rem;
}

/* 字母键盘 */
.letter-keyboard {
  max-width: 600px;
  margin: 0 auto;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.letter-key {
  min-width: 40px;
  height: 50px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.letter-key:hover:not(.used):not(.disabled) {
  background: #f3f4f6;
  transform: translateY(-2px);
}

.letter-key.used {
  background: #fee2e2;
  color: #991b1b;
  border-color: #f87171;
  opacity: 0.6;
  cursor: not-allowed;
}

.letter-key.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 操作按钮 */
.action-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 2rem;
}

/* 深色模式 */
.dark .letter-key {
  border-color: #4b5563;
  background: #1f2937;
  color: #e5e7eb;
}

.dark .letter-key:hover:not(.used):not(.disabled) {
  background: #374151;
}

.dark .letter-key.used {
  background: #7f1d1d;
  color: #fecaca;
  border-color: #dc2626;
}

/* 辅助模式特殊布局 */
.assist-mode .keyboard-row {
  gap: 12px;
}

.assist-mode .letter-key {
  width: 50px;
  min-width: 50px;
  max-width: 50px;
}
</style>