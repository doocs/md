import { sanitizeTitle } from '@md/shared/utils/basicHelpers'
import { downloadFile } from '@md/shared/utils/fileHelpers'

/** 导出原始 Markdown 文档 */
export function downloadMD(doc: string, title: string = `untitled`) {
  const safeTitle = sanitizeTitle(title)
  downloadFile(doc, `${safeTitle}.md`, `text/markdown;charset=utf-8`)
}

/** 批量导出多篇文章为 ZIP */
export async function exportPostsAsZip(posts: Array<{ title: string, content: string }>) {
  const JSZip = (await import(`jszip`)).default
  const zip = new JSZip()
  posts.forEach(({ title, content }) => {
    const safeTitle = sanitizeTitle(title)
    zip.file(`${safeTitle}.md`, content)
  })
  const blob = await zip.generateAsync({ type: `blob` })
  const date = new Date().toISOString().slice(0, 10)
  const url = URL.createObjectURL(blob)
  const a = document.createElement(`a`)
  a.href = url
  a.download = `posts-${date}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
