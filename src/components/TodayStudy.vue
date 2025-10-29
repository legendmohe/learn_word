<template>
  <div class="today-study">
    <!-- 学习状态卡片 -->
    <div v-if="studyStatus === 'ready'" class="ready-container flex items-center justify-center h-full">
      <div class="text-center">
        <div class="text-6xl mb-4">📚</div>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">开始今日学习</h2>
        <p class="text-base text-gray-600 dark:text-gray-400 mb-6">
          今日需要学习 {{ dailyGoal }} 个单词，包含复习和新单词
        </p>
        <button
          @click="startStudy"
          class="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          开始学习
        </button>
      </div>
    </div>

    <!-- 学习进行中 -->
    <div v-else-if="studyStatus === 'studying'" class="study-container">
      <!-- 进度指示器和停止按钮 -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-base text-gray-600 dark:text-gray-400">学习进度</span>
          <div class="flex items-center gap-3">
            <button
              @click="showStopConfirmDialog = true"
              class="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
            >
              停止学习
            </button>
            <span class="text-base font-medium text-gray-800 dark:text-gray-200">
              {{ currentWordIndex + 1 }} / {{ studyWords.length }}
            </span>
          </div>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            class="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- 单词卡片 -->
      <div class="word-card glass-effect rounded-2xl p-6 card-shadow transform transition-all duration-300 flex-1 flex flex-col justify-between"
           :class="{ 'animate-bounce': showResult }">
        <div class="text-center flex-1 flex flex-col justify-center">
          <!-- 填空题 -->
          <div class="mb-6">
            <div class="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">
              {{ currentWord.meaning }}
            </div>

            <!-- 字母输入面板 -->
            <div v-if="!showResult" class="flex-1 flex flex-col justify-center">
              <LetterInputPanel
                :word="currentWord.word"
                :show-result="showResult"
                @answer="handleAnswer"
                @input-change="handleInputChange"
                ref="letterInputPanel"
              />
            </div>

            <!-- 结果显示 -->
            <div v-else class="result-display flex-1 flex flex-col justify-center items-center px-4">
              <div v-if="isCorrect" class="success-animation text-center">
                <!-- 成功动画和图标 -->
                <div class="success-icon-container mb-6">
                  <div class="success-icon">
                    🎯
                  </div>
                  <div class="success-particles">
                    <span class="particle particle-1">✨</span>
                    <span class="particle particle-2">⭐</span>
                    <span class="particle particle-3">💫</span>
                    <span class="particle particle-4">🌟</span>
                    <span class="particle particle-5">✨</span>
                  </div>
                </div>

                <!-- 随机鼓励文案 -->
                <div class="success-message mb-4">
                  <h3 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-2">
                    {{ getSuccessMessage() }}
                  </h3>
                  <p class="text-lg text-gray-600 dark:text-gray-300">
                    太棒了！继续保持这个势头
                  </p>
                </div>

                <!-- 进度指示器 -->
                <div class="progress-indicator mb-6">
                  <div class="flex items-center justify-center mb-2">
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      当前进度
                    </div>
                    <div class="mx-3 text-gray-300 dark:text-gray-600">•</div>
                    <div class="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {{ currentWordIndex + 1 }} / {{ studyWords.length }}
                    </div>
                  </div>
                  <div class="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      class="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      :style="{ width: `${((currentWordIndex + 1) / studyWords.length) * 100}%` }"
                    ></div>
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    已完成 {{ Math.round(((currentWordIndex + 1) / studyWords.length) * 100) }}%
                  </div>
                </div>

                <!-- 单词显示 -->
                <div class="word-display">
                  <div class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                    {{ currentWord.word }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ currentWord.meaning }}
                  </div>
                </div>

                <!-- 连续正确计数 -->
                <div v-if="consecutiveCorrect > 1" class="streak-indicator mt-4">
                  <div class="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                    <span class="text-orange-500">🔥</span>
                    <span class="text-sm font-medium text-orange-700 dark:text-orange-400">
                      连续正确 {{ consecutiveCorrect }} 次！
                    </span>
                  </div>
                </div>
              </div>

              <div v-else class="error-animation text-center">
                <!-- 错误动画和图标 -->
                <div class="error-icon-container mb-6">
                  <div class="error-icon">
                    💡
                  </div>
                  <div class="error-hint">
                    <span class="hint-particle hint-1">💭</span>
                    <span class="hint-particle hint-2">📚</span>
                    <span class="hint-particle hint-3">🎯</span>
                  </div>
                </div>

                <!-- 建设性反馈 -->
                <div class="error-message mb-4">
                  <h3 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                    {{ getEncouragementMessage() }}
                  </h3>
                  <p class="text-lg text-gray-600 dark:text-gray-300">
                    {{ getLearningHint() }}
                  </p>
                </div>

                <!-- 正确答案展示 -->
                <div class="correct-answer mb-6">
                  <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <span class="text-blue-500">✓</span>
                    <span class="text-sm font-medium text-blue-700 dark:text-blue-400">
                      正确答案：{{ currentWord.word }}
                    </span>
                  </div>
                </div>

                <!-- 学习机会 -->
                <div class="learning-opportunity mb-4">
                  <div class="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                    <span class="text-orange-500">🌱</span>
                    <span class="text-sm font-medium text-orange-700 dark:text-orange-400">
                      学习机会
                    </span>
                  </div>
                </div>

                <!-- 单词含义 -->
                <div class="word-meaning mb-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    含义
                  </div>
                  <div class="text-base font-medium text-gray-800 dark:text-gray-200">
                    {{ currentWord.meaning }}
                  </div>
                </div>

                <!-- 你的答案对比 -->
                <div v-if="userAnswer.trim()" class="answer-comparison">
                  <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    你的答案
                  </div>
                  <div class="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <span class="text-gray-700 dark:text-gray-300 font-medium">
                      {{ userAnswer.trim() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3 justify-center mt-4">
            <button
              v-if="showResult"
              @click="nextWord"
              class="px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {{ currentWordIndex < studyWords.length - 1 ? '下一个单词' : '完成学习' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="text-center text-base text-gray-500 dark:text-gray-400 mt-4">
        <div v-if="!showResult">
          💡 提示：{{ getStudyHint() }}
        </div>
      </div>
    </div>

    <!-- 学习完成 -->
    <div v-else-if="studyStatus === 'completed'" class="completed-view text-center py-8">
      <div class="text-6xl mb-4">🏆</div>
      <h2 class="text-3xl font-bold gradient-text mb-4">今日学习完成！</h2>

      <!-- 学习统计 -->
      <div class="glass-effect rounded-2xl p-6 mb-6 card-shadow">
        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">学习统计</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ studyStats.correct }}</div>
            <div class="text-base text-gray-600 dark:text-gray-400">正确</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ studyStats.wrong }}</div>
            <div class="text-base text-gray-600 dark:text-gray-400">错误</div>
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

    <!-- 停止学习确认对话框 -->
    <div v-if="showStopConfirmDialog" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="modal-content bg-white dark:bg-gray-800 rounded-xl p-6 m-4 max-w-sm w-full">
        <div class="text-center mb-4">
          <div class="text-4xl mb-3">⚠️</div>
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            确定要停止学习吗？
          </h3>
          <p class="text-base text-gray-600 dark:text-gray-400">
            停止后，本次学习的所有进度和统计数据都将被清除，需要重新开始学习
          </p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showStopConfirmDialog = false"
            class="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            继续学习
          </button>
          <button
            @click="stopStudy"
            class="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            确认停止
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { getDailyGoal, getSelectedCourse, updateStudyProgress, addErrorWord, addLearnedWord, removeErrorWord, updateStudyTime } from '../utils/studyData'
import { getTodayWords } from '../utils/studyData'
import { getRandomWords } from '../utils/coursesParser'
import LetterInputPanel from './LetterInputPanel.vue'
import WelcomeGuide from './WelcomeGuide.vue'

