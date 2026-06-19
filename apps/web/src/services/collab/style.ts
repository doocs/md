import type { PerThemeSettingsMap, ThemeName } from '@md/shared/configs'
import type { CollabStyleBundle, CustomComponentDef } from '@md/shared/types'
import type { CssContentConfig } from '@/stores/cssEditor'
import { storeToRefs } from 'pinia'
import { useCssEditorStore } from '@/stores/cssEditor'
import { useCustomComponentStore } from '@/stores/customComponent'
import { useThemeStore } from '@/stores/theme'

export interface PersonalStyleSnapshot {
  theme: ThemeName
  themeSettings: PerThemeSettingsMap
  isCiteStatus: boolean
  isCountStatus: boolean
  isUseIndent: boolean
  isUseJustify: boolean
  legend: string
  previewWidth: string
  cssContentConfig: CssContentConfig
  customComponents: CustomComponentDef[]
}

/** 从当前编辑器状态采集文档级样式包 */
export function collectCollabStyle(): CollabStyleBundle {
  const themeStore = useThemeStore()
  const cssEditorStore = useCssEditorStore()
  const customComponentStore = useCustomComponentStore()

  const { theme, themeSettings, isCiteStatus, isCountStatus, isUseIndent, isUseJustify, legend, previewWidth } = storeToRefs(themeStore)
  const { cssContentConfig } = storeToRefs(cssEditorStore)
  const { userComponents } = storeToRefs(customComponentStore)

  return {
    version: 1,
    theme: theme.value,
    themeSettings: { ...themeSettings.value },
    layout: {
      useIndent: isUseIndent.value,
      useJustify: isUseJustify.value,
      isCiteStatus: isCiteStatus.value,
      isCountStatus: isCountStatus.value,
      legend: legend.value,
      previewWidth: previewWidth.value,
    },
    customCss: {
      activeTabId: cssContentConfig.value.active,
      tabs: cssContentConfig.value.tabs.map(tab => ({
        id: tab.id,
        title: tab.title,
        content: tab.content,
      })),
    },
    customComponents: [...userComponents.value],
  }
}

/** 保存个人账户样式快照（进入协作前） */
export function snapshotPersonalStyle(): PersonalStyleSnapshot {
  const themeStore = useThemeStore()
  const cssEditorStore = useCssEditorStore()
  const customComponentStore = useCustomComponentStore()

  return {
    theme: themeStore.theme,
    themeSettings: { ...themeStore.themeSettings },
    isCiteStatus: themeStore.isCiteStatus,
    isCountStatus: themeStore.isCountStatus,
    isUseIndent: themeStore.isUseIndent,
    isUseJustify: themeStore.isUseJustify,
    legend: themeStore.legend,
    previewWidth: themeStore.previewWidth,
    cssContentConfig: JSON.parse(JSON.stringify(cssEditorStore.cssContentConfig)),
    customComponents: [...customComponentStore.userComponents],
  }
}

/** 将个人账户样式快照写回 Store */
export function restorePersonalStyle(snapshot: PersonalStyleSnapshot): void {
  const themeStore = useThemeStore()
  const cssEditorStore = useCssEditorStore()
  const customComponentStore = useCustomComponentStore()

  themeStore.theme = snapshot.theme
  themeStore.themeSettings = snapshot.themeSettings
  themeStore.isCiteStatus = snapshot.isCiteStatus
  themeStore.isCountStatus = snapshot.isCountStatus
  themeStore.isUseIndent = snapshot.isUseIndent
  themeStore.isUseJustify = snapshot.isUseJustify
  themeStore.legend = snapshot.legend
  themeStore.previewWidth = snapshot.previewWidth
  cssEditorStore.cssContentConfig = snapshot.cssContentConfig
  customComponentStore.userComponents = snapshot.customComponents
}

/** 将协作文档样式包应用到 Store 并刷新预览 */
export async function hydrateCollabStyle(style: CollabStyleBundle): Promise<void> {
  const themeStore = useThemeStore()
  const cssEditorStore = useCssEditorStore()
  const customComponentStore = useCustomComponentStore()

  themeStore.theme = style.theme
  themeStore.themeSettings = { ...style.themeSettings }
  themeStore.isUseIndent = style.layout.useIndent
  themeStore.isUseJustify = style.layout.useJustify
  themeStore.isCiteStatus = style.layout.isCiteStatus
  themeStore.isCountStatus = style.layout.isCountStatus
  themeStore.legend = style.layout.legend
  themeStore.previewWidth = style.layout.previewWidth

  const activeTab = style.customCss.tabs.find(t => t.id === style.customCss.activeTabId)
    ?? style.customCss.tabs[0]

  cssEditorStore.cssContentConfig = {
    ...cssEditorStore.cssContentConfig,
    active: activeTab?.id ?? style.customCss.activeTabId,
    tabs: style.customCss.tabs.map(tab => ({
      id: tab.id,
      title: tab.title,
      name: tab.title,
      content: tab.content,
      createDatetime: new Date(),
      updateDatetime: new Date(),
    })),
  }

  if (style.customComponents)
    customComponentStore.userComponents = [...style.customComponents]

  themeStore.updateCodeTheme()
  await themeStore.applyCurrentTheme()
}

/** 比较样式包是否与当前 Store 状态一致 */
export function collabStyleEquals(a: CollabStyleBundle, b: CollabStyleBundle): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
