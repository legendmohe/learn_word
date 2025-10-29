/**
 * 学习数据管理
 * 使用localStorage存储学习进度、错误记录等数据
 */

const STORAGE_KEYS = {
  STUDY_PROGRESS: 'learn_word_study_progress',
  ERROR_WORDS: 'learn_word_error_words',
  LEARNED_WORDS: 'learn_word_learned_words',
  DAILY_GOAL: 'learn_word_daily_goal',
  SELECTED_COURSE: 'learn_word_selected_course',
  STUDY_TIME: 'learn_word_study_time',
  DARK_MODE: 'learn_word_dark_mode'
}

// 默认每日学习目标
const DEFAULT_DAILY_GOAL = 10

/**
 * 获取学习进度
 * @returns {Object} 学习进度数据
 */
export function getStudyProgress() {
  const data = localStorage.getItem(STORAGE_KEYS.STUDY_PROGRESS)
  if (!data) {
    return {
      totalLearned: 0,
      correctCount: 0,
      wrongCount: 0,
      streak: 0,
      lastStudyDate: null
    }
  }
  return JSON.parse(data)
}

/**
 * 更新学习进度
 * @param {boolean} isCorrect 是否正确
 */
export function updateStudyProgress(isCorrect) {
  const progress = getStudyProgress()
  const today = new Date().toDateString()

  progress.totalLearned++

  if (isCorrect) {
    progress.correctCount++
  } else {
    progress.wrongCount++
  }

  // 更新学习连续天数
  if (progress.lastStudyDate !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (progress.lastStudyDate === yesterday.toDateString()) {
      progress.streak++
    } else {
      progress.streak = 1
    }

    progress.lastStudyDate = today
  }

  localStorage.setItem(STORAGE_KEYS.STUDY_PROGRESS, JSON.stringify(progress))
  return progress
}

/**
 * 获取错误单词列表
 * @returns {Array} 错误单词列表
 */
export function getErrorWords() {
  const data = localStorage.getItem(STORAGE_KEYS.ERROR_WORDS)
  return data ? JSON.parse(data) : []
}

/**
 * 添加错误单词
 * @param {Object} wordData 单词数据
 */
export function addErrorWord(wordData) {
  const errorWords = getErrorWords()
  const existingIndex = errorWords.findIndex(item => item.word === wordData.word)

  if (existingIndex !== -1) {
    // 增加错误次数
    errorWords[existingIndex].errorCount++
    errorWords[existingIndex].lastErrorDate = new Date().toISOString()
  } else {
    // 添加新的错误单词
    errorWords.push({
      ...wordData,
      errorCount: 1,
      firstErrorDate: new Date().toISOString(),
      lastErrorDate: new Date().toISOString()
    })
  }

  localStorage.setItem(STORAGE_KEYS.ERROR_WORDS, JSON.stringify(errorWords))
  return errorWords
}

/**
 * 移除错误单词（当用户答对时）
 * @param {string} word 单词
 */
export function removeErrorWord(word) {
  let errorWords = getErrorWords()
  errorWords = errorWords.filter(item => item.word !== word)
  localStorage.setItem(STORAGE_KEYS.ERROR_WORDS, JSON.stringify(errorWords))
  return errorWords
}

/**
 * 清空所有错误单词
 */
export function clearAllErrorWords() {
  localStorage.removeItem(STORAGE_KEYS.ERROR_WORDS)
}

/**
 * 获取已学单词列表
 * @returns {Array} 已学单词列表
 */
export function getLearnedWords() {
  const data = localStorage.getItem(STORAGE_KEYS.LEARNED_WORDS)
  return data ? JSON.parse(data) : []
}

/**
 * 添加已学单词
 * @param {Object} wordData 单词数据
 */
