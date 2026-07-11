import type { ReadTimeResults } from '../utils/readingTime'
import type { IOpts } from './common'
import type { FrontMatterData } from './front-matter'

export interface RendererAPI {
  /* Lifecycle */
  reset: (newOpts: Partial<IOpts>) => void
  setOptions: (newOpts: Partial<IOpts>) => void
  getOpts: () => IOpts

  /* Markdown */
  parseFrontMatterAndContent: (markdown: string) => {
    yamlData: FrontMatterData
    markdownContent: string
    readingTime: ReadTimeResults
  }
  renderMarkdownToHtml: (markdown: string) => string

  /* HTML assembly */
  buildReadingTime: (reading: ReadTimeResults) => string
  buildFootnotes: () => string
  buildAddition: () => string
  createContainer: (html: string) => string
}
