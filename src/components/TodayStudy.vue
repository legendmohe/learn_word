<template>
  <div class="today-study mt-6">
    <!-- 学习状态卡片 -->
    <div v-if="studyStatus === 'ready'" class="ready-container flex items-center justify-center h-full">
      <div class="text-center">
        <div class="text-6xl mb-4">📚</div>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">开始今日学习</h2>
        <p class="text-base text-gray-600 dark:text-gray-400 mb-6">
          今日需要学习 {{ dailyGoal }} 个单词，包含复习和新单词
        </p>
        <button
          @click="showStartConfirmDialog = true"
          class="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          开始学习
        </button>
      </div>
    </div>

    <!-- 学习进行中 -->
    <div v-else-if="studyStatus === 'studying'" class="study-container">
      <!-- 顶部导航：单词进度和停止按钮 -->
      <div class="mb-4">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600 dark:text-gray-400">单词进度</span>
          <div class="flex items-center gap-3">
            <button
              @click="showStopConfirmDialog = true"
              class="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
            >
              停止学习
            </button>
            <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
              {{ currentWordIndex + 1 }} / {{ studyWords.length }}
            </span>
          </div>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
          <div
            class="bg-gradient-to-r from-primary-500 to-accent-500 h-1.5 rounded-full transition-all duration-300"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- 步骤指示器 -->
      <StepIndicator
        :current-step="currentStep"
        :step-progress="currentStepProgress"
        :allow-step-navigation="allowStepNavigation"
        :step-errors="currentStepErrors"
        @step-change="handleStepChange"
        @previous-step="goToPreviousStep"
        @next-step="goToNextStep"
        class="mb-6"
      />

      <!-- 单词卡片 -->
      <div class="word-card glass-effect rounded-2xl p-6 card-shadow transform transition-all duration-300 flex-1 flex flex-col">
        <div class="text-center flex-1 flex flex-col justify-center">
          <!-- 步骤内容区域 -->
          <div class="step-content">
            <!-- 步骤1: 听音学义 -->
            <ListenStep
              v-if="currentStep === 0"
              :word="currentWord"
              @completed="handleStepCompleted"
            />

            <!-- 步骤2: 边读边学 -->
            <RecordStep
              v-else-if="currentStep === 1"
              :word="currentWord"
              @completed="handleStepCompleted"
            />

            <!-- 步骤3: 小测试 -->
            <TestStep
              v-else-if="currentStep === 2"
              :word="currentWord"
              :other-words="otherWordsForTest"
              @completed="handleStepCompleted"
              @answer="handleStepAnswer"
            />

            <!-- 步骤4: 拆分拼写 -->
            <PhonicsStep
              v-else-if="currentStep === 3"
              :word="currentWord"
              @completed="handleStepCompleted"
              @answer="handleStepAnswer"
            />

            <!-- 步骤5: 全字母拼 -->
            <SpellingStep
              v-else-if="currentStep === 4"
              :word="currentWord"
              :is-last-step="currentWordIndex >= studyWords.length - 1"
              @completed="handleStepCompleted"
              @answer="handleStepAnswer"
            />
          </div>
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

    <!-- 开始学习确认对话框 -->
    <div v-if="showStartConfirmDialog" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="modal-content bg-white dark:bg-gray-800 rounded-xl p-6 m-4 max-w-sm w-full">
        <div class="text-center mb-4">
          <div class="text-5xl mb-4 animate-bounce">🚀</div>
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            准备好开始学习了吗？
          </h3>
          <p class="text-base text-gray-600 dark:text-gray-400 mb-4">
            今天的努力是明天成功的基础！<br>
            让我们一起坚持，每一个单词都是进步！
          </p>

          <!-- 激励语句 -->
          <div class="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg p-3 mb-4">
            <div class="text-sm font-medium text-primary-700 dark:text-primary-300">
              💪 {{ getMotivationalQuote() }}
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="showStartConfirmDialog = false"
            class="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
          >
            再想想
          </button>
          <button
            @click="confirmStartStudy"
            class="flex-1 py-3 px-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            开始学习！
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
import { playWordAudio, getAudioEngineInfo } from '../utils/audioService'
import WelcomeGuide from './WelcomeGuide.vue'
import StepIndicator from './StepIndicator.vue'
import ListenStep from './ListenStep.vue'
import RecordStep from './RecordStep.vue'
import TestStep from './TestStep.vue'
import PhonicsStep from './PhonicsStep.vue'
import SpellingStep from './SpellingStep.vue'

