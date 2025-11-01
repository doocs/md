import { addPrefix } from '@/utils'

/**
 * UI 状态 Store
 * 负责管理全局 UI 状态，包括深色模式、侧边栏、对话框等
 */
export const useUIStore = defineStore(`ui`, () => {
  // ==================== 全局 UI 状态 ====================
  // 是否开启深色模式
  const isDark = useDark()
  const toggleDark = useToggle(isDark)

  // 是否在左侧编辑
  const isEditOnLeft = useStorage(`isEditOnLeft`, true)
  const toggleEditOnLeft = useToggle(isEditOnLeft)

  // 是否开启 AI 工具箱
  const showAIToolbox = useStorage(`showAIToolbox`, true)
  const toggleAIToolbox = useToggle(showAIToolbox)

  // 是否已经显示过 AI 工具箱选中文本提示
  const hasShownAIToolboxHint = useStorage(`hasShownAIToolboxHint`, false)

  // 是否打开右侧滑块
  const isOpenRightSlider = useStorage(addPrefix(`is_open_right_slider`), false)

  // 是否打开文章列表滑块
  const isOpenPostSlider = useStorage(addPrefix(`is_open_post_slider`), false)

  // 是否为移动端
  const isMobile = useStorage(`isMobile`, false)

  // ==================== 对话框状态 ====================
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

  // 是否打开重置样式确认对话框
  const isOpenConfirmDialog = ref(false)

  // AI 对话框
  const aiDialogVisible = ref(false)
  const aiImageDialogVisible = ref(false)

  function toggleAIDialog(value?: boolean) {
    aiDialogVisible.value = value ?? !aiDialogVisible.value
  }

  function toggleAIImageDialog(value?: boolean) {
    aiImageDialogVisible.value = value ?? !aiImageDialogVisible.value
  }

  // ==================== 工具函数 ====================
  // 处理窗口大小变化
  function handleResize() {
    isMobile.value = window.innerWidth <= 768
  }

  onMounted(() => {
    handleResize()
    window.addEventListener(`resize`, handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener(`resize`, handleResize)
  })

  return {
    // ==================== 全局 UI 状态 ====================
    isDark,
    isEditOnLeft,
    showAIToolbox,
    hasShownAIToolboxHint,
    isOpenRightSlider,
    isOpenPostSlider,
    isMobile,

    // ==================== 对话框状态 ====================
    isShowCssEditor,
    toggleShowCssEditor,
    isShowInsertFormDialog,
    toggleShowInsertFormDialog,
    isShowInsertMpCardDialog,
    toggleShowInsertMpCardDialog,
    isShowUploadImgDialog,
    toggleShowUploadImgDialog,
    isOpenConfirmDialog,
    aiDialogVisible,
    toggleAIDialog,
    aiImageDialogVisible,
    toggleAIImageDialog,

    // ==================== Actions ====================
    toggleDark,
    toggleEditOnLeft,
    toggleAIToolbox,
  }
})
