import { ref } from 'vue'

/**
 * 简化 AppDialog 使用的组合式函数
 * 支持一行代码调用常见的确认对话框
 */
export function useDialog() {
  const dialogs = ref({})

  /**
   * 显示确认对话框
   * @param {Object} options - 对话框配置
   * @param {string} options.title - 标题
   * @param {string} options.message - 消息内容
   * @param {string} options.type - 对话框类型：'info' | 'warning' | 'error'
   * @param {string} options.confirmText - 确认按钮文字
   * @param {string} options.cancelText - 取消按钮文字
   * @param {Function} options.onConfirm - 确认回调函数
   * @param {Function} options.onCancel - 取消回调函数
   * @param {boolean} options.showCancel - 是否显示取消按钮，默认 true
   * @param {string} options.key - 对话框唯一标识，用于同时显示多个对话框
   * @returns {Promise<boolean>} - 用户是否点击了确认
   */
  const show = (options) => {
    const key = options.key || 'default'

    return new Promise((resolve) => {
      // 存储对话框配置
      dialogs.value[key] = {
        show: true,
        title: options.title || '确认操作',
        message: options.message || '确定要执行此操作吗？',
        type: options.type || 'warning',
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        showCancel: options.showCancel !== false,
        onConfirm: () => {
          close(key)
          if (options.onConfirm) options.onConfirm()
          resolve(true)
        },
        onCancel: () => {
          close(key)
          if (options.onCancel) options.onCancel()
          resolve(false)
        },
        onClose: () => {
          close(key)
          resolve(false)
        }
      }
    })
  }

  /**
   * 显示信息提示对话框
   * @param {string} title - 标题
   * @param {string} message - 消息内容
   * @param {Object} options - 可选配置
   * @returns {Promise<boolean>}
   */
  const info = (title, message, options = {}) => {
    return show({
      title,
      message,
      type: 'info',
      ...options
    })
  }

  /**
   * 显示警告确认对话框
   * @param {string} title - 标题
   * @param {string} message - 消息内容
   * @param {Object} options - 可选配置
   * @returns {Promise<boolean>}
   */
  const warning = (title, message, options = {}) => {
    return show({
      title,
      message,
      type: 'warning',
      ...options
    })
  }

  /**
   * 显示错误提示对话框
   * @param {string} title - 标题
   * @param {string} message - 消息内容
   * @param {Object} options - 可选配置
   * @returns {Promise<boolean>}
   */
  const error = (title, message, options = {}) => {
    return show({
      title,
      message,
      type: 'error',
      ...options
    })
  }

  /**
   * 快速确认对话框 - 最常用的场景
   * @param {string} message - 确认消息
   * @param {Function} onConfirm - 确认回调
   * @param {string} title - 标题，默认"确认操作"
   */
  const confirm = (message, onConfirm, title = '确认操作') => {
    return show({
      title,
      message,
      type: 'warning',
      onConfirm: typeof onConfirm === 'function' ? onConfirm : undefined
    })
  }

  /**
   * 删除确认对话框
   * @param {string} itemName - 要删除的项目名称
   * @param {Function} onDelete - 删除回调
   * @param {string} itemType - 项目类型，默认"项目"
   */
  const deleteConfirm = (itemName, onDelete, itemType = '项目') => {
    return show({
      title: '删除确认',
      message: `确定要删除${itemType} <strong>${itemName}</strong> 吗？<br>删除后无法恢复。`,
      type: 'warning',
      confirmText: '删除',
      onConfirm: typeof onDelete === 'function' ? onDelete : undefined
    })
  }

  /**
   * 危险操作确认对话框
   * @param {string} message - 操作描述
   * @param {Function} onConfirm - 确认回调
   * @param {string} title - 标题，默认"危险操作确认"
   */
  const dangerConfirm = (message, onConfirm, title = '危险操作确认') => {
    return show({
      title,
      message: `<strong>⚠️ 危险操作</strong><br><br>${message}<br><br><strong>此操作不可恢复！</strong>`,
      type: 'error',
      confirmText: '我确定执行',
      onConfirm: typeof onConfirm === 'function' ? onConfirm : undefined
    })
  }

  /**
   * 成功提示对话框
   * @param {string} message - 成功消息
   * @param {Function} onOk - 确定回调
   */
  const success = (message, onOk) => {
    return show({
      title: '操作成功',
      message,
      type: 'info',
      confirmText: '确定',
      showCancel: false,
      onConfirm: typeof onOk === 'function' ? onOk : undefined
    })
  }

  /**
   * 关闭指定对话框
   * @param {string} key - 对话框标识
   */
  const close = (key = 'default') => {
    if (dialogs.value[key]) {
      dialogs.value[key].show = false
      // 延迟删除，等待动画完成
      setTimeout(() => {
        delete dialogs.value[key]
      }, 300)
    }
  }

  /**
   * 关闭所有对话框
   */
  const closeAll = () => {
    Object.keys(dialogs.value).forEach(key => {
      close(key)
    })
  }

  return {
    // 状态 - 用于模板绑定
    dialogs,

    // 方法
    show,
    info,
    warning,
    error,
    confirm,
    deleteConfirm,
    dangerConfirm,
    success,
    close,
    closeAll
  }
}

/**
 * 全局对话框管理器实例
 * 可在应用级别使用
 */
export const globalDialog = useDialog()