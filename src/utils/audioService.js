// 语音服务工具模块
// 提供多种免费的语音合成方案，带fallback机制

class AudioService {
  constructor() {
    this.currentEngine = null
    this.engines = {
      howjsay: new HowjsayEngine(),
      speechSynthesis: new SpeechSynthesisEngine(),
    }
    this.cache = new Map() // 语音缓存
    this.init()
  }

  async init() {
    // 初始化并检测可用的语音引擎
    for (const [name, engine] of Object.entries(this.engines)) {
      try {
        const isAvailable = await engine.isAvailable()
        if (isAvailable) {
          this.currentEngine = engine
          console.log(`语音引擎已启用: ${name}`)
          break
        }
      } catch (error) {
        console.warn(`语音引擎 ${name} 不可用:`, error.message)
      }
    }
  }

  async playWord(word, options = {}) {
    if (!word) return false

    // 检查缓存
    const cacheKey = `${word}_${JSON.stringify(options)}`
    if (this.cache.has(cacheKey)) {
      return this.playCachedAudio(this.cache.get(cacheKey))
    }

    // 尝试使用当前引擎
    if (this.currentEngine) {
      try {
        const audioUrl = await this.currentEngine.getAudioUrl(word, options)
        if (audioUrl) {
          // 缓存音频URL
          this.cache.set(cacheKey, audioUrl)
          return this.playAudio(audioUrl)
        }
      } catch (error) {
        console.warn('当前语音引擎失败，尝试备用方案:', error.message)
        // 尝试其他可用引擎
        return this.tryFallbackEngines(word, options)
      }
    }

    return false
  }

  async tryFallbackEngines(word, options) {
    for (const [name, engine] of Object.entries(this.engines)) {
      if (engine === this.currentEngine) continue

      try {
        const isAvailable = await engine.isAvailable()
        if (!isAvailable) continue

        const audioUrl = await engine.getAudioUrl(word, options)
        if (audioUrl) {
          this.currentEngine = engine
          console.log(`切换到备用语音引擎: ${name}`)
          return this.playAudio(audioUrl)
        }
      } catch (error) {
        console.warn(`备用引擎 ${name} 也失败:`, error.message)
      }
    }
    return false
  }

  playAudio(audioUrl) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl)

      audio.onended = () => resolve(true)
      audio.onerror = (error) => reject(error)

      audio.play().catch(reject)
    })
  }

  playCachedAudio(audioUrl) {
    return this.playAudio(audioUrl)
  }

  // 清除缓存
  clearCache() {
    this.cache.clear()
  }

  // 获取当前引擎信息
  getCurrentEngineInfo() {
    return this.currentEngine ? this.currentEngine.getInfo() : null
  }
}

// Howjsay 引擎（真人发音网站）- 高质量真人发音
class HowjsayEngine {
  constructor() {
    this.baseUrl = 'https://howjsay.com'
  }

  async isAvailable() {
    return true
  }

  async getAudioUrl(word, options = {}) {
    // Howjsay 使用标准化的音频URL格式
    const audioUrl = `${this.baseUrl}/mp3/${encodeURIComponent(word)}.mp3`

    try {
      return new Promise((resolve, reject) => {
        const audio = new Audio()

        audio.oncanplay = () => {
          resolve(audioUrl)
        }

        audio.onerror = () => {
          reject(new Error('Howjsay音频加载失败'))
        }

        // 设置超时
        setTimeout(() => {
          reject(new Error('Howjsay请求超时'))
        }, 5000)

        audio.src = audioUrl
      })
    } catch (error) {
      throw new Error(`Howjsay失败: ${error.message}`)
    }
  }

  getInfo() {
    return {
      name: 'Howjsay',
      type: 'Human pronunciation',
      quality: 'Very Good',
      limitations: 'Common words only'
    }
  }
}

// 优化的Speech Synthesis引擎 - 备用方案
class SpeechSynthesisEngine {
  constructor() {
    this.synth = window.speechSynthesis
    this.voiceCache = null
    this.initVoices()
  }

