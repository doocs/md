import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'

const EDITOR_REFRESH_DEBOUNCE_MS = 300

/**
 * 触发编辑器预览重渲染（应用当前主题与样式配置）。
 * scheduleEditorRefresh 用于连续调整样式时合并多次渲染。
 */
export function useEditorRefresh(options?: { debounceMs?: number }) {
  const themeStore = useThemeStore()
  const editorStore = useEditorStore()
  const renderStore = useRenderStore()
  const debounceMs = options?.debounceMs ?? EDITOR_REFRESH_DEBOUNCE_MS
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  function editorRefresh() {
    themeStore.updateCodeTheme()
    const raw = editorStore.getContent()
    renderStore.render(raw)
  }

  function scheduleEditorRefresh() {
    if (debounceTimer)
      clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debounceTimer = undefined
      editorRefresh()
    }, debounceMs)
  }

  onUnmounted(() => {
    if (debounceTimer)
      clearTimeout(debounceTimer)
  })

  return { editorRefresh, scheduleEditorRefresh }
}