// 定义事件
const emit = defineEmits(['completed', 'study-status-changed'])

// 注册组件
const components = {
  WelcomeGuide,
  StepIndicator,
  ListenStep,
  RecordStep,
  TestStep,
  PhonicsStep,
  SpellingStep
}

// 学习状态
const studyStatus = ref('ready') // ready, studying, completed

// 引导弹窗状态
const showWelcomeGuide = ref(false)

// 停止学习确认对话框状态
const showStopConfirmDialog = ref(false)
// 开始学习确认对话框状态
const showStartConfirmDialog = ref(false)

// 学习数据
const dailyGoal = ref(10)
const studyWords = ref([])
const currentWordIndex = ref(0)
const consecutiveCorrect = ref(0)

// 多步骤学习状态
const currentStep = ref(0) // 当前学习步骤 0-4

const allowStepNavigation = ref(true) // 是否允许步骤导航
const spellingAttempts = ref(0) // 拼写尝试次数
const maxSpellingAttempts = 2 // 最大拼写尝试次数

// 当前单词的错误状态（按步骤跟踪）
const currentStepErrors = ref({
  test: false,
  phonics: false,
  spelling: false
}) // 当前单词各步骤的错误状态

// 为测试步骤准备的其他单词数据
const otherWordsForTest = computed(() => {
  // 获取当前单词之外的其他单词作为测试干扰项
  return studyWords.value.filter((_, index) => index !== currentWordIndex.value)
})

// 学习时间记录
const studyStartTime = ref(null)

// 学习统计
const studyStats = ref({
  correct: 0,
  wrong: 0,
  accuracy: 0
})

// 语音播放相关状态
const isPlayingAudio = ref(false)
const audioEngineInfo = ref(null)

// 计算属性
const currentWord = computed(() => {
  return studyWords.value[currentWordIndex.value] || {}
})

const progressPercentage = computed(() => {
  return Math.round(((currentWordIndex.value + 1) / studyWords.value.length) * 100)
})

// 当前单词的步骤进度
const currentStepProgress = computed(() => {
  if (!currentWord.value?.stepProgress) {
    return {
      listen: false,
      record: false,
      test: false,
      phonics: false,
      spelling: false
    }
  }
  return currentWord.value.stepProgress
})

// 开始学习
const startStudy = async () => {
  // 显示确认对话框
  showStartConfirmDialog.value = true
}

// 确认开始学习
const confirmStartStudy = async () => {
  showStartConfirmDialog.value = false

  // 检查是否首次使用
  const isFirstTime = !localStorage.getItem('learn_word_welcome_shown')
  if (isFirstTime) {
    showWelcomeGuide.value = true
    return
  }

  proceedToStudy()
}

// 获取激励语句
const getMotivationalQuote = () => {
  const quotes = [
    "学习是通向成功的阶梯！",
    "每一个单词都让你更接近目标！",
    "坚持就是胜利，加油！",
    "今天的努力，明天的收获！",
    "相信自己，你一定能做到！",
    "知识改变命运，学习成就未来！",
    "积累的力量是无穷的！",
    "每学一个单词，世界就大一点！",
    "学习让生活更精彩！",
    "你的努力终将绽放光芒！"
  ]
  return quotes[Math.floor(Math.random() * quotes.length)]
}

// 播放单词语音 - 使用新的音频服务
const handlePlayWordAudio = async () => {
  if (!currentWord.value?.word) return

  // 如果正在播放，停止当前播放
  if (isPlayingAudio.value) {
    isPlayingAudio.value = false
    return
  }

  try {
    isPlayingAudio.value = true
    const success = await playWordAudio(currentWord.value.word, {
      lang: 'en-US',
      rate: 0.75,
      // 可以添加其他选项
    })

    if (!success) {
      console.warn('语音播放失败')
    }
  } catch (error) {
    console.error('语音播放错误:', error)
  } finally {
    isPlayingAudio.value = false
  }
}

