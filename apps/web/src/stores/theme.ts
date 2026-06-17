import type { HeadingLevel, HeadingStyles, HeadingStyleType, PerThemeSettings, PerThemeSettingsMap, ThemeName } from '@md/shared/configs'
import { applyTheme } from '@md/core'
import { defaultPerThemeSettings, defaultStyleConfig, widthOptions } from '@md/shared/configs'
import { store } from '@/storage'
import { addPrefix } from '@/storage/prefix'
import { useCssEditorStore } from '@/stores/cssEditor'

/**
 * 主题和样式配置 Store
 * 负责管理所有与主题、字体、颜色相关的配置
 *
 * 每个主题拥有独立的配置（primaryColor、fontFamily、fontSize、codeBlockTheme、
 * headingStyles、isShowLineNumber、isMacCodeBlock），切换主题时自动加载对应配置。
 */
export const useThemeStore = defineStore(`theme`, () => {
  const theme = store.reactive<ThemeName>(addPrefix(`theme`), defaultStyleConfig.theme)

  const themeSettings = store.reactive<PerThemeSettingsMap>(
    addPrefix(`themeSettings`),
    {},
  )

  const currentSettings = computed<PerThemeSettings>(() => {
    return themeSettings.value[theme.value] ?? defaultPerThemeSettings()
  })

  const primaryColor = computed<string>({
    get: () => currentSettings.value.primaryColor,
    set: (v: string) => { setThemeField(`primaryColor`, v) },
  })

  const fontFamily = computed<string>({
    get: () => currentSettings.value.fontFamily,
    set: (v: string) => { setThemeField(`fontFamily`, v) },
  })

  const fontSize = computed<string>({
    get: () => currentSettings.value.fontSize,
    set: (v: string) => { setThemeField(`fontSize`, v) },
  })

  const codeBlockTheme = computed<string>({
    get: () => currentSettings.value.codeBlockTheme,
    set: (v: string) => { setThemeField(`codeBlockTheme`, v) },
  })

  const headingStyles = computed<HeadingStyles>({
    get: () => currentSettings.value.headingStyles,
    set: (v: HeadingStyles) => { setThemeField(`headingStyles`, v) },
  })

  const isShowLineNumber = computed<boolean>({
    get: () => currentSettings.value.isShowLineNumber,
    set: (v: boolean) => { setThemeField(`isShowLineNumber`, v) },
  })

  const isMacCodeBlock = computed<boolean>({
    get: () => currentSettings.value.isMacCodeBlock,
    set: (v: boolean) => { setThemeField(`isMacCodeBlock`, v) },
  })

  function setThemeField<K extends keyof PerThemeSettings>(key: K, value: PerThemeSettings[K]) {
    const t = theme.value
    const existing = themeSettings.value[t] ?? defaultPerThemeSettings()
    themeSettings.value = {
      ...themeSettings.value,
      [t]: { ...existing, [key]: value },
    }
  }

  const isCiteStatus = store.reactive(`isCiteStatus`, defaultStyleConfig.isCiteStatus)
  const isCountStatus = store.reactive(`isCountStatus`, defaultStyleConfig.isCountStatus)
  const isUseIndent = store.reactive(addPrefix(`use_indent`), false)
  const isUseJustify = store.reactive(addPrefix(`use_justify`), false)
  const legend = store.reactive(`legend`, defaultStyleConfig.legend)
  const previewWidth = store.reactive(`previewWidth`, widthOptions[0].value)

  const fontSizeNumber = computed(() => Number(fontSize.value.replace(`px`, ``)))

  const toggleMacCodeBlock = useToggle(isMacCodeBlock)
  const toggleShowLineNumber = useToggle(isShowLineNumber)
  const toggleCiteStatus = useToggle(isCiteStatus)
  const toggleCountStatus = useToggle(isCountStatus)
  const toggleUseIndent = useToggle(isUseIndent)
  const toggleUseJustify = useToggle(isUseJustify)

  const resetStyle = () => {
    themeSettings.value = {
      ...themeSettings.value,
      [theme.value]: defaultPerThemeSettings(),
    }
    isCiteStatus.value = defaultStyleConfig.isCiteStatus
    isCountStatus.value = defaultStyleConfig.isCountStatus
    legend.value = defaultStyleConfig.legend
    isUseIndent.value = false
    isUseJustify.value = false
  }

  const setHeadingStyle = (level: HeadingLevel, style: HeadingStyleType) => {
    const existing = headingStyles.value
    headingStyles.value = {
      ...existing,
      [level]: style === `default` ? undefined : style,
    }
  }

  const getHeadingStyle = (level: HeadingLevel): HeadingStyleType => {
    return headingStyles.value[level] || `default`
  }

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

  const applyCurrentTheme = async () => {
    try {
      const cssEditorStore = useCssEditorStore()
      const customCSS = cssEditorStore.getCurrentTabContent()

      await applyTheme({
        themeName: theme.value,
        customCSS,
        variables: {
          primaryColor: primaryColor.value,
          fontFamily: fontFamily.value,
          fontSize: fontSize.value,
          isUseIndent: isUseIndent.value,
          isUseJustify: isUseJustify.value,
          headingStyles: headingStyles.value,
        },
      })
    }
    catch (error) {
      console.error(`[applyCurrentTheme] 主题应用失败:`, error)
    }
  }

  return {
    theme,
    themeSettings,
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
    headingStyles,
    toggleMacCodeBlock,
    toggleShowLineNumber,
    toggleCiteStatus,
    toggleCountStatus,
    toggleUseIndent,
    toggleUseJustify,
    resetStyle,
    updateCodeTheme,
    applyCurrentTheme,
    setHeadingStyle,
    getHeadingStyle,
  }
})
