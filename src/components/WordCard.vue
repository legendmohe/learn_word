<template>
  <div class="word-card" :class="[`size-${size}`, { 'dark': isDark }]">
    <!-- 英文单词和音频按钮 -->
    <div v-if="showEnglishWord" class="word-header">
      <div class="english-word">
        <span
          v-for="(phoneme, index) in word.phonemes"
          :key="index"
          class="phoneme-group"
          :class="[getPhonemeClass(index), { 'no-underline': word.phonemes.length === 1 }]"
          :style="getPhonemeStyle(index)"
        >
          {{ phoneme }}
        </span>
      </div>
      <button
        v-if="showAudio"
        @click="playAudio"
        :disabled="isPlaying"
        class="audio-button"
        :class="{ 'playing': isPlaying }"
      >
        <svg v-if="!isPlaying" class="audio-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
        <svg v-else class="audio-icon animate-pulse" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
      </button>
    </div>

    <!-- 音素显示 -->
    <div v-if="showPhonemes && hasPhonemes" class="phonemes-container" :class="{ 'centered': !showAudio || !showEnglishWord }">
      <span class="phoneme-slash">/</span>
      <span
        v-for="(phoneme, index) in displayPhonemes"
        :key="index"
        class="phoneme"
        :style="{ color: getPhonemeColor(index) }"
      >
        {{ phoneme }}
      </span>
      <span class="phoneme-slash">/</span>
    </div>

    <!-- 中文释义 -->
    <div v-if="showMeaning" class="meaning" :class="{ 'centered': !showAudio || !showEnglishWord }">{{ word.meaning }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { playWordAudio } from '../utils/audioService'
import { useDark } from '@vueuse/core'

// Props定义
const props = defineProps({
  word: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  showPhonemes: {
    type: Boolean,
    default: true
  },
  showAudio: {
    type: Boolean,
    default: true
  },
  showMeaning: {
    type: Boolean,
    default: true
  },
  showEnglishWord: {
    type: Boolean,
    default: true
  },
  autoPlay: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const isPlaying = ref(false)
const isDark = useDark()

// 计算属性
const hasPhonemes = computed(() => {
  return props.word.phonemes_s && props.word.phonemes_s.length > 0
})

const displayPhonemes = computed(() => {
  if (hasPhonemes.value) {
    return props.word.phonemes_s
  }
  return []
})

// 获取音素组的样式类
const getPhonemeClass = (index) => {
  return `phoneme-${index}`
}

// 获取音素组的样式
const getPhonemeStyle = (index) => {
  return {
    '--phoneme-color': '#1f2937' // 与英文释义相同的颜色
  }
}

// 音素颜色方案
const phonemeColors = [
  '#3b82f6', // 蓝色
  '#10b981', // 绿色
  '#f59e0b', // 橙色
  '#8b5cf6', // 紫色
  '#ef4444', // 红色
  '#06b6d4', // 青色
]

// 获取音素颜色
const getPhonemeColor = (index) => {
  return phonemeColors[index % phonemeColors.length]
}

// 播放音频
const playAudio = async () => {
  if (isPlaying.value) return

  try {
    isPlaying.value = true
    const success = await playWordAudio(props.word.word, {
      lang: 'en-US',
      rate: 0.8
    })

    if (!success) {
      console.warn('语音播放失败')
    }
  } catch (error) {
    console.error('语音播放错误:', error)
  } finally {
    isPlaying.value = false
  }
}

// 动态生成音素对应的CSS类
const phonemeStyles = computed(() => {
  const styles = {}
  const phonemes = props.word.phonemes || []

  phonemes.forEach((phoneme, index) => {
    const color = getPhonemeColor(index)
    styles[`.phoneme-${index}::after`] = {
      backgroundColor: color
    }
  })

  return styles
})

// 组件挂载时自动播放
onMounted(() => {
  if (props.autoPlay) {
    setTimeout(() => {
      playAudio()
    }, 500)
  }
})
</script>

<style scoped>
.word-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 12px;
  padding: 12px 16px;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  min-height: 80px;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: fit-content;
  max-width: 100%;
}

.dark .word-card {
  background: rgba(31, 41, 55, 0.9);
  border: 1px solid rgba(75, 85, 99, 0.8);
}

/* 尺寸变体 */
.size-small {
  min-height: 70px;
  padding: 10px 14px;
  gap: 3px;
}

.size-medium {
  min-height: 80px;
  padding: 12px 16px;
  gap: 4px;
}

.size-large {
  min-height: 95px;
  padding: 14px 18px;
  gap: 5px;
}

/* 单词头部 */
.word-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
}

.word-header:not(:has(.audio-button)) {
  justify-content: center;
}

.english-word {
  font-weight: 700;
  color: #1f2937;
  word-break: break-word;
  flex: 1;
  text-align: left;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 3px;
}

.word-header:not(:has(.audio-button)) .english-word {
  flex: none;
  text-align: center;
  justify-content: center;
}

.phoneme-group {
  position: relative;
  display: inline-block;
}

/* 为音素组添加下划线 */
.phoneme-group[class*="phoneme-"]::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--phoneme-color);
  border-radius: 1px;
}