// 实际开始学习的逻辑
const proceedToStudy = async () => {
  try {
    // 记录学习开始时间
    studyStartTime.value = Date.now()

    // 获取今日学习单词
    const todayWords = getTodayWords(dailyGoal.value)
    console.log('📚 获取到今日单词:', {
      dailyGoal: dailyGoal.value,
      wordsCount: todayWords.length,
      words: todayWords.map(w => ({ word: w.word, meaning: w.meaning }))
    })

    if (todayWords.length === 0) {
      // 如果没有错误单词，使用新单词
      const courseName = getSelectedCourse()
      studyWords.value = getRandomWords(courseName, dailyGoal.value)
      console.log('📚 使用新单词:', {
        courseName,
        wordsCount: studyWords.value.length,
        words: studyWords.value.map(w => ({ word: w.word, meaning: w.meaning }))
      })
    } else {
      studyWords.value = todayWords
    }

    // 重置学习状态
    currentWordIndex.value = 0
    currentStep.value = 0
    spellingAttempts.value = 0
    consecutiveCorrect.value = 0
    studyStats.value = { correct: 0, wrong: 0, accuracy: 0 }
    studyStatus.value = 'studying'

    // 重置当前单词的步骤进度
    if (studyWords.value.length > 0) {
      resetWordStepProgress()
    }
  } catch (error) {
    console.error('开始学习失败:', error)
    // 如果获取错误单词失败，使用新单词
    const courseName = getSelectedCourse()
    studyWords.value = getRandomWords(courseName, dailyGoal.value)
    currentWordIndex.value = 0
    currentStep.value = 0
    spellingAttempts.value = 0
    consecutiveCorrect.value = 0
    studyStats.value = { correct: 0, wrong: 0, accuracy: 0 }
    studyStatus.value = 'studying'
  }
}

// 重置当前单词的步骤进度
const resetWordStepProgress = () => {
  if (studyWords.value[currentWordIndex.value]) {
    studyWords.value[currentWordIndex.value].stepProgress = {
      listen: false,
      record: false,
      test: false,
      phonics: false,
      spelling: false
    }
  }
  // 重置错误状态
  currentStepErrors.value = {
    test: false,
    phonics: false,
    spelling: false
  }
}

// 步骤导航相关方法
const handleStepChange = (newStep) => {
  if (newStep < 0 || newStep > 4) return

  const stepNames = ['listen', 'record', 'test', 'phonics', 'spelling']
  const currentWordData = studyWords.value[currentWordIndex.value]

  // 检查是否可以导航到目标步骤
  if (currentWordData && currentWordData.stepProgress) {
    // 只允许导航到：已完成的步骤 或 下一个未完成的步骤
    const isStepCompleted = currentWordData.stepProgress[stepNames[newStep]]
    const isNextUncompletedStep = newStep === currentStep.value + 1

    if (isStepCompleted || isNextUncompletedStep) {
      currentStep.value = newStep
        } else {
      }
  }
}

const goToPreviousStep = () => {
  if (currentStep.value > 0) {
    // 允许回到任何已完成的步骤或前面的步骤
    currentStep.value--
    }
}

const goToNextStep = () => {
  if (currentStep.value < 4) {
    // 只能到下一步，不能跳过
    currentStep.value++
      }
}


// 获取步骤提示
const getStepHint = () => {
  const hints = {
    0: '点击喇叭按钮，仔细听单词的发音',
    1: '长按录音按钮，录下你的读音',
    2: '选择正确的中文意思',
    3: '按照音素顺序拼写出单词',
    4: '使用所有字母完整拼写出单词'
  }
  return hints[currentStep.value] || '继续学习...'
}

// 处理步骤完成
const handleStepCompleted = (stepData = {}) => {
  const stepNames = ['listen', 'record', 'test', 'phonics', 'spelling']
  const currentStepName = stepNames[currentStep.value]

  // 标记当前步骤为完成
  if (studyWords.value[currentWordIndex.value]) {
    studyWords.value[currentWordIndex.value].stepProgress[currentStepName] = true
  }

  // 如果不是最后一步，自动进入下一步
  if (currentStep.value < 4) {
    currentStep.value++
  } else {
    // 如果是最后一步，完成当前单词的学习
    completeCurrentWord()
  }
}

