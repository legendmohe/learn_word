/**
 * 课程数据解析器
 * 从 JSON 文件中解析课程数据
 */

import coursesData from '../data/courses_data.json'

/**
 * 获取所有课程列表
 * @returns {Array} 课程列表
 */
export function getAllCourses() {
  return coursesData.courses.map(course => ({
    id: course.id,
    name: course.name,
    emoji: course.emoji,
    wordCount: course.words.length,
    description: course.description,
    words: course.words
  }))
}

/**
 * 根据课程名获取随机单词
 * @param {string} courseName 课程名
 * @param {number} count 单词数量
 * @returns {Array} 单词列表
 */
export function getRandomWords(courseName, count = 10) {
  const course = coursesData.courses.find(c => c.name === courseName)
  if (!course || !course.words || course.words.length === 0) {
    console.warn(`课程 "${courseName}" 不存在或没有单词数据`)
    return []
  }

  // 随机选择指定数量的单词
  const shuffled = [...course.words].sort(() => 0.5 - Math.random())
  const result = shuffled.slice(0, count)

  // 调试信息
  console.log('📚 getRandomWords 调试:', {
    courseName,
    requestedCount: count,
    actualCount: result.length,
    sampleWord: result[0] ? {
      word: result[0].word,
      phonemes: result[0].phonemes
    } : null
  })

  return result
}

/**
 * 根据课程ID获取课程信息
 * @param {string} courseId 课程ID
 * @returns {Object|null} 课程信息
 */
export function getCourseById(courseId) {
  const course = coursesData.courses.find(c => c.id === courseId)
  if (!course) return null

  return {
    id: course.id,
    name: course.name,
    emoji: course.emoji,
    wordCount: course.words.length,
    description: course.description,
    words: course.words
  }
}

/**
 * 根据课程名获取课程信息
 * @param {string} courseName 课程名
 * @returns {Object|null} 课程信息
 */
export function getCourseByName(courseName) {
  const course = coursesData.courses.find(c => c.name === courseName)
  if (!course) return null

  return {
    id: course.id,
    name: course.name,
    emoji: course.emoji,
    wordCount: course.words.length,
    description: course.description,
    words: course.words
  }
}

/**
 * 获取默认课程设置
 * @returns {Object} 默认设置
 */
export function getDefaultSettings() {
  return coursesData.settings
}

/**
 * 验证课程是否存在
 * @param {string} courseName 课程名
 * @returns {boolean} 是否存在
 */
export function isValidCourse(courseName) {
  return coursesData.courses.some(c => c.name === courseName)
}

/**
 * 获取所有课程名称列表
 * @returns {Array} 课程名称列表
 */
export function getCourseNames() {
  return coursesData.courses.map(course => course.name)
}