/* 单个字母时隐藏下划线 */
.phoneme-group.no-underline::after {
  display: none;
}

.dark .phoneme-group[class*="phoneme-"]::after {
  background-color: #f9fafb; /* 暗色模式下使用暗色主题的文字颜色 */
}

.dark .english-word {
  color: #f9fafb;
}

.size-small .english-word {
  font-size: 16px;
}

.size-medium .english-word {
  font-size: 26px;
}

.size-large .english-word {
  font-size: 26px;
}

/* 音频按钮 */
.audio-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.dark .audio-button {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.audio-button:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.05);
}

.dark .audio-button:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
}

.audio-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.audio-button.playing {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.size-small .audio-button {
  width: 24px;
  height: 24px;
}

.size-large .audio-button {
  width: 32px;
  height: 32px;
}

.audio-icon {
  width: 14px;
  height: 14px;
}

.size-small .audio-icon {
  width: 12px;
  height: 12px;
}

.size-large .audio-icon {
  width: 16px;
  height: 16px;
}

/* 音素容器 */
.phonemes-container {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.phonemes-container.centered {
  justify-content: center;
}

.phoneme {
  font-weight: 500;
  font-style: italic;
  letter-spacing: 0.5px;
}

.phoneme-slash {
  font-weight: 500;
  font-style: italic;
  color: #6b7280;
  margin: 0 3px;
}

.dark .phoneme-slash {
  color: #9ca3af;
}

.size-small .phoneme {
  font-size: 12px;
}

.size-medium .phoneme {
  font-size: 14px;
}

.size-large .phoneme {
  font-size: 16px;
}

.size-small .phoneme-slash {
  font-size: 12px;
}

.size-medium .phoneme-slash {
  font-size: 14px;
}

.size-large .phoneme-slash {
  font-size: 16px;
}

/* 中文释义 */
.meaning {
  color: #6b7280;
  line-height: 1.4;
  text-align: left;
}

.meaning.centered {
  text-align: center;
}

.dark .meaning {
  color: #d1d5db;
}

.size-small .meaning {
  font-size: 14px;
}

.size-medium .meaning {
  font-size: 16px;
}

.size-large .meaning {
  font-size: 18px;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .word-card {
    padding: 10px 14px;
    min-height: 75px;
  }

  .word-header {
    gap: 10px;
  }

  .english-word {
    font-size: 16px;
  }

  .phoneme {
    font-size: 12px;
  }

  .meaning {
    font-size: 14px;
  }
}

@media (max-width: 380px) {
  .word-card {
    padding: 8px 12px;
    min-height: 70px;
  }

  .audio-button {
    width: 30px;
    height: 30px;
  }

  .audio-icon {
    width: 14px;
    height: 14px;
  }
}
</style>