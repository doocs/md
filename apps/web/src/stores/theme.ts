import type { HeadingLevel, HeadingStyles, HeadingStyleType, PerThemeSettings, PerThemeSettingsMap, ThemeName } from '@md/shared/configs'
import { applyTheme } from '@md/core'
import { defaultPerThemeSettings, defaultStyleConfig, widthOptions } from '@md/shared/configs'
import { useCssEditorStore } from '@/stores/cssEditor'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

/** Legacy localStorage keys used before per-theme settings */
const LEGACY_KEYS = [`fonts`, `size`, `color`, `codeBlockTheme`, `headingStyles`, `isMacCodeBlock`, `isShowLineNumber`]

/**
 * Run legacy migration synchronously before store.reactive installs its watch.
 * Returns the migrated PerThemeSettingsMap (or {} if nothing to migrate).
 */
function migrateLegacySettingsSync(currentTheme: ThemeName): PerThemeSettingsMap {
  let hasAnyLegacyKey = false
  try {
    hasAnyLegacyKey = LEGACY_KEYS.some(key => localStorage.getItem(key) !== null)
  }
  catch { return {} }
  if (!hasAnyLegacyKey)
    return {}

  const migrationKey = addPrefix(`legacy_migrated`)
  try {
    if (localStorage.getItem(migrationKey) !== null)
      return {}
  }
  catch { return {} }

  const existingMapRaw = localStorage.getItem(addPrefix(`themeSettings`))
  const existingMap: PerThemeSettingsMap = existingMapRaw ? JSON.parse(existingMapRaw) : {}

  const defaults = defaultPerThemeSettings()
  const settings: PerThemeSettings = { ...existingMap[currentTheme] ?? defaults }

  const legacyFont = localStorage.getItem(`fonts`)
  if (legacyFont)
    settings.fontFamily = legacyFont

  const legacySize = localStorage.getItem(`size`)
  if (legacySize)
    settings.fontSize = legacySize

  const legacyColor = localStorage.getItem(`color`)
  if (legacyColor)
    settings.primaryColor = legacyColor

  const legacyCodeTheme = localStorage.getItem(`codeBlockTheme`)
  if (legacyCodeTheme)
    settings.codeBlockTheme = legacyCodeTheme

  const legacyHeading = localStorage.getItem(`headingStyles`)
  if (legacyHeading) {
    try { settings.headingStyles = JSON.parse(legacyHeading) }
    catch { /* ignore parse error */ }
  }

  const legacyMacBlock = localStorage.getItem(`isMacCodeBlock`)
  if (legacyMacBlock !== null)
    settings.isMacCodeBlock = legacyMacBlock === `true`

  const legacyLineNum = localStorage.getItem(`isShowLineNumber`)
  if (legacyLineNum !== null)
    settings.isShowLineNumber = legacyLineNum === `true`

  const result: PerThemeSettingsMap = { ...existingMap, [currentTheme]: settings }

  // Persist the merged map so store.reactive will pick it up
  try { localStorage.setItem(addPrefix(`themeSettings`), JSON.stringify(result)) }
  catch { /* quota error — non-critical */ }

  // Mark migration as done
  try { localStorage.setItem(migrationKey, `1`) }
  catch { /* ignore */ }

  // Clean up legacy keys
  for (const key of LEGACY_KEYS) {
    try { localStorage.removeItem(key) }
    catch { /* ignore */ }
  }

  return result
}

/**
 * 主题和样式配置 Store
 * 负责管理所有与主题、字体、颜色相关的配置
 *
 * 每个主题拥有独立的配置（primaryColor、fontFamily、fontSize、codeBlockTheme、
 * headingStyles、isShowLineNumber、isMacCodeBlock），切换主题时自动加载对应配置。
 */
export const useThemeStore = defineStore(`theme`, () => {
  // --- Legacy migration: run BEFORE reactive so initial value is correct ---
  const initialTheme = (() => {
    try { return localStorage.getItem(addPrefix(`theme`)) ?? defaultStyleConfig.theme }
    catch { return defaultStyleConfig.theme }
  })()
  const migratedSettings = migrateLegacySettingsSync(initialTheme as ThemeName)

  // 当前选中的主题
  const theme = store.reactive<ThemeName>(addPrefix(`theme`), defaultStyleConfig.theme)

  // 每个主题的独立配置（持久化到 localStorage）
  const themeSettings = store.reactive<PerThemeSettingsMap>(
    addPrefix(`themeSettings`),
    migratedSettings,
  )

  // 获取当前主题的配置（不存在时返回默认值）
  const currentSettings = computed<PerThemeSettings>(() => {
    return themeSettings.value[theme.value] ?? defaultPerThemeSettings()
  })

  // --- Per-theme computed properties ---
  // 使用 computed({ get, set }) 保持与现有 UI 组件的 Ref API 兼容

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

  /** 更新当前主题的某个字段 */
  function setThemeField<K extends keyof PerThemeSettings>(key: K, value: PerThemeSettings[K]) {
    const t = theme.value
    const existing = themeSettings.value[t] ?? defaultPerThemeSettings()
    themeSettings.value = {
      ...themeSettings.value,
      [t]: { ...existing, [key]: value },
    }
  }

  // --- Global (non-theme) properties ---

  // 是否开启微信外链接底部引用
  const isCiteStatus = store.reactive(`isCiteStatus`, defaultStyleConfig.isCiteStatus)

  // 是否统计字数和阅读时间
  const isCountStatus = store.reactive(`isCountStatus`, defaultStyleConfig.isCountStatus)

  // 是否开启段落首行缩进
  const isUseIndent = store.reactive(addPrefix(`use_indent`), false)

  // 是否开启两端对齐
  const isUseJustify = store.reactive(addPrefix(`use_justify`), false)

  // 图注格式
  const legend = store.reactive(`legend`, defaultStyleConfig.legend)

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

  // 重置样式（仅重置当前主题的配置）
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

  // 设置标题样式
  const setHeadingStyle = (level: HeadingLevel, style: HeadingStyleType) => {
    const existing = headingStyles.value
    headingStyles.value = {
      ...existing,
      [level]: style === `default` ? undefined : style,
    }
  }

  // 获取标题样式
  const getHeadingStyle = (level: HeadingLevel): HeadingStyleType => {
    return headingStyles.value[level] || `default`
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
    // State
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
    setHeadingStyle,
    getHeadingStyle,
  }
})
