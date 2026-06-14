import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'
import { getHtmlContent, getShareExportStyles } from '@/utils/export-content'
import { waitForPreviewReady } from '@/utils/preview-ready'

/** 捕获浅色模式分享快照（编辑器处于深色模式时会临时按浅色重渲染） */
export async function captureShareSnapshot(): Promise<{ bodyHtml: string, stylesHtml: string }> {
  const renderStore = useRenderStore()
  const editorStore = useEditorStore()
  const uiStore = useUIStore()
  const content = editorStore.getContent()
  const rerenderForLight = uiStore.isDark

  if (rerenderForLight) {
    renderStore.render(content, { themeMode: `light` })
    await waitForPreviewReady()
  }
  else {
    await waitForPreviewReady()
  }

  try {
    return {
      bodyHtml: getHtmlContent(),
      stylesHtml: await getShareExportStyles(),
    }
  }
  finally {
    if (rerenderForLight)
      renderStore.render(content, { themeMode: `dark` })
  }
}