// 定义事件
const emit = defineEmits(['completed', 'study-status-changed'])

// 学习状态
const studyStatus = ref('ready') // ready, studying, completed

// 引导弹窗状态
const showWelcomeGuide = ref(false)

// 停止学习确认对话框状态
const showStopConfirmDialog = ref(false)

// 学习数据
const dailyGoal = ref(10)
const studyWords = ref([])
const currentWordIndex = ref(0)
const userAnswer = ref('')
const showResult = ref(false)
const isCorrect = ref(false)
const consecutiveCorrect = ref(0)

// 学习时间记录
const studyStartTime = ref(null)

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
    // 记录学习开始时间
    studyStartTime.value = Date.now()

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
    consecutiveCorrect.value++ // 增加连续正确计数
    addLearnedWord(currentWord.value)
    removeErrorWord(currentWord.value.word)
  } else {
    studyStats.value.wrong++
    consecutiveCorrect.value = 0 // 重置连续正确计数
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

    // 保存当前学习会话状态
    saveStudySession()
  } else {
    // 学习完成
    studyStatus.value = 'completed'

    // 计算并保存学习时长
    if (studyStartTime.value) {
      const studyEndTime = Date.now()
      const studyDurationMs = studyEndTime - studyStartTime.value
      const studyDurationMinutes = Math.max(1, Math.round(studyDurationMs / (1000 * 60)))
      console.log('学习完成 - 原始时长(ms):', studyDurationMs, '计算后时长:', studyDurationMinutes, '分钟')
      updateStudyTime(studyDurationMinutes)
      console.log('学习时长已保存到localStorage')
    }

    // 清除学习会话数据（学习已完成）
    localStorage.removeItem('learn_word_study_session')

    emit('completed')

    // 发送学习完成事件
    window.dispatchEvent(new CustomEvent('studyCompleted'))
  }
}

