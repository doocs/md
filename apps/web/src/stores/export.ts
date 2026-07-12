import type { PdfExportOptions } from '@/services/export'
import {
  downloadMD,
  exportHTML,
  exportPDF,
  exportPNG,
  exportPureHTML,
  getHtmlContent,
} from '@/services/export'
import { usePostStore } from './post'
import { useUIStore } from './ui'

/** Export helpers: HTML, PDF, Markdown, card image, etc. */
export const useExportStore = defineStore(`export`, () => {
  const postStore = usePostStore()
  const uiStore = useUIStore()

  const editorContent2HTML = () => getHtmlContent()

  const exportEditorContent2HTML = async () => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    await exportHTML(currentPost.title)
  }

  const exportEditorContent2PureHTML = (content: string) => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    exportPureHTML(content, currentPost.title)
  }

  const downloadAsCardImage = async () => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    await exportPNG(currentPost.title, {
      previewDevice: uiStore.previewDevice,
    })
  }

  const exportEditorContent2PDF = async (options?: Partial<PdfExportOptions>) => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    await exportPDF(currentPost.title, options)
  }

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
