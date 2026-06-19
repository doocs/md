import { collectCollabStyle } from '@/services/collab/style'

/** 协作模式下监听样式变更并触发同步 */
export function useCollabStyleWatcher() {
  const collabStore = useCollabStore()
  const themeStore = useThemeStore()
  const cssEditorStore = useCssEditorStore()
  const customComponentStore = useCustomComponentStore()

  let lastStyleSnapshot = ``

  function snapshot(): string {
    return JSON.stringify(collectCollabStyle())
  }

  watch(
    () => [
      collabStore.isCollabMode,
      themeStore.theme,
      themeStore.themeSettings,
      themeStore.isCiteStatus,
      themeStore.isCountStatus,
      themeStore.isUseIndent,
      themeStore.isUseJustify,
      themeStore.legend,
      themeStore.previewWidth,
      cssEditorStore.cssContentConfig,
      customComponentStore.userComponents,
    ],
    () => {
      if (!collabStore.isCollabMode || !collabStore.canWrite)
        return

      const current = snapshot()
      if (current === lastStyleSnapshot)
        return

      const prev = lastStyleSnapshot
      lastStyleSnapshot = current
      if (!prev)
        return

      collabStore.notifyStyleChanged()
    },
    { deep: true },
  )

  watch(() => collabStore.isCollabMode, (active) => {
    lastStyleSnapshot = active ? snapshot() : ``
  })
}
