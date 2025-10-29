<template>
  <div class="today-study">
    <!-- 学习状态卡片 -->
    <div v-if="studyStatus === 'ready'" class="text-center py-8">
      <div class="text-6xl mb-4">📚</div>
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">开始今日学习</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        今日需要学习 {{ dailyGoal }} 个单词，包含复习和新单词
      </p>
      <button
        @click="startStudy"
        class="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        开始学习
      </button>
    </div>

    <!-- 学习进行中 -->
    <div v-else-if="studyStatus === 'studying'" class="study-container">
      <!-- 进度指示器 -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">学习进度</span>
          <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
            {{ currentWordIndex + 1 }} / {{ studyWords.length }}
          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            class="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- 单词卡片 -->
      <div class="word-card glass-effect rounded-2xl p-8 mb-6 card-shadow transform transition-all duration-300"
           :class="{ 'animate-bounce': showResult }">
        <div class="text-center">
          <!-- 填空题 -->
          <div class="mb-8">
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-6">
              {{ currentWord.meaning }}
            </div>

            <!-- 字母输入面板 -->
            <div v-if="!showResult">
              <LetterInputPanel
                :word="currentWord.word"
                :show-result="showResult"
                @answer="handleAnswer"
                @input-change="handleInputChange"
                ref="letterInputPanel"
              />
            </div>

            <!-- 结果显示 -->
            <div v-else class="result-display">
              <div v-if="isCorrect" class="success-animation">
                <div class="text-4xl mb-4">🎉</div>
                <div class="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  回答正确！
                </div>
                <div class="text-gray-700 dark:text-gray-300">
                  {{ currentWord.word }}
                </div>
              </div>

              <div v-else class="error-animation">
                <div class="text-4xl mb-4">😔</div>
                <div class="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  回答错误
                </div>
                <div class="text-gray-700 dark:text-gray-300">
                  正确答案：<span class="font-bold">{{ currentWord.word }}</span>
                </div>
                <div v-if="userAnswer.trim()" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  你的答案：{{ userAnswer.trim() }}
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3 justify-center">
            <button
              v-if="!showResult"
              @click="checkAnswer"
              :disabled="!userAnswer.trim()"
              class="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              提交答案
            </button>

            <button
              v-else
              @click="nextWord"
              class="px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {{ currentWordIndex < studyWords.length - 1 ? '下一个单词' : '完成学习' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="text-center text-sm text-gray-500 dark:text-gray-400">
        <div v-if="!showResult">
          💡 提示：{{ getStudyHint() }}
        </div>
      </div>
    </div>

    <!-- 学习完成 -->
    <div v-else-if="studyStatus === 'completed'" class="completed-view text-center py-8">
      <div class="text-6xl mb-4">🏆</div>
      <h2 class="text-2xl font-bold gradient-text mb-4">今日学习完成！</h2>

      <!-- 学习统计 -->
      <div class="glass-effect rounded-2xl p-6 mb-6 card-shadow">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">学习统计</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ studyStats.correct }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">正确</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ studyStats.wrong }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">错误</div>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="text-lg font-semibold text-primary-600 dark:text-primary-400">
            正确率：{{ studyStats.accuracy }}%
          </div>
        </div>
      </div>

      <div class="flex gap-3 justify-center">
        <button
          @click="resetStudy"
          class="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
        >
          重新学习
        </button>
        <button
          @click="switchTab('profile')"
          class="px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          查看详情
        </button>
      </div>
    </div>

    <!-- 首次使用引导弹窗 -->
    <WelcomeGuide
      v-if="showWelcomeGuide"
      @close="showWelcomeGuide = false"
      @skip="handleGuideSkip"
      @start-learning="handleGuideStartLearning"
      @go-settings="handleGuideGoToSettings"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { getDailyGoal, getSelectedCourse, updateStudyProgress, addErrorWord, addLearnedWord, removeErrorWord } from '../utils/studyData'
import { getTodayWords } from '../utils/studyData'
import { getRandomWords } from '../utils/coursesParser'
import LetterInputPanel from './LetterInputPanel.vue'
import WelcomeGuide from './WelcomeGuide.vue'

// 定义事件
const emit = defineEmits(['completed'])

// 学习状态
const studyStatus = ref('ready') // ready, studying, completed

// 引导弹窗状态
const showWelcomeGuide = ref(false)

// 学习数据
const dailyGoal = ref(10)
const studyWords = ref([])
const currentWordIndex = ref(0)
const userAnswer = ref('')
const showResult = ref(false)
const isCorrect = ref(false)

// 学习统计
const studyStats = ref({
  correct: 0,
  wrong: 0,
  accuracy: 0
})

// 字母输入面板引用
const letterInputPanel = ref(null)

// 计算属性
const currentWord = computed(() => {
  return studyWords.value[currentWordIndex.value] || {}
})

const progressPercentage = computed(() => {
  return Math.round(((currentWordIndex.value + 1) / studyWords.value.length) * 100)
})

