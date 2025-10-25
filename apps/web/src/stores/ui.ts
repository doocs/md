import { addPrefix } from '@/utils'

/**
 * UI 状态 Store
 * 负责管理全局 UI 状态，如深色模式、侧边栏状态等
 */
export const useUIStore = defineStore(`ui`, () => {
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

  // 是否打开重置样式对话框
  const isOpenConfirmDialog = ref(false)

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
    // State
    isDark,
    isEditOnLeft,
    showAIToolbox,
    hasShownAIToolboxHint,
    isOpenRightSlider,
    isOpenPostSlider,
    isMobile,
    isOpenConfirmDialog,

    // Actions
    toggleDark,
    toggleEditOnLeft,
    toggleAIToolbox,
  }
})
