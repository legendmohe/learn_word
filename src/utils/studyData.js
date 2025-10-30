/**
 * 学习数据管理
 * 使用localStorage存储学习进度、错误记录等数据
 */

import { getDefaultSettings, isValidCourse, getRandomWords } from './coursesParser.js'

const STORAGE_KEYS = {
  STUDY_PROGRESS: 'learn_word_study_progress',
  ERROR_WORDS: 'learn_word_error_words',
  LEARNED_WORDS: 'learn_word_learned_words',
  DAILY_GOAL: 'learn_word_daily_goal',
  SELECTED_COURSE: 'learn_word_selected_course',
  STUDY_TIME: 'learn_word_study_time',
  DARK_MODE: 'learn_word_dark_mode'
}

// 获取默认设置
const DEFAULT_SETTINGS = getDefaultSettings()
const DEFAULT_DAILY_GOAL = DEFAULT_SETTINGS.defaultDailyGoal
const DEFAULT_COURSE = DEFAULT_SETTINGS.defaultCourse

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
  const savedCourse = localStorage.getItem(STORAGE_KEYS.SELECTED_COURSE)

  // 如果保存的课程存在且有效，则返回
  if (savedCourse && isValidCourse(savedCourse)) {
    return savedCourse
  }

  // 否则返回默认课程
  return DEFAULT_COURSE
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
 * 增强单词数据，确保学习流程所需字段完整
 * @param {Object} word 原始单词数据
 * @returns {Object} 增强后的单词数据
 */
export function enhanceWordData(word) {
  return {
    ...word,
    // 添加学习流程相关字段
    phonemes: word.phonemes || null, // 音素拆分
    currentStep: 0, // 当前学习步骤
    stepProgress: { // 各步骤完成情况
      listen: false,
      record: false,
      test: false,
      phonics: false,
      spelling: false
    },
    // 各步骤的状态数据
    stepStates: { // 保存每个步骤的用户输入和结果
      listen: word.stepStates?.listen || { completed: false },
      record: word.stepStates?.record || { completed: false },
      test: word.stepStates?.test || {
        selectedIndex: null,
        showResult: false,
        completed: false
      },
      phonics: word.stepStates?.phonics || {
        selectedPhonemes: [],
        showResult: false,
        completed: false
      },
      spelling: word.stepStates?.spelling || {
        attempts: 0,
        showResult: false,
        completed: false
      }
    },
    // 确保必要字段存在
    errorCount: word.errorCount || 0,
    firstErrorDate: word.firstErrorDate || null,
    lastErrorDate: word.lastErrorDate || null,
    firstLearnDate: word.firstLearnDate || null,
    reviewCount: word.reviewCount || 0
  }
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
    .map(word => enhanceWordData(word))

  // 剩余数量用新单词填充
  const remainingCount = count - recentErrors.length - frequentErrors.length

  let words = [...recentErrors.map(word => enhanceWordData(word)), ...frequentErrors]

  if (remainingCount > 0) {
    // 同步获取新单词
    const newWords = getRandomWords(selectedCourse, remainingCount)
    words = [...words, ...newWords]
  }

  // 对所有单词进行数据增强
  return words.slice(0, count).map(word => enhanceWordData(word))
}

/**
 * 导出所有学习数据为JSON格式
 * @returns {Object} 包含所有学习数据的对象
 */
export function exportAllData() {
  const data = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    studyProgress: getStudyProgress(),
    errorWords: getErrorWords(),
    learnedWords: getLearnedWords(),
    dailyGoal: getDailyGoal(),
    selectedCourse: getSelectedCourse(),
    studyTime: getStudyTime(),
    darkMode: localStorage.getItem(STORAGE_KEYS.DARK_MODE) === 'true'
  }
  return data
}

/**
 * 导入学习数据
 * @param {Object} data 要导入的数据
 * @returns {Object} 导入结果
 */
export function importData(data) {
  try {
    // 验证数据格式
    if (!data || typeof data !== 'object') {
      throw new Error('无效的数据格式')
    }

    const result = {
      success: true,
      imported: [],
      errors: []
    }

    // 导入学习进度
    if (data.studyProgress && typeof data.studyProgress === 'object') {
      localStorage.setItem(STORAGE_KEYS.STUDY_PROGRESS, JSON.stringify(data.studyProgress))
      result.imported.push('学习进度')
    }

    // 导入错误单词
    if (data.errorWords && Array.isArray(data.errorWords)) {
      localStorage.setItem(STORAGE_KEYS.ERROR_WORDS, JSON.stringify(data.errorWords))
      result.imported.push('错误单词')
    }

    // 导入已学单词
    if (data.learnedWords && Array.isArray(data.learnedWords)) {
      localStorage.setItem(STORAGE_KEYS.LEARNED_WORDS, JSON.stringify(data.learnedWords))
      result.imported.push('已学单词')
    }

    // 导入每日目标
    if (data.dailyGoal && typeof data.dailyGoal === 'number') {
      localStorage.setItem(STORAGE_KEYS.DAILY_GOAL, data.dailyGoal.toString())
      result.imported.push('每日目标')
    }

    // 导入选中课程
    if (data.selectedCourse && typeof data.selectedCourse === 'string' && isValidCourse(data.selectedCourse)) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_COURSE, data.selectedCourse)
      result.imported.push('选中课程')
    }

    // 导入学习时长
    if (data.studyTime && typeof data.studyTime === 'number') {
      localStorage.setItem(STORAGE_KEYS.STUDY_TIME, data.studyTime.toString())
      result.imported.push('学习时长')
    }

    // 导入深色模式设置
    if (data.darkMode !== undefined) {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, data.darkMode.toString())
      result.imported.push('主题设置')
    }

    if (result.imported.length === 0) {
      result.success = false
      result.errors.push('没有可导入的数据')
    }

    return result

  } catch (error) {
    return {
      success: false,
      imported: [],
      errors: [error.message]
    }
  }
}

/**
 * 清空所有学习数据
 * @returns {boolean} 是否成功清空
 */
export function clearAllData() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    return true
  } catch (error) {
    console.error('清空数据失败:', error)
    return false
  }
}