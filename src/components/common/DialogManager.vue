<template>
  <!-- 动态渲染多个对话框 -->
  <AppDialog
    v-for="(dialog, key) in dialogs"
    :key="key"
    :show="dialog.show"
    :title="dialog.title"
    :message="dialog.message"
    :type="dialog.type"
    :confirm-text="dialog.confirmText"
    :cancel-text="dialog.cancelText"
    :show-cancel="dialog.showCancel"
    @confirm="dialog.onConfirm"
    @cancel="dialog.onCancel"
    @close="dialog.onClose"
  />
</template>

<script setup>
import AppDialog from './AppDialog.vue'

defineProps({
  dialogs: {
    type: Object,
    default: () => ({})
  }
})
</script>