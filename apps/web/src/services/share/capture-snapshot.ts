import { stripUnresolvedAsyncPlaceholders, waitForPreviewReady } from '@/lib/preview/preview-ready'
import { getHtmlContent, getShareExportStyles } from '@/services/export'
import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'

/** 捕获浅色模式分享快照（编辑器处于深色模式时会临时按浅色重渲染） */
export async function captureShareSnapshot(): Promise<{ bodyHtml: string, stylesHtml: string }> {
  const renderStore = useRenderStore()
  const editorStore = useEditorStore()
  const uiStore = useUIStore()
  const content = editorStore.getContent()
  const rerenderForLight = uiStore.isDark
  const shareThemeMode = `light` as const

  if (rerenderForLight)
    renderStore.render(content, { themeMode: shareThemeMode })

  const ready = await waitForPreviewReady(undefined, { themeMode: shareThemeMode })

  try {
    let bodyHtml = getHtmlContent({ themeMode: shareThemeMode })
    if (!ready) {
      const wrapper = document.createElement(`div`)
      wrapper.innerHTML = bodyHtml
      stripUnresolvedAsyncPlaceholders(wrapper)
      bodyHtml = wrapper.innerHTML
    }

    return {
      bodyHtml,
      stylesHtml: await getShareExportStyles(),
    }
  }
  finally {
    if (rerenderForLight)
      renderStore.render(content, { themeMode: `dark` })
  }
}
