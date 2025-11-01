import type { themeMap } from '@md/shared/configs'
import { defaultStyleConfig, widthOptions } from '@md/shared/configs'
import { addPrefix, useStorage } from '@/utils'

/**
 * 主题和样式配置 Store
 * 负责管理所有与主题、字体、颜色相关的配置
 */
export const useThemeStore = defineStore(`theme`, () => {
  // 文本主题
  const theme = useStorage<keyof typeof themeMap>(addPrefix(`theme`), defaultStyleConfig.theme)

  // 文本字体
  const fontFamily = useStorage(`fonts`, defaultStyleConfig.fontFamily)

  // 文本大小
  const fontSize = useStorage(`size`, defaultStyleConfig.fontSize)

  // 主色
  const primaryColor = useStorage(`color`, defaultStyleConfig.primaryColor)

  // 代码块主题
  const codeBlockTheme = useStorage(`codeBlockTheme`, defaultStyleConfig.codeBlockTheme)

  // 图注格式
  const legend = useStorage(`legend`, defaultStyleConfig.legend)

  // 是否开启 Mac 代码块
  const isMacCodeBlock = useStorage(`isMacCodeBlock`, defaultStyleConfig.isMacCodeBlock)

  // 是否开启代码块行号显示
  const isShowLineNumber = useStorage(`isShowLineNumber`, defaultStyleConfig.isShowLineNumber)

  // 是否开启微信外链接底部引用
  const isCiteStatus = useStorage(`isCiteStatus`, defaultStyleConfig.isCiteStatus)

  // 是否统计字数和阅读时间
  const isCountStatus = useStorage(`isCountStatus`, defaultStyleConfig.isCountStatus)

  // 是否开启段落首行缩进
  const isUseIndent = useStorage(addPrefix(`use_indent`), false)

  // 是否开启两端对齐
  const isUseJustify = useStorage(addPrefix(`use_justify`), false)

  // 预览宽度
  const previewWidth = useStorage(`previewWidth`, widthOptions[0].value)

  // 计算属性
  const fontSizeNumber = computed(() => Number(fontSize.value.replace(`px`, ``)))

  // Toggle 方法
  const toggleMacCodeBlock = useToggle(isMacCodeBlock)
  const toggleShowLineNumber = useToggle(isShowLineNumber)
  const toggleCiteStatus = useToggle(isCiteStatus)
  const toggleCountStatus = useToggle(isCountStatus)
  const toggleUseIndent = useToggle(isUseIndent)
  const toggleUseJustify = useToggle(isUseJustify)

  // 重置样式
  const resetStyle = () => {
    isCiteStatus.value = defaultStyleConfig.isCiteStatus
    isMacCodeBlock.value = defaultStyleConfig.isMacCodeBlock
    isShowLineNumber.value = defaultStyleConfig.isShowLineNumber
    isCountStatus.value = defaultStyleConfig.isCountStatus

    theme.value = defaultStyleConfig.theme
    fontFamily.value = defaultStyleConfig.fontFamily
    fontSize.value = defaultStyleConfig.fontSize
    primaryColor.value = defaultStyleConfig.primaryColor
    codeBlockTheme.value = defaultStyleConfig.codeBlockTheme
    legend.value = defaultStyleConfig.legend

    isUseIndent.value = false
    isUseJustify.value = false
  }

  // 切换 highlight.js 代码主题
  const updateCodeTheme = () => {
    const cssUrl = codeBlockTheme.value
    const el = document.querySelector(`#hljs`)

    if (el) {
      el.setAttribute(`href`, cssUrl)
    }
    else {
      const link = document.createElement(`link`)
      link.setAttribute(`type`, `text/css`)
      link.setAttribute(`rel`, `stylesheet`)
      link.setAttribute(`href`, cssUrl)
      link.setAttribute(`id`, `hljs`)
      document.head.appendChild(link)
    }
  }

  return {
    // State
    theme,
    fontFamily,
    fontSize,
    fontSizeNumber,
    primaryColor,
    codeBlockTheme,
    legend,
    isMacCodeBlock,
    isShowLineNumber,
    isCiteStatus,
    isCountStatus,
    isUseIndent,
    isUseJustify,
    previewWidth,

    // Actions
    toggleMacCodeBlock,
    toggleShowLineNumber,
    toggleCiteStatus,
    toggleCountStatus,
    toggleUseIndent,
    toggleUseJustify,
    resetStyle,
    updateCodeTheme,
  }
})
