/**
 * 应用程序常量配置
 * 集中管理所有硬编码的常量，便于维护和修改
 */

// ==================== 时间相关常量 ====================
export const TIMING = {
  // 自动跳转延迟（毫秒）
  CORRECT_ANSWER_DELAY: 1,
  WORD_COMPLETION_DELAY: 0,

  // 动画延迟
  DIALOG_ANIMATION_DELAY: 300,
  ANIMATION_FRAME_DELAY: 10,

  // 用户反馈时间
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,

  // 会话管理
  SESSION_TIMEOUT: 2 * 60 * 60 * 1000, // 2小时
  AUDIO_TIMEOUT: 5000,
  ASYNC_SAVE_DELAY: 0, // 异步保存延迟，设为0立即异步执行
}

// ==================== 动画相关常量 ====================
export const ANIMATION = {
  DURATION: {
    INSTANT: 100,
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
    EXTRA_SLOW: 600,
    PULSE: 1500,
    BOUNCE: 2000,
    GENTLE_PULSE: 3000,
  },
  EASING: {
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    EASE_IN: 'ease-in',
  }
}

// ==================== 限制和阈值 ====================
export const LIMITS = {
  // 显示限制
  MAX_LEARNED_WORDS_DISPLAY: 50,
  MAX_ERROR_WORDS_DISPLAY: 50,

  // 学习限制
  MAX_SPELLING_ATTEMPTS: 3,
  DEFAULT_DAILY_GOAL: 10,
  MAX_EXTRA_LETTERS: 5,
  MAX_LEARNING_STEPS: 4,

  // 测试设置
  TEST_OPTIONS_COUNT: 3,
  MAX_PHONEME_GROUPS: 10,

  // 错误阈值
  ERROR_THRESHOLD_FREQUENT: 3,
  CONSECUTIVE_CORRECT_THRESHOLD: 5,

  // 文本限制
  MAX_HIGHLIGHT_CHARS: 100,
}

// ==================== 响应式断点 ====================
export const BREAKPOINTS = {
  DESKTOP: 1024,
  TABLET: 768,
  MOBILE: 640,
  SMALL_MOBILE: 480,
  VERY_SMALL_MOBILE: 380,
  MINIMUM_MOBILE: 320,
}

// ==================== 触摸界面尺寸 ====================
export const TOUCH = {
  // 最小触摸目标
  MIN_TARGET_SIZE: 44,

  // 拼写界面
  LETTER_SLOT_HEIGHT: 50,
  LETTER_BUTTON_HEIGHT: 45,
  LETTER_BUTTON_MIN_WIDTH: 40,

  // 选项按钮
  OPTION_BUTTON_HEIGHT: 60,
  OPTION_BUTTON_MIN_WIDTH: 120,

  // 对话框
  DIALOG_MAX_WIDTH: 320,
  DIALOG_MAX_HEIGHT: '80vh',
}

// ==================== 音频设置 ====================
export const AUDIO = {
  // 语音合成参数
  SPEECH_RATE: 0.75,
  SPEECH_PITCH: 1.0,
  SPEECH_VOLUME: 1.0,

  // 音频控制
  AUTO_PLAY: true,
  REPEAT_DELAY: 1000,
}

// ==================== 本地存储键名 ====================
export const STORAGE_KEYS = {
  // 学习数据
  STUDY_PROGRESS: 'learn_word_study_progress',
  ERROR_WORDS: 'learn_word_error_words',
  LEARNED_WORDS: 'learn_word_learned_words',
  STUDY_TIME: 'learn_word_study_time',
  STUDY_SESSION: 'learn_word_study_session',

  // 用户设置
  DAILY_GOAL: 'learn_word_daily_goal',
  SELECTED_COURSE: 'learn_word_selected_course',
  DARK_MODE: 'learn_word_dark_mode',
  ASSIST_MODE: 'learn_word_assist_mode',

  // 应用状态
  WELCOME_SHOWN: 'learn_word_welcome_shown',
  NOTIFICATIONS: 'learn_word_notifications',
}

