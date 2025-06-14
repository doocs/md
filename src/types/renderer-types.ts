import type { IOpts } from '@/types'
import type { ReadTimeResults } from 'reading-time'

export interface RendererAPI {
  /* —— 生命周期 —— */
  reset: (newOpts: Partial<IOpts>) => void
  setOptions: (newOpts: Partial<IOpts>) => void
  getOpts: () => IOpts

  /* —— Markdown 处理 —— */
  parseFrontMatterAndContent: (markdown: string) => {
    yamlData: Record<string, any>
    markdownContent: string
    readingTime: ReadTimeResults
  }

  /* —— HTML 拼装 —— */
  buildReadingTime: (reading: ReadTimeResults) => string
  buildFootnotes: () => string
  buildAddition: () => string
  createContainer: (html: string) => string
}
