<template>
  <div class="record-step">
    <div class="word-display text-center mb-8">
      <div class="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">
        {{ word.word }}
      </div>
      <div class="text-xl font-medium text-gray-800 dark:text-gray-200 mb-6">
        {{ word.meaning }}
      </div>
    </div>

    <div class="recording-area text-center mb-8">

      <!-- 录音按钮 -->
      <button
        @mousedown="startRecording"
        @mouseup="stopRecording"
        @mouseleave="stopRecording"
        @touchstart="startRecording"
        @touchend="stopRecording"
        :disabled="isRecording || !isSupported || isLoading"
        class="record-button p-4 rounded-full transition-all duration-200"
        :class="{
          'bg-red-500 hover:bg-red-600': isRecording,
          'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50': !isRecording && !isLoading,
          'bg-gray-100 dark:bg-gray-900/30 cursor-wait': isLoading && !isRecording
        }"
      >
        <svg
          class="w-10 h-10 transition-colors"
          :class="{
            'text-white animate-pulse': isRecording,
            'text-green-600 dark:text-green-400': !isRecording
          }"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path v-if="isRecording" d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/>
          <path v-else d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
        </svg>
      </button>

      <div class="recording-status mt-4">
        <div v-if="isRecording" class="text-red-500 font-medium animate-pulse">
          正在录音...
        </div>
        <div v-else-if="isLoading && !isRecording" class="text-blue-500 text-sm font-medium">
          正在启动录音...
        </div>
        <div v-else-if="!isSupported" class="text-red-500 text-sm">
          您的浏览器不支持录音功能
        </div>
        <div v-else class="text-gray-500 text-sm">
          按住按钮开始录音
        </div>
      </div>
    </div>

    <!-- 录音播放区域 -->
    <div v-if="audioUrl" class="playback-area text-center">

      <!-- 自定义播放控件 -->
      <div class="custom-audio-controls">
        <button
          @click="togglePlayback"
          :disabled="isLoading"
          class="playback-button p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all duration-200"
          title="播放录音"
        >
          <svg
            v-if="!isPlaying"
            class="w-10 h-10 text-indigo-600 dark:text-indigo-400 transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg
            v-else
            class="w-10 h-10 text-indigo-600 dark:text-indigo-400 transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>

        <!-- 波形显示区域（可选的装饰性元素） -->
        <div class="waveform-display mt-3 flex justify-center items-center gap-1 mb-4">
          <div
            v-for="i in 20"
            :key="i"
            class="waveform-bar"
            :class="{ 'animate-wave': isPlaying }"
            :style="{ animationDelay: `${i * 0.1}s` }"
          ></div>
        </div>

      </div>
    </div>

    <div class="action-buttons flex justify-center">
      <button
        @click="completeStep"
        class="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        练习完成，继续下一步
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'RecordStep',
  props: {
    word: {
      type: Object,
      required: true
    }
  },
  emits: ['completed'],
  setup(props, { emit }) {
    const isRecording = ref(false)
    const isSupported = ref(false)
    const audioUrl = ref(null)
    const isPlaying = ref(false)
    const isLoading = ref(false)
    const currentTime = ref(0)
    const duration = ref(0)
    let mediaRecorder = null
    let audioChunks = []
    let audioElement = null

    onMounted(() => {
      // 检查浏览器是否支持录音
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        isSupported.value = true
      }
    })

    onUnmounted(() => {
      // 组件卸载时清理资源
      if (mediaRecorder && isRecording.value) {
        mediaRecorder.stop()
        mediaRecorder = null
      }
      if (audioElement) {
        audioElement.pause()
        audioElement.remove()
        audioElement = null
      }
      if (audioUrl.value) {
        URL.revokeObjectURL(audioUrl.value)
        audioUrl.value = null
      }
      // 重置状态
      isRecording.value = false
      isLoading.value = false
    })

    const startRecording = async () => {
      // 防止重复触发
      if (!isSupported.value || isRecording.value || mediaRecorder || isLoading.value) return

      isLoading.value = true

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorder = new MediaRecorder(stream)
        audioChunks = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data)
        }

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
          audioUrl.value = URL.createObjectURL(audioBlob)

          // 创建音频元素用于播放控制
          if (audioElement) {
            audioElement.pause()
            audioElement.remove()
          }
          audioElement = new Audio(audioUrl.value)

          // 添加音频事件监听
          audioElement.addEventListener('loadedmetadata', () => {
            duration.value = audioElement.duration
          })

          audioElement.addEventListener('timeupdate', () => {
            currentTime.value = audioElement.currentTime
          })

          audioElement.addEventListener('ended', () => {
            isPlaying.value = false
            currentTime.value = 0
          })

          // 停止所有音轨
          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.start()
        isRecording.value = true
        isLoading.value = false
      } catch (error) {
        console.error('录音启动失败:', error)
        isLoading.value = false
        mediaRecorder = null
        alert('无法访问麦克风，请检查权限设置')
      }
    }

    const stopRecording = () => {
      if (mediaRecorder && isRecording.value) {
        mediaRecorder.stop()
        isRecording.value = false
        mediaRecorder = null
      }
    }

    const togglePlayback = async () => {
      if (!audioElement || isLoading.value) return

      isLoading.value = true

      try {
        if (isPlaying.value) {
          audioElement.pause()
          isPlaying.value = false
        } else {
          await audioElement.play()
          isPlaying.value = true
        }
      } catch (error) {
        console.error('播放错误:', error)
        isPlaying.value = false
      } finally {
        isLoading.value = false
      }
    }

    const formatTime = (seconds) => {
      if (!seconds || isNaN(seconds)) return '0:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const completeStep = () => {
      // 清理音频URL和元素
      if (audioElement) {
        audioElement.pause()
        audioElement.remove()
        audioElement = null
      }
      if (audioUrl.value) {
        URL.revokeObjectURL(audioUrl.value)
        audioUrl.value = null
      }

      // 重置状态
      isPlaying.value = false
      currentTime.value = 0
      duration.value = 0

      emit('completed')
    }

    return {
      isRecording,
      isSupported,
      audioUrl,
      isPlaying,
      isLoading,
      currentTime,
      duration,
      startRecording,
      stopRecording,
      togglePlayback,
      formatTime,
      completeStep
    }
  }
}
</script>

<style scoped>
.record-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.record-button {
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.record-button:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.record-button:active:not(:disabled) {
  transform: scale(0.95);
}

.record-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


/* 自定义播放控件样式 */
.custom-audio-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.playback-button {
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  position: relative;
}

.playback-button:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
}

.playback-button:active:not(:disabled) {
  transform: scale(0.95);
}

.playback-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 波形显示样式 */
.waveform-display {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.waveform-bar {
  width: 2px;
  height: 12px;
  background: #a5b4fc;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.dark .waveform-bar {
  background: #6366f1;
}

.waveform-bar.animate-wave {
  animation: waveAnimation 1s ease-in-out infinite alternate;
}

@keyframes waveAnimation {
  0% {
    height: 8px;
    opacity: 0.4;
  }
  100% {
    height: 24px;
    opacity: 1;
  }
}

.time-display {
  font-family: monospace;
  letter-spacing: 0.05em;
}
</style>