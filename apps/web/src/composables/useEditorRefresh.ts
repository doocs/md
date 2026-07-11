import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'

/** Debounce after the last keystroke before preview refresh */
const EDITOR_REFRESH_DEBOUNCE_MS = 300
/** Cap so continuous typing still refreshes preview periodically */
const EDITOR_REFRESH_MAX_WAIT_MS = 800

/**
 * 触发编辑器预览重渲染（应用当前主题与样式配置）。
 * scheduleEditorRefresh 用于连续输入/调样式时合并多次渲染（debounce + max-wait）。
 */
export function useEditorRefresh(options?: {
  debounceMs?: number
  maxWaitMs?: number
}) {
  const themeStore = useThemeStore()
  const editorStore = useEditorStore()
  const renderStore = useRenderStore()
  const debounceMs = options?.debounceMs ?? EDITOR_REFRESH_DEBOUNCE_MS
  const maxWaitMs = options?.maxWaitMs ?? EDITOR_REFRESH_MAX_WAIT_MS
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let maxWaitTimer: ReturnType<typeof setTimeout> | undefined

  function clearTimers() {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = undefined
    }
    if (maxWaitTimer) {
      clearTimeout(maxWaitTimer)
      maxWaitTimer = undefined
    }
  }

  function editorRefresh(options?: { force?: boolean }) {
    themeStore.updateCodeTheme()
    const raw = editorStore.getContent()
    renderStore.render(raw, options)
  }

  function flushScheduledRefresh() {
    clearTimers()
    editorRefresh()
  }

  function scheduleEditorRefresh() {
    if (debounceTimer)
      clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debounceTimer = undefined
      if (maxWaitTimer) {
        clearTimeout(maxWaitTimer)
        maxWaitTimer = undefined
      }
      editorRefresh()
    }, debounceMs)

    if (!maxWaitTimer) {
      maxWaitTimer = setTimeout(() => {
        maxWaitTimer = undefined
        if (debounceTimer) {
          clearTimeout(debounceTimer)
          debounceTimer = undefined
        }
        editorRefresh()
      }, maxWaitMs)
    }
  }

  onUnmounted(() => {
    if (debounceTimer || maxWaitTimer) {
      clearTimers()
      editorRefresh()
    }
  })

  return { editorRefresh, scheduleEditorRefresh, flushScheduledRefresh }
}