// 开始学习
const startStudy = async () => {
  // 检查是否首次使用
  const isFirstTime = !localStorage.getItem('learn_word_welcome_shown')
  if (isFirstTime) {
    showWelcomeGuide.value = true
    return
  }

  proceedToStudy()
}

// 实际开始学习的逻辑
const proceedToStudy = async () => {
  try {
    // 获取今日学习单词
    const todayWords = getTodayWords(dailyGoal.value)
    if (todayWords.length === 0) {
      // 如果没有错误单词，使用新单词
      const courseName = getSelectedCourse()
      studyWords.value = getRandomWords(courseName, dailyGoal.value)
    } else {
      studyWords.value = todayWords
    }

    currentWordIndex.value = 0
    studyStats.value = { correct: 0, wrong: 0, accuracy: 0 }
    studyStatus.value = 'studying'
  } catch (error) {
    console.error('开始学习失败:', error)
    // 如果获取错误单词失败，使用新单词
    const courseName = getSelectedCourse()
    studyWords.value = getRandomWords(courseName, dailyGoal.value)
    currentWordIndex.value = 0
    studyStats.value = { correct: 0, wrong: 0, accuracy: 0 }
    studyStatus.value = 'studying'
  }
}

// 处理字母输入面板的答案
const handleAnswer = (answer) => {
  userAnswer.value = answer
  checkAnswer()
}

// 处理字母输入变化
const handleInputChange = (input) => {
  userAnswer.value = input
}

// 检查答案
const checkAnswer = () => {
  if (!userAnswer.value) return

  const answer = userAnswer.value.toLowerCase()
  const correctAnswer = currentWord.value.word.toLowerCase()

  isCorrect.value = answer === correctAnswer
  showResult.value = true

  // 更新学习统计
  if (isCorrect.value) {
    studyStats.value.correct++
    addLearnedWord(currentWord.value)
    removeErrorWord(currentWord.value.word)
  } else {
    studyStats.value.wrong++
    addErrorWord({
      word: currentWord.value.word,
      meaning: currentWord.value.meaning,
      userAnswer: answer
    })
  }

  // 更新学习进度
  updateStudyProgress(isCorrect.value)

  // 计算正确率
  const total = studyStats.value.correct + studyStats.value.wrong
  studyStats.value.accuracy = Math.round((studyStats.value.correct / total) * 100)

  // 触觉反馈
  if (navigator.vibrate) {
    navigator.vibrate(isCorrect.value ? 100 : [50, 50, 50])
  }
}

// 下一个单词
const nextWord = () => {
  if (currentWordIndex.value < studyWords.value.length - 1) {
    currentWordIndex.value++
    userAnswer.value = ''
    showResult.value = false
    isCorrect.value = false

    // 清空字母输入面板
    nextTick(() => {
      letterInputPanel.value?.clear()
    })
  } else {
    // 学习完成
    studyStatus.value = 'completed'
    emit('completed')

    // 发送学习完成事件
    window.dispatchEvent(new CustomEvent('studyCompleted'))
  }
}

// 重置学习
const resetStudy = () => {
  studyStatus.value = 'ready'
  studyWords.value = []
  currentWordIndex.value = 0
  userAnswer.value = ''
  showResult.value = false
  isCorrect.value = false
  studyStats.value = { correct: 0, wrong: 0, accuracy: 0 }
}

// 切换标签页
const switchTab = (tab) => {
  window.dispatchEvent(new CustomEvent('tabChange', {
    detail: { tab }
  }))
}

// 处理引导弹窗事件
const handleGuideStartLearning = () => {
  showWelcomeGuide.value = false
  proceedToStudy()
}

const handleGuideGoToSettings = () => {
  showWelcomeGuide.value = false
  switchTab('profile')
}

const handleGuideSkip = () => {
  showWelcomeGuide.value = false
  proceedToStudy()
}

// 获取学习提示
const getStudyHint = () => {
  const hints = [
    '仔细拼写，注意大小写',
    '如果不确定，可以尝试填写',
    '每个单词都很重要',
    '错误是学习的一部分'
  ]
  return hints[Math.floor(Math.random() * hints.length)]
}

// 监听当前单词变化，重置输入状态
watch(currentWord, () => {
  userAnswer.value = ''
  showResult.value = false
  isCorrect.value = false
})

// 组件挂载时初始化
onMounted(() => {
  dailyGoal.value = getDailyGoal()
})
</script>

<style scoped>
.today-study {
  min-height: 400px;
}

.word-card {
  transition: transform 0.3s ease;
}

.word-card:hover {
  transform: translateY(-2px);
}

.success-animation {
  animation: successPulse 0.6s ease-out;
}

.error-animation {
  animation: errorShake 0.6s ease-out;
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 响应式设计 */
@media (max-width: 380px) {
  .word-card {
    padding: 1.5rem;
  }

  .text-2xl {
    font-size: 1.25rem;
  }
}
</style>