  async isAvailable() {
    return 'speechSynthesis' in window && this.synth.getVoices().length > 0
  }

  initVoices() {
    // 缓存语音列表
    const updateVoices = () => {
      this.voiceCache = this.synth.getVoices()
    }

    updateVoices()
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = updateVoices
    }
  }

  getBestVoice() {
    if (!this.voiceCache) return null

    // 扩展的高质量语音列表，按优先级排序
    const preferredVoices = [
      // Google WaveNet/Neural语音 (最高质量)
      'Google US English',
      'Google UK English Female',
      'Google UK English Male',
      'Google español de Estados Unidos',

      // Microsoft Azure认知服务语音
      'Microsoft Zira Desktop',
      'Microsoft David Desktop',
      'Microsoft Mark Desktop',
      'Microsoft Sonia',

      // Apple神经语音
      'Samantha',
      'Alex',
      'Karen',
      'Daniel',
      'Moira',
      'Tessa',
      'Veena',

      // Amazon Polly (如果在浏览器中可用)
      'Joanna',
      'Matthew',
      'Ivy',
      'Justin',
      'Kendra',

      // 其他高质量语音
      'Google Noto Sans',
      'Google UK English',
      'Microsoft Hazel Desktop'
    ]

    // 查找首选语音
    for (const preferred of preferredVoices) {
      const voice = this.voiceCache.find(v => v.name.includes(preferred) || v.name === preferred)
      if (voice) return voice
    }

    // 如果没找到，按质量选择英语语音
    const englishVoices = this.voiceCache
      .filter(v => v.lang.startsWith('en'))
      .sort((a, b) => {
        // 优先选择非本地服务（通常是云端高质量语音）
        if (a.localService !== b.localService) {
          return a.localService ? 1 : -1
        }
        // 然后按名称排序（某些命名惯例表示高质量）
        const aPriority = this.getVoicePriority(a.name)
        const bPriority = this.getVoicePriority(b.name)
        return bPriority - aPriority
      })

    if (englishVoices.length > 0) {
      return englishVoices[0]
    }

    // 最后的备选方案：任何英语语音
    return this.voiceCache.find(v => v.lang.startsWith('en'))
  }

  // 根据语音名称判断质量优先级
  getVoicePriority(voiceName) {
    const name = voiceName.toLowerCase()

    // 高质量关键词
    if (name.includes('neural') || name.includes('wave') || name.includes('premium')) return 10
    if (name.includes('google')) return 9
    if (name.includes('microsoft') && !name.includes('desktop')) return 8
    if (name.includes('amazon') || name.includes('polly')) return 8
    if (name.includes('azure') || name.includes('cognitive')) return 8

    // 标准质量
    if (name.includes('microsoft')) return 7
    if (name.includes('samantha') || name.includes('alex') || name.includes('karen')) return 7

    // 基础质量
    if (name.includes('native')) return 6
    if (name.includes('local')) return 5

    return 1
  }

  async getAudioUrl(word, options = {}) {
    // Speech Synthesis无法直接返回音频URL
    // 我们直接播放并返回Promise
    return this.speakWord(word, options)
  }

  speakWord(word, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // 取消之前的播放
      this.synth.cancel()

      const utterance = new SpeechSynthesisUtterance(word)
      const bestVoice = this.getBestVoice()

      if (bestVoice) {
        utterance.voice = bestVoice
      }

      // 优化参数设置
      utterance.lang = 'en-US'
      utterance.rate = 0.75  // 稍慢一点，便于学习
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onend = () => resolve(true)
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))

      this.synth.speak(utterance)
    })
  }

  getInfo() {
    const voice = this.getBestVoice()
    return {
      name: 'Speech Synthesis',
      type: 'Browser TTS',
      quality: voice ? 'Good' : 'Basic',
      currentVoice: voice ? voice.name : 'None'
    }
  }
}

// 导出音频服务实例
export const audioService = new AudioService()

// 导出工具函数
export const playWordAudio = (word, options = {}) => {
  return audioService.playWord(word, options)
}

export const getAudioEngineInfo = () => {
  return audioService.getCurrentEngineInfo()
}