// 处理步骤答案（用于测试和拼写步骤）
const handleStepAnswer = (answerData) => {
  // 更新学习统计
  if (answerData.correct) {
    studyStats.value.correct++
    if (answerData.type !== 'spelling') {
      consecutiveCorrect.value++
    }
    addLearnedWord(currentWord.value)
    removeErrorWord(currentWord.value.word)
  } else {
    studyStats.value.wrong++
    consecutiveCorrect.value = 0

    // 标记当前步骤的错误状态
    if (answerData.type === 'test' || answerData.type === 'phonics' || answerData.type === 'spelling') {
      currentStepErrors.value[answerData.type] = true
    }

    // 添加到错误单词列表
    addErrorWord({
      word: currentWord.value.word,
      meaning: currentWord.value.meaning,
      userAnswer: answerData.selectedAnswer || '',
      type: answerData.type || 'unknown',
      step: answerData.type === 'test' ? '小测试' : answerData.type === 'spelling' ? '拼写' : '其他'
    })
  }

  // 更新学习进度
  updateStudyProgress(answerData.correct)

  // 计算正确率
  const total = studyStats.value.correct + studyStats.value.wrong
  studyStats.value.accuracy = Math.round((studyStats.value.correct / total) * 100)

  // 触觉反馈
  if (navigator.vibrate) {
    navigator.vibrate(answerData.correct ? 100 : [50, 50, 50])
  }
}

// 完成当前单词的学习
const completeCurrentWord = () => {
  console.log('🎯 完成当前单词:', {
    currentWordIndex: currentWordIndex.value,
    totalWords: studyWords.value.length,
    isLastWord: currentWordIndex.value >= studyWords.value.length - 1,
    currentWord: studyWords.value[currentWordIndex.value]?.word
  })

  // 标记拼写步骤完成
  if (studyWords.value[currentWordIndex.value]) {
    studyWords.value[currentWordIndex.value].stepProgress.spelling = true
  }

  // 如果不是最后一个单词，进入下一个单词
  if (currentWordIndex.value < studyWords.value.length - 1) {
    setTimeout(() => {
      nextWord()
    }, 1500)
  } else {
    // 学习完成
    setTimeout(() => {
      studyStatus.value = 'completed'

      // 计算并保存学习时长
      if (studyStartTime.value) {
        const studyEndTime = Date.now()
        const studyDurationMs = studyEndTime - studyStartTime.value
        const studyDurationMinutes = Math.max(1, Math.round(studyDurationMs / (1000 * 60)))
        updateStudyTime(studyDurationMinutes)
      }

      // 清理学习会话
      localStorage.removeItem('learn_word_study_session')

      // 发送学习完成事件
      emit('completed')
    }, 1500)
  }
}


// 下一个单词
const nextWord = () => {
  console.log('➡️ 进入下一个单词:', {
    currentIndex: currentWordIndex.value,
    nextIndex: currentWordIndex.value + 1,
    totalWords: studyWords.value.length,
    currentWord: studyWords.value[currentWordIndex.value]?.word,
    nextWord: studyWords.value[currentWordIndex.value + 1]?.word
  })

  if (currentWordIndex.value < studyWords.value.length - 1) {
    currentWordIndex.value++
    currentStep.value = 0 // 重置到第一步
    spellingAttempts.value = 0 // 重置拼写尝试次数

    // 重置新单词的步骤进度
    resetWordStepProgress()

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
  currentStep.value = 0
  currentStepErrors.value = {
    test: false,
    phonics: false,
    spelling: false
  }
  consecutiveCorrect.value = 0
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
  currentStep.value = 0
  currentStepErrors.value = {
    test: false,
    phonics: false,
    spelling: false
  }
  consecutiveCorrect.value = 0
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
  // 重置错误状态
  currentStepErrors.value = {
    test: false,
    phonics: false,
    spelling: false
  }
})

// 监听学习状态变化
watch(studyStatus, (newStatus) => {
  emit('study-status-changed', newStatus)
}, { immediate: true })


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
    const sessionData = {
      studyWords: studyWords.value,
      currentWordIndex: currentWordIndex.value,
      currentStep: currentStep.value,
      studyStats: studyStats.value,
      studyStartTime: studyStartTime.value,
      timestamp: Date.now()
    }
    localStorage.setItem('learn_word_study_session', JSON.stringify(sessionData))
    console.log('学习会话状态已保存')
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
      currentWordIndex.value = session.currentWordIndex || 0
      currentStep.value = session.currentStep || 0

      // 重置错误状态
      currentStepErrors.value = {
    test: false,
    phonics: false,
    spelling: false
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

  // 获取语音引擎信息
  audioEngineInfo.value = getAudioEngineInfo()
  if (audioEngineInfo.value) {
    console.log('当前语音引擎:', audioEngineInfo.value)
  }

  // 尝试恢复之前的学习会话
  restoreStudySession()

  })

// 组件卸载时保存学习时长和当前学习状态
onUnmounted(() => {
  saveCurrentStudyTime()
  saveStudySession()
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