// 获取随机鼓励文案
const getSuccessMessage = () => {
  const messages = [
    '完美！',
    '太棒了！',
    '好极了！',
    '真厉害！',
    '超赞！',
    '继续保持！',
    '你真行！',
    '很优秀！',
    '做得好！',
    '太强了！',
    '完美无缺！',
    '出类拔萃！',
    '无可挑剔！'
  ]

  // 根据连续正确次数选择更强烈的鼓励
  if (consecutiveCorrect.value >= 5) {
    const fireMessages = [
      '火力全开！',
      '势不可挡！',
      '无人能挡！',
      '王者风范！',
      '如日中天！'
    ]
    return fireMessages[Math.floor(Math.random() * fireMessages.length)]
  }

  return messages[Math.floor(Math.random() * messages.length)]
}

// 获取鼓励性反馈信息（回答错误时使用）
const getEncouragementMessage = () => {
  const messages = [
    '继续努力！',
    '再接再厉！',
    '没关系！',
    '下次会更好！',
    '学习就是成长！',
    '每次尝试都是进步！',
    '错误是学习的机会！',
    '不要放弃！',
    '相信自己！',
    '你在进步！',
    '错误让你更强大！',
    '这是学习过程！',
    '坚持下去！'
  ]

  return messages[Math.floor(Math.random() * messages.length)]
}

// 获取学习提示
const getLearningHint = () => {
  const hints = [
    '错误是通向成功的必经之路',
    '每个错误都是进步的机会',
    '保持积极的心态，继续前进',
    '学习需要耐心和坚持',
    '你正在变得越来越好',
    '把错误当作学习的朋友',
    '坚持不懈，终会成功',
    '失败是成功之母',
    '每一次尝试都让你更接近答案',
    '保持学习的热情和好奇心'
  ]

  return hints[Math.floor(Math.random() * hints.length)]
}

