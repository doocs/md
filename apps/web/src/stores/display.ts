/**
 * 对话框显示状态 Store
 * 负责管理各种对话框和面板的显示状态
 */
export const useDisplayStore = defineStore(`display`, () => {
  // 是否展示 CSS 编辑器
  const isShowCssEditor = useStorage(`isShowCssEditor`, false)
  const toggleShowCssEditor = useToggle(isShowCssEditor)

  // 是否展示插入表格对话框
  const isShowInsertFormDialog = ref(false)
  const toggleShowInsertFormDialog = useToggle(isShowInsertFormDialog)

  // 是否展示插入公众号名片对话框
  const isShowInsertMpCardDialog = ref(false)
  const toggleShowInsertMpCardDialog = useToggle(isShowInsertMpCardDialog)

  // 是否展示上传图片对话框
  const isShowUploadImgDialog = ref(false)
  const toggleShowUploadImgDialog = useToggle(isShowUploadImgDialog)

  // AI 对话框
  const aiDialogVisible = ref(false)
  const aiImageDialogVisible = ref(false)

  function toggleAIDialog(value?: boolean) {
    aiDialogVisible.value = value ?? !aiDialogVisible.value
  }

  function toggleAIImageDialog(value?: boolean) {
    aiImageDialogVisible.value = value ?? !aiImageDialogVisible.value
  }

  // 重置样式确认对话框
  const showResetConfirm = ref(false)

  return {
    isShowCssEditor,
    toggleShowCssEditor,
    isShowInsertFormDialog,
    toggleShowInsertFormDialog,
    isShowInsertMpCardDialog,
    toggleShowInsertMpCardDialog,
    isShowUploadImgDialog,
    toggleShowUploadImgDialog,
    aiDialogVisible,
    toggleAIDialog,
    aiImageDialogVisible,
    toggleAIImageDialog,
    showResetConfirm,
  }
})
