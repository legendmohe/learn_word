/**
 * useDialog 使用示例
 * 展示如何用一行代码弹出各种对话框
 */

import { useDialog } from '../composables/useDialog.js'

const dialog = useDialog()

// === 基础用法 ===

// 1. 简单确认对话框
const simpleConfirm = async () => {
  const confirmed = await dialog.confirm('确定要删除这条记录吗？', () => {
    console.log('已删除')
  })

  if (confirmed) {
    // 用户点击了确定
  }
}

// 2. 信息提示
const showInfo = async () => {
  await dialog.info('提示', '操作已完成！')
}

// 3. 警告提示
const showWarning = async () => {
  await dialog.warning('警告', '请检查输入内容')
}

// 4. 错误提示
const showError = async () => {
  await dialog.error('错误', '网络连接失败，请重试')
}

// 5. 成功提示
const showSuccess = async () => {
  await dialog.success('保存成功', () => {
    console.log('显示成功提示后执行')
  })
}

// === 专用场景 ===

// 6. 删除确认
const deleteItem = async (itemName) => {
  const confirmed = await dialog.deleteConfirm(itemName, () => {
    console.log(`已删除: ${itemName}`)
  })

  if (confirmed) {
    // 执行删除逻辑
  }
}

// 7. 危险操作确认
const resetData = async () => {
  const confirmed = await dialog.dangerConfirm(
    '这将删除所有用户数据',
    () => {
      console.log('已重置数据')
    }
  )

  if (confirmed) {
    // 执行重置逻辑
  }
}

// === 高级用法 ===

// 8. 自定义对话框
const customDialog = async () => {
  const confirmed = await dialog.show({
    title: '自定义对话框',
    message: '这是自定义的消息内容<br><strong>支持HTML格式</strong>',
    type: 'info',
    confirmText: '同意',
    cancelText: '拒绝',
    onConfirm: () => console.log('用户同意'),
    onCancel: () => console.log('用户拒绝')
  })

  console.log('用户选择:', confirmed)
}

// 9. 异步操作确认
const asyncOperation = async () => {
  const confirmed = await dialog.warning('异步操作', '确定要开始耗时操作吗？')

  if (confirmed) {
    try {
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 2000))
      await dialog.success('操作完成', '刷新页面查看结果')
    } catch (error) {
      await dialog.error('操作失败', error.message)
    }
  }
}

// 10. 批量操作确认
const batchDelete = async (items) => {
  const confirmed = await dialog.dangerConfirm(
    `确定要删除选中的 ${items.length} 个项目吗？`,
    async () => {
      // 批量删除逻辑
      for (const item of items) {
        await deleteItem(item)
      }
      await dialog.success(`已删除 ${items.length} 个项目`)
    }
  )
}

export {
  simpleConfirm,
  showInfo,
  showWarning,
  showError,
  showSuccess,
  deleteItem,
  resetData,
  customDialog,
  asyncOperation,
  batchDelete
}