// 停止学习（丢弃本次学习数据）
const stopStudy = () => {
  // 保存本次学习的时长（即使停止了也要记录学习时间）
  if (studyStartTime.value) {
    const currentTime = Date.now()
    const studyDurationMs = currentTime - studyStartTime.value
    const studyDurationMinutes = Math.max(1, Math.round(studyDurationMs / (1000 * 60)))
    updateStudyTime(studyDurationMinutes)
    console.log('学习停止 - 记录时长:', studyDurationMinutes, '分钟')
  }

  // 清除所有本次学习相关的数据
  // 注意：这里不更新学习进度统计，因为用户要放弃本次学习
  // 不调用 updateStudyProgress, addErrorWord, addLearnedWord 等

  // 重置学习状态
  studyStatus.value = 'ready'
  studyWords.value = []
  currentWordIndex.value = 0
  userAnswer.value = ''
  showResult.value = false
  isCorrect.value = false
  studyStats.value = { correct: 0, wrong: 0, accuracy: 0 }
  studyStartTime.value = null

  // 清除保存的学习会话数据
  localStorage.removeItem('learn_word_study_session')

  // 关闭确认对话框
  showStopConfirmDialog.value = false

  console.log('学习已停止，本次学习数据已清除')
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

  // 清除保存的学习会话数据
  localStorage.removeItem('learn_word_study_session')
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

// 监听学习状态变化
watch(studyStatus, (newStatus) => {
  emit('study-status-changed', newStatus)
}, { immediate: true })

// 监听键盘事件用于下一个单词
const handleKeydown = (event) => {
  if (showResult.value && event.key === 'Enter') {
    event.preventDefault()
    nextWord()
  }
}

// 保存当前学习时长
const saveCurrentStudyTime = () => {
  if (studyStartTime.value && studyStatus.value === 'studying') {
    const currentTime = Date.now()
    const studyDurationMs = currentTime - studyStartTime.value
    const studyDurationMinutes = Math.max(1, Math.round(studyDurationMs / (1000 * 60)))
    console.log('组件卸载 - 原始时长(ms):', studyDurationMs, '计算后时长:', studyDurationMinutes, '分钟')
    updateStudyTime(studyDurationMinutes)
    console.log('组件卸载 - 学习时长已保存')
  }
}

// 保存学习会话状态
const saveStudySession = () => {
  if (studyStatus.value === 'studying') {
    // 如果已经显示结果（回答正确/错误），则直接进入下一个单词
    let sessionCurrentWordIndex = currentWordIndex.value
    let sessionUserAnswer = ''
    let sessionShowResult = false
    let sessionIsCorrect = false

    // 如果还没显示结果，保存当前状态
    if (!showResult.value) {
      sessionCurrentWordIndex = currentWordIndex.value
      sessionUserAnswer = userAnswer.value
      sessionShowResult = false
      sessionIsCorrect = false
    } else {
      // 如果已经显示结果了，说明这个单词已经学完，下次恢复时应该直接到下一个单词
      // 但这里我们不推进index，因为推进index的逻辑在nextWord()中
      // 我们只标记当前单词已完成
      sessionCurrentWordIndex = currentWordIndex.value
      sessionUserAnswer = ''
      sessionShowResult = false
      sessionIsCorrect = false
    }

    const sessionData = {
      studyWords: studyWords.value,
      currentWordIndex: sessionCurrentWordIndex,
      userAnswer: sessionUserAnswer,
      showResult: sessionShowResult,
      isCorrect: sessionIsCorrect,
      studyStats: studyStats.value,
      studyStartTime: studyStartTime.value,
      timestamp: Date.now(),
      wordCompleted: showResult.value // 标记当前单词是否已完成
    }
    localStorage.setItem('learn_word_study_session', JSON.stringify(sessionData))
    console.log('学习会话状态已保存, wordCompleted:', showResult.value)
  }
}

// 恢复学习会话状态
const restoreStudySession = () => {
  const sessionData = localStorage.getItem('learn_word_study_session')
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData)
      const sessionAge = Date.now() - session.timestamp

      // 如果会话超过2小时，则不恢复（避免过期的会话）
      if (sessionAge > 2 * 60 * 60 * 1000) {
        localStorage.removeItem('learn_word_study_session')
        console.log('学习会话已过期，不恢复')
        return false
      }

      studyWords.value = session.studyWords || []
      studyStats.value = session.studyStats || { correct: 0, wrong: 0, accuracy: 0 }
      studyStartTime.value = session.studyStartTime || Date.now()

      // 如果当前单词已完成（已显示结果），则直接进入下一个单词
      if (session.wordCompleted) {
        if (session.currentWordIndex < studyWords.value.length - 1) {
          currentWordIndex.value = session.currentWordIndex + 1
          userAnswer.value = ''
          showResult.value = false
          isCorrect.value = false
          console.log('当前单词已完成，直接进入下一个单词')
        } else {
          // 如果已经是最后一个单词，则完成学习
          studyStatus.value = 'completed'
          localStorage.removeItem('learn_word_study_session')
          console.log('所有单词已完成')
          return true
        }
      } else {
        // 如果当前单词未完成，恢复到原来状态
        currentWordIndex.value = session.currentWordIndex || 0
        userAnswer.value = session.userAnswer || ''
        showResult.value = session.showResult || false
        isCorrect.value = session.isCorrect || false
      }

      studyStatus.value = 'studying'

      // 清除会话数据
      localStorage.removeItem('learn_word_study_session')

      console.log('学习会话状态已恢复')
      return true
    } catch (error) {
      console.error('恢复学习会话失败:', error)
      localStorage.removeItem('learn_word_study_session')
      return false
    }
  }
  return false
}