// ==================== 激励性消息 ====================
export const MESSAGES = {
  // 开始学习的激励语
  MOTIVATIONAL_QUOTES: [
    "每学会一个单词，你就离目标更近一步！💪",
    "坚持就是胜利，今天也要加油哦！🌟",
    "相信自己，你可以掌握这些单词！✨",
    "知识的积累从现在开始！📚",
    "每天进步一点点，成功就在眼前！🎯",
    "学习让你变得更强大！💫",
    "今天的努力是明天的收获！🌱",
    "单词是打开世界大门的钥匙！🔑",
  ],

  // 成功消息
  SUCCESS_MESSAGES: [
    "太棒了！继续保持这个势头！🎉",
    "你做得真不错！继续努力！⭐",
    "完美！你的进步很明显！👏",
    "优秀！你越来越熟练了！🚀",
    "很棒！坚持下去就是胜利！💯",
    "出色！你正在变得更好！🌈",
    "精彩！你的努力得到了回报！🏆",
    "了不起！你的词汇量在增长！📈",
  ],

  // 鼓励消息
  ENCOURAGEMENT_MESSAGES: [
    "不要灰心，下次一定可以！💪",
    "学习需要时间，慢慢来！🌱",
   "每次尝试都是进步！📈",
    "相信自己，你一定可以的！✨",
    "失败是成功之母，继续加油！🌟",
    "练习让你变得更强！💫",
    "坚持就是胜利！🎯",
    "你的努力终会有回报！🏆",
  ],
}

// ==================== 字母和干扰项 ====================
export const ALPHABET = {
  // 额外的干扰字母（用于正常模式）
  EXTRA_LETTERS: [
    'A', 'E', 'I', 'O', 'U', 'R', 'S', 'T', 'L', 'N',
    'C', 'D', 'G', 'H', 'M', 'P', 'B', 'F', 'V', 'Y',
    'K', 'J', 'X', 'Q', 'Z', 'W'
  ],

  // 常见干扰词（用于测试模式）
  COMMON_DISTRACTORS: [
    'cat', 'dog', 'run', 'sun', 'fun', 'big', 'red', 'hot', 'new', 'old',
    'good', 'bad', 'top', 'low', 'yes', 'no', 'up', 'down', 'in', 'out',
    'look', 'see', 'go', 'get', 'make', 'take', 'give', 'come', 'say', 'tell'
  ],
}

// ==================== 震动模式 ====================
export const VIBRATION = {
  // 单次震动
  SINGLE: 50,
  SUCCESS: 100,

  // 震动模式（毫秒数组）
  ERROR: [50, 50, 50],
  CELEBRATION: [100, 50, 100],
}

// ==================== 颜色配置 ====================
export const COLORS = {
  // 状态颜色
  SUCCESS: 'bg-green-500',
  ERROR: 'bg-red-500',
  WARNING: 'bg-yellow-500',
  INFO: 'bg-blue-500',

  // 高亮颜色
  SEARCH_HIGHLIGHT_BG: '#fef08a',
  SEARCH_HIGHLIGHT_TEXT: '#713f12',

  // 渐变色
  GRADIENTS: {
    SUCCESS: 'from-green-400 to-green-600',
    ERROR: 'from-red-400 to-red-600',
    PRIMARY: 'from-blue-400 to-blue-600',
  }
}

// ==================== 计算因子 ====================
export const FACTORS = {
  // 百分比
  PERCENTAGE_MULTIPLIER: 100,

  // 随机化
  SHUFFLE_FACTOR: 0.5,

  // 进度计算
  WORD_DISTRIBUTION_DIVISOR: 3,
}

// ==================== 默认配置 ====================
export const DEFAULTS = {
  // 学习设置
  DAILY_GOAL: 10,
  ASSIST_MODE: false,
  AUTO_PLAY_AUDIO: true,

  // 界面设置
  DARK_MODE: false,
  SHOW_NOTIFICATIONS: true,

  // 组件状态
  SHOW_PHONETIC: true,
  SHOW_TRANSLATION: true,
  SHOW_PRONUNCIATION: true,
}

// ==================== 验证规则 ====================
export const VALIDATION = {
  // 单词验证
  MIN_WORD_LENGTH: 1,
  MAX_WORD_LENGTH: 50,

  // 输入验证
  MAX_INPUT_LENGTH: 100,
  REQUIRED_FIELD: true,
}

// ==================== 导出所有配置 ====================
export const CONFIG = {
  TIMING,
  ANIMATION,
  LIMITS,
  BREAKPOINTS,
  TOUCH,
  AUDIO,
  STORAGE_KEYS,
  MESSAGES,
  ALPHABET,
  VIBRATION,
  COLORS,
  FACTORS,
  DEFAULTS,
  VALIDATION,
}

// 默认导出主要配置对象
export default CONFIG