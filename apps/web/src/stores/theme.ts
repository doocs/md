import type { ThemeName } from '@md/shared/configs'
import { applyTheme } from '@md/core'
import { defaultStyleConfig, widthOptions } from '@md/shared/configs'
import { addPrefix, store } from '@/utils'

/**
 * 主题和样式配置 Store
 * 负责管理所有与主题、字体、颜色相关的配置
 */
export const useThemeStore = defineStore(`theme`, () => {
  // 文本主题
  const theme = store.reactive<ThemeName>(addPrefix(`theme`), defaultStyleConfig.theme)

  // 文本字体
  const fontFamily = store.reactive(`fonts`, defaultStyleConfig.fontFamily)

  // 文本大小
  const fontSize = store.reactive(`size`, defaultStyleConfig.fontSize)

  // 主色
  const primaryColor = store.reactive(`color`, defaultStyleConfig.primaryColor)

  // 代码块主题
  const codeBlockTheme = store.reactive(`codeBlockTheme`, defaultStyleConfig.codeBlockTheme)

  // 图注格式
  const legend = store.reactive(`legend`, defaultStyleConfig.legend)

  // 是否开启 Mac 代码块
  const isMacCodeBlock = store.reactive(`isMacCodeBlock`, defaultStyleConfig.isMacCodeBlock)

  // 是否开启代码块行号显示
  const isShowLineNumber = store.reactive(`isShowLineNumber`, defaultStyleConfig.isShowLineNumber)

  // 是否开启微信外链接底部引用
  const isCiteStatus = store.reactive(`isCiteStatus`, defaultStyleConfig.isCiteStatus)

  // 是否统计字数和阅读时间
  const isCountStatus = store.reactive(`isCountStatus`, defaultStyleConfig.isCountStatus)

  // 是否开启段落首行缩进
  const isUseIndent = store.reactive(addPrefix(`use_indent`), false)

  // 是否开启两端对齐
  const isUseJustify = store.reactive(addPrefix(`use_justify`), false)

  // 预览宽度
  const previewWidth = store.reactive(`previewWidth`, widthOptions[0].value)

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

  /**
   * 应用当前主题配置（新主题系统）
   * 使用 CSS 注入而非内联样式
   */
  const applyCurrentTheme = async () => {
    try {
      // 动态导入避免循环依赖
      const { useCssEditorStore } = await import(`@/stores/cssEditor`)
      const cssEditorStore = useCssEditorStore()

      const customCSS = cssEditorStore.getCurrentTabContent()

      console.log(`[applyCurrentTheme] 主题:`, theme.value)
      console.log(`[applyCurrentTheme] customCSS 长度:`, customCSS?.length)

      applyTheme({
        themeName: theme.value,
        customCSS,
        variables: {
          primaryColor: primaryColor.value,
          fontFamily: fontFamily.value,
          fontSize: fontSize.value,
          isUseIndent: isUseIndent.value,
          isUseJustify: isUseJustify.value,
        },
      })

      console.log(`[applyCurrentTheme] 主题应用完成`)
    }
    catch (error) {
      console.error(`[applyCurrentTheme] 主题应用失败:`, error)
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
    applyCurrentTheme,
  }
})