// 组件挂载时初始化
onMounted(() => {
  dailyGoal.value = getDailyGoal()

  // 尝试恢复之前的学习会话
  const hasRestoredSession = restoreStudySession()
  if (hasRestoredSession) {
    // 如果恢复了会话，需要重新初始化字母输入面板
    nextTick(() => {
      if (letterInputPanel.value && !showResult.value) {
        letterInputPanel.value.clear()
      }
    })
  }

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时保存学习时长和当前学习状态
onUnmounted(() => {
  saveCurrentStudyTime()
  saveStudySession()
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.today-study {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 0; /* 允许flex收缩 */
}

.ready-container,
.study-container {
  flex: 1;
  display: flex;
  min-height: 0; /* 允许flex收缩 */
}

.ready-container {
  align-items: center;
  justify-content: center;
}

.study-container {
  flex-direction: column;
  justify-content: space-between;
}

.word-card {
  transition: transform 0.3s ease;
  flex: 1;
  margin-bottom: 16px;
}


.success-animation {
  animation: successPulse 0.6s ease-out;
}

.error-animation {
  /* 移除抖动动画，使用新的建设性动画 */
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* errorShake动画已移除，不再使用 */

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

  .flex.items-center.gap-3 {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }
}

@media (max-width: 320px) {
  .px-3.py-1 {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}

/* 成功动画样式 */
.success-icon-container {
  position: relative;
  display: inline-block;
}

.success-icon {
  font-size: 4rem;
  animation: successZoom 0.6s ease-out;
  display: inline-block;
}

.success-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  font-size: 1.2rem;
  animation: particleFloat 2s ease-out forwards;
  opacity: 0;
}

.particle-1 {
  top: 20%;
  left: -20%;
  animation-delay: 0.1s;
}

.particle-2 {
  top: 10%;
  right: -20%;
  animation-delay: 0.3s;
}

.particle-3 {
  bottom: 10%;
  left: -15%;
  animation-delay: 0.5s;
}

.particle-4 {
  bottom: 20%;
  right: -15%;
  animation-delay: 0.7s;
}

.particle-5 {
  top: 50%;
  left: -25%;
  animation-delay: 0.9s;
}

@keyframes successZoom {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(5deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes particleFloat {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }
  20% {
    transform: translate(var(--x), var(--y)) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(var(--x) * 3), calc(var(--y) * 3)) scale(0.3);
    opacity: 0;
  }
}

.particle-1 { --x: -20px; --y: -30px; }
.particle-2 { --x: 20px; --y: -30px; }
.particle-3 { --x: -20px; --y: 30px; }
.particle-4 { --x: 20px; --y: 30px; }
.particle-5 { --x: -30px; --y: 0px; }

.success-message {
  animation: slideInUp 0.8s ease-out 0.2s both;
}

.progress-indicator {
  animation: slideInUp 0.8s ease-out 0.4s both;
}

.word-display {
  animation: slideInUp 0.8s ease-out 0.6s both;
}

.streak-indicator {
  animation: slideInUp 0.8s ease-out 0.8s both, pulse 2s ease-in-out infinite 1s;
}

@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 渐变文字效果 */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .success-icon {
    font-size: 3rem;
  }

  .success-message h3 {
    font-size: 2rem;
  }

  .progress-indicator {
    margin-bottom: 1rem;
  }
}

@media (max-width: 380px) {
  .success-icon {
    font-size: 2.5rem;
  }

  .success-message h3 {
    font-size: 1.5rem;
  }

  .success-message p {
    font-size: 1rem;
  }

  .progress-indicator .w-48 {
    width: 10rem;
  }
}

/* 错误页面动画样式 */
.error-icon-container {
  position: relative;
  display: inline-block;
}

.error-icon {
  font-size: 3.5rem;
  animation: errorPulse 0.8s ease-out;
  display: inline-block;
}

.error-hint {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.hint-particle {
  position: absolute;
  font-size: 1rem;
  animation: hintFloat 3s ease-out forwards;
  opacity: 0;
}

.hint-1 {
  top: 10%;
  left: -25%;
  animation-delay: 0.2s;
}

.hint-2 {
  top: 15%;
  right: -20%;
  animation-delay: 0.5s;
}

.hint-3 {
  bottom: 20%;
  left: 50%;
  animation-delay: 0.8s;
}

@keyframes errorPulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes hintFloat {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0;
  }
  20% {
    transform: translate(var(--hx), var(--hy)) rotate(10deg);
    opacity: 1;
  }
  80% {
    transform: translate(calc(var(--hx) * 2), calc(var(--hy) * 2)) rotate(-5deg);
    opacity: 1;
  }
  100% {
    transform: translate(calc(var(--hx) * 3), calc(var(--hy) * 3)) rotate(0deg);
    opacity: 0;
  }
}

.hint-1 { --hx: -25px; --hy: -20px; }
.hint-2 { --hx: 20px; --hy: -25px; }
.hint-3 { --hx: 0px; --hy: 25px; }

.error-message {
  animation: slideInUp 0.8s ease-out 0.3s both;
}

.correct-answer {
  animation: slideInUp 0.8s ease-out 0.5s both;
}

.learning-opportunity {
  animation: slideInUp 0.8s ease-out 0.7s both, gentle-pulse 3s ease-in-out infinite 1.5s;
}

.word-meaning {
  animation: slideInUp 0.8s ease-out 0.9s both;
}

.answer-comparison {
  animation: slideInUp 0.8s ease-out 1.1s both;
}

@keyframes gentle-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}
</style>