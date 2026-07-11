import { defineStore } from 'pinia'
import { t } from '@/i18n/translate'

interface ConfirmOptions {
  title?: string
  description?: string
  cancelText?: string
  confirmText?: string
  /** Use destructive (red) style for the confirm button. */
  destructive?: boolean
  /** Confirm callback. */
  onConfirm?: () => void | Promise<void>
  /** Optional cancel callback. */
  onCancel?: () => void
}

export const useConfirmStore = defineStore('confirm', () => {
  const isOpen = ref(false)
  const title = ref(t('common.tip'))
  const description = ref('')
  const cancelText = ref(t('common.cancel'))
  const confirmText = ref(t('common.confirm'))
  const destructive = ref(false)

  let _onConfirm: (() => void | Promise<void>) | null = null
  let _onCancel: (() => void) | null = null

  function confirm(options: ConfirmOptions) {
    title.value = options.title ?? t('common.tip')
    description.value = options.description ?? ''
    cancelText.value = options.cancelText ?? t('common.cancel')
    confirmText.value = options.confirmText ?? t('common.confirm')
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