export function addLearnedWord(wordData) {
  const learnedWords = getLearnedWords()
  const existingIndex = learnedWords.findIndex(item => item.word === wordData.word)

  if (existingIndex === -1) {
    learnedWords.push({
      ...wordData,
      firstLearnDate: new Date().toISOString(),
      reviewCount: 1
    })
  } else {
    learnedWords[existingIndex].reviewCount++
    learnedWords[existingIndex].lastReviewDate = new Date().toISOString()
  }

  localStorage.setItem(STORAGE_KEYS.LEARNED_WORDS, JSON.stringify(learnedWords))
  return learnedWords
}

/**
 * 获取每日学习目标
 * @returns {number} 每日学习目标
 */
export function getDailyGoal() {
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_GOAL)
  return data ? parseInt(data) : DEFAULT_DAILY_GOAL
}

/**
 * 设置每日学习目标
 * @param {number} goal 学习目标
 */
export function setDailyGoal(goal) {
  localStorage.setItem(STORAGE_KEYS.DAILY_GOAL, goal.toString())
}

/**
 * 获取今日学习进度
 * @returns {Object} 今日学习数据
 */
export function getTodayProgress() {
  const today = new Date().toDateString()
  const learnedWords = getLearnedWords()

  const todayWords = learnedWords.filter(word => {
    const learnDate = new Date(word.firstLearnDate).toDateString()
    return learnDate === today
  })

  const dailyGoal = getDailyGoal()
  const progress = Math.min((todayWords.length / dailyGoal) * 100, 100)

  return {
    todayCount: todayWords.length,
    dailyGoal,
    progress,
    isCompleted: todayWords.length >= dailyGoal
  }
}

/**
 * 获取当前选中的课程
 * @returns {string} 课程名
 */
export function getSelectedCourse() {
  return localStorage.getItem(STORAGE_KEYS.SELECTED_COURSE) || '基础词汇'
}

/**
 * 设置当前选中的课程
 * @param {string} courseName 课程名
 */
export function setSelectedCourse(courseName) {
  localStorage.setItem(STORAGE_KEYS.SELECTED_COURSE, courseName)
}

/**
 * 获取学习时长
 * @returns {number} 学习时长（分钟）
 */
export function getStudyTime() {
  const data = localStorage.getItem(STORAGE_KEYS.STUDY_TIME)
  return data ? parseInt(data) : 0
}

/**
 * 更新学习时长
 * @param {number} minutes 学习时长（分钟）
 */
export function updateStudyTime(minutes) {
  const currentTime = getStudyTime()
  const newTime = currentTime + minutes
  localStorage.setItem(STORAGE_KEYS.STUDY_TIME, newTime.toString())
  console.log('updateStudyTime - 原时长:', currentTime, '分钟, 新增:', minutes, '分钟, 总时长:', newTime, '分钟')
}

/**
 * 获取今日学习单词（用于复习）
 * @param {number} count 单词数量
 * @returns {Array} 单词列表
 */
export function getTodayWords(count) {
  const errorWords = getErrorWords()
  const selectedCourse = getSelectedCourse()

  // 获取昨天的错误单词（优先级最高）
  const recentErrors = errorWords
    .filter(word => {
      const errorDate = new Date(word.lastErrorDate)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return errorDate.toDateString() === yesterday.toDateString()
    })
    .slice(0, Math.ceil(count / 3))

  // 获取经常错误的单词
  const frequentErrors = errorWords
    .filter(word => word.errorCount >= 3)
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, Math.ceil(count / 3))

  // 剩余数量用新单词填充
  const remainingCount = count - recentErrors.length - frequentErrors.length

  let words = [...recentErrors, ...frequentErrors]

  if (remainingCount > 0) {
    // 静态导入以避免异步问题
    import('./coursesParser.js').then(({ getRandomWords }) => {
      const newWords = getRandomWords(selectedCourse, remainingCount)
      words = [...words, ...newWords]
      return words.slice(0, count)
    }).catch(() => {
      // 如果导入失败，返回已有的单词
      return words.slice(0, count)
    })
  }

  return words.slice(0, count)
}