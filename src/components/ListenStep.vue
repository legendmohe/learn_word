<template>
  <div class="listen-step">
    <div class="word-display text-center mb-8">
      <div class="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-6">
        {{ word.word }}
      </div>

      <div class="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-6">
        {{ word.meaning }}
      </div>

      <div class="text-base text-gray-600 dark:text-gray-400 mb-8">
        点击喇叭按钮听发音，记住这个单词的意思
      </div>
    </div>

    <div class="audio-controls flex justify-center mb-8">
      <button
        @click="playAudio"
        :disabled="isPlaying"
        class="audio-button p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 group"
        title="播放发音"
      >
        <svg
          class="w-10 h-10 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors"
          :class="{ 'animate-pulse': isPlaying }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
        </svg>
      </button>
    </div>

    <div class="phonetic-display text-center" v-if="word.phonetic">
      <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">
        音标
      </div>
      <div class="text-lg font-medium text-gray-700 dark:text-gray-300">
        /{{ word.phonetic }}/
      </div>
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

export default {
  name: 'ListenStep',
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

.audio-button {
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
}

.audio-button:hover {
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
}

.audio-button:active {
  transform: scale(0.95);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}
</style>