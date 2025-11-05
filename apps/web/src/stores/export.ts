import { toPng } from 'html-to-image'
import {
  downloadFile,
  downloadMD,
  exportHTML,
  exportPDF,
  exportPureHTML,
  getHtmlContent,
  sanitizeTitle,
} from '@/utils'
import { usePostStore } from './post'
import { useRenderStore } from './render'
import { useUIStore } from './ui'

/**
 * 导出功能 Store
 * 负责处理各种导出功能：HTML、PDF、MD、图片等
 */
export const useExportStore = defineStore(`export`, () => {
  const postStore = usePostStore()
  const renderStore = useRenderStore()
  const uiStore = useUIStore()

  // 将编辑器内容转换为 HTML
  const editorContent2HTML = () => {
    const temp = getHtmlContent()
    document.querySelector(`#output`)!.innerHTML = renderStore.output
    return temp
  }

  // 导出编辑器内容为 HTML，并且下载到本地
  const exportEditorContent2HTML = async () => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    await exportHTML(currentPost.title)
    document.querySelector(`#output`)!.innerHTML = renderStore.output
  }

  // 导出编辑器内容为无样式 HTML
  const exportEditorContent2PureHTML = (content: string) => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    exportPureHTML(content, currentPost.title)
  }

  // 下载卡片图片
  const downloadAsCardImage = async () => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    const el = document.querySelector<HTMLElement>(`#output-wrapper>.preview`)
    if (!el)
      return

    const url = await toPng(el, {
      backgroundColor: uiStore.isDark ? `` : `#fff`,
      skipFonts: true,
      pixelRatio: Math.max(window.devicePixelRatio || 1, 2),
      style: {
        margin: `0`,
      },
    })

    downloadFile(url, `${sanitizeTitle(currentPost.title)}.png`, `image/png`)
  }

  // 导出编辑器内容为 PDF
  const exportEditorContent2PDF = async () => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    await exportPDF(currentPost.title)
    document.querySelector(`#output`)!.innerHTML = renderStore.output
  }

  // 导出编辑器内容到本地（Markdown）
  const exportEditorContent2MD = (content: string) => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    downloadMD(content, currentPost.title)
  }

  return {
    editorContent2HTML,
    exportEditorContent2HTML,
    exportEditorContent2PureHTML,
    downloadAsCardImage,
    exportEditorContent2PDF,
    exportEditorContent2MD,
  }
})
