import { defineStore } from 'pinia'

interface ConfirmOptions {
  title?: string
  description?: string
  cancelText?: string
  confirmText?: string
  /** 确认按钮使用红色 destructive 样式 */
  destructive?: boolean
  /** 确认回调 */
  onConfirm?: () => void | Promise<void>
  /** 取消回调（可选） */
  onCancel?: () => void
}

export const useConfirmStore = defineStore('confirm', () => {
  const isOpen = ref(false)
  const title = ref('提示')
  const description = ref('')
  const cancelText = ref('取消')
  const confirmText = ref('确定')
  const destructive = ref(false)

  let _onConfirm: (() => void | Promise<void>) | null = null
  let _onCancel: (() => void) | null = null

  function confirm(options: ConfirmOptions) {
    title.value = options.title ?? '提示'
    description.value = options.description ?? ''
    cancelText.value = options.cancelText ?? '取消'
    confirmText.value = options.confirmText ?? '确定'
    destructive.value = options.destructive ?? false
    _onConfirm = options.onConfirm ?? null
    _onCancel = options.onCancel ?? null
    isOpen.value = true
  }

  function handleConfirm() {
    _onConfirm?.()
    isOpen.value = false
    _onConfirm = null
    _onCancel = null
  }

  function handleCancel() {
    _onCancel?.()
    isOpen.value = false
    _onConfirm = null
    _onCancel = null
  }

  return {
    isOpen,
    title,
    description,
    cancelText,
    confirmText,
    destructive,
    confirm,
    handleConfirm,
    handleCancel,
  }
})
