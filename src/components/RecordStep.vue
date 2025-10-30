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
        :disabled="isRecording || !isSupported"
        class="record-button p-6 rounded-full transition-all duration-200"
        :class="{
          'bg-red-500 hover:bg-red-600': isRecording,
          'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50': !isRecording
        }"
      >
        <svg
          class="w-12 h-12 transition-colors"
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
      <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">
        你的录音
      </div>
      <audio controls :src="audioUrl" class="w-full max-w-xs mx-auto"></audio>
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
import { ref, onMounted } from 'vue'

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
    let mediaRecorder = null
    let audioChunks = []

    onMounted(() => {
      // 检查浏览器是否支持录音
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        isSupported.value = true
      }
    })

    const startRecording = async () => {
      if (!isSupported.value || isRecording.value) return

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

          // 停止所有音轨
          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.start()
        isRecording.value = true
      } catch (error) {
        console.error('录音启动失败:', error)
        alert('无法访问麦克风，请检查权限设置')
      }
    }

    const stopRecording = () => {
      if (mediaRecorder && isRecording.value) {
        mediaRecorder.stop()
        isRecording.value = false
      }
    }

    const completeStep = () => {
      // 清理音频URL
      if (audioUrl.value) {
        URL.revokeObjectURL(audioUrl.value)
        audioUrl.value = null
      }
      emit('completed')
    }

    return {
      isRecording,
      isSupported,
      audioUrl,
      startRecording,
      stopRecording,
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

/* 移动端优化 */
@media (max-width: 640px) {
  .record-button {
    padding: 3rem;
  }

  .record-button svg {
    width: 2.5rem;
    height: 2.5rem;
  }
}

@media (max-width: 480px) {
  .record-button {
    padding: 2.5rem;
  }

  .record-button svg {
    width: 2rem;
    height: 2rem;
  }
}

@media (max-width: 380px) {
  .record-button {
    padding: 2rem;
  }

  .record-button svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}

audio {
  height: 32px;
}
</style>