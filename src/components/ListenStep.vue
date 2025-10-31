<template>
  <div class="listen-step">
    <div class="word-display text-center mb-8">
      <!-- WordCard 单词显示 -->
      <div class="flex justify-center mb-6">
        <WordCard
          :word="word"
          size="large"
          :show-phonemes="true"
          :show-audio="false"
        />
      </div>

      <div class="text-base text-gray-600 dark:text-gray-400">
        点击喇叭按钮听发音，记住这个单词的意思
      </div>
    </div>

    <div class="audio-controls flex justify-center">
      <button
        @click="playAudio"
        :disabled="isPlaying"
        class="audio-button flex items-center justify-center rounded-full transition-all duration-200 group"
        :class="{ 'playing': isPlaying }"
        title="播放发音"
      >
        <svg v-if="!isPlaying" class="audio-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
        <svg v-else class="audio-icon animate-pulse" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
      </button>
    </div>

    <div class="action-buttons flex justify-center mt-8">
      <button
        @click="completeStep"
        class="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        已掌握，继续下一步
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { playWordAudio } from '../utils/audioService'
import WordCard from './common/WordCard.vue'

export default {
  name: 'ListenStep',
  components: {
    WordCard
  },
  props: {
    word: {
      type: Object,
      required: true
    }
  },
  emits: ['completed'],
  setup(props, { emit }) {
    const isPlaying = ref(false)

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

    const completeStep = () => {
      emit('completed')
    }

    return {
      isPlaying,
      playAudio,
      completeStep
    }
  }
}
</script>

<style scoped>
.listen-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* 音频按钮 - 与WordCard样式一致，但保持大尺寸 */
.audio-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;  /* 保持原来大按钮的尺寸 */
  height: 80px; /* 保持原来大按钮的尺寸 */
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

/* 音频图标 - 保持大尺寸 */
.audio-icon {
  width: 40px;  /* 保持原来大图标的尺寸 */
  height: 40px; /* 保持原来大图标的尺寸 */
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>