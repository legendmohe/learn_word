/**
 * 课程配置文件解析器
 * 解析properties格式的课程配置文件
 */

// 原始properties数据
const COURSES_DATA = `基础词汇.10=hello:你好,world:世界,apple:苹果,book:书,water:水,sun:太阳,moon:月亮,star:星星,tree:树,flower:花
日常用语.15=good:好的,bad:坏的,big:大的,small:小的,hot:热的,cold:冷的,happy:快乐的,sad:悲伤的,fast:快的,slow:慢的,easy:简单的,difficult:困难的,beautiful:美丽的,ugly:丑陋的,strong:强壮的
食物词汇.12=rice:米饭,noodle:面条,bread:面包,milk:牛奶,egg:鸡蛋,meat:肉,fish:鱼,vegetable:蔬菜,fruit:水果,chicken:鸡肉,beef:牛肉,pork:猪肉
动物词汇.15=dog:狗,cat:猫,bird:鸟,fish:鱼,horse:马,cow:牛,pig:猪,sheep:羊,tiger:老虎,lion:狮子,elephant:大象,monkey:猴子,panda:熊猫,rabbit:兔子,duck:鸭子
颜色词汇.10=red:红色,blue:蓝色,green:绿色,yellow:黄色,black:黑色,white:白色,orange:橙色,purple:紫色,pink:粉色,grey:灰色
学习用品.12=pen:钢笔,pencil:铅笔,eraser:橡皮,ruler:尺子,notebook:笔记本,bag:书包,desk:桌子,chair:椅子,computer:电脑,phone:电话,paper:纸,scissors:剪刀`

/**
 * 解析课程数据
 * @returns {Array} 课程列表
 */
export function parseCourses() {
  const lines = COURSES_DATA.split('\n').filter(line => line.trim() && !line.startsWith('#'))
  const courses = []

  lines.forEach(line => {
    const match = line.match(/^([^\.]+)\.(\d+)=(.+)$/)
    if (match) {
      const [, courseName, wordCount, wordsData] = match
      const words = []

      const wordPairs = wordsData.split(',')
      wordPairs.forEach(pair => {
        const [word, meaning] = pair.split(':')
        if (word && meaning) {
          words.push({
            word: word.trim(),
            meaning: meaning.trim()
          })
        }
      })

      courses.push({
        name: courseName.trim(),
        wordCount: parseInt(wordCount),
        words: words
      })
    }
  })

  return courses
}

/**
 * 获取所有课程
 * @returns {Array} 课程列表
 */
export function getAllCourses() {
  return parseCourses()
}

/**
 * 根据课程名获取课程
 * @param {string} courseName 课程名
 * @returns {Object|null} 课程对象
 */
export function getCourseByName(courseName) {
  const courses = parseCourses()
  return courses.find(course => course.name === courseName) || null
}

/**
 * 获取课程中的随机单词
 * @param {string} courseName 课程名
 * @param {number} count 单词数量
 * @returns {Array} 单词列表
 */
export function getRandomWords(courseName, count) {
  const course = getCourseByName(courseName)
  if (!course) return []

  const shuffled = [...course.words].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, shuffled.length))
}