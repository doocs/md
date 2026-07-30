import { sanitizeTitle } from '@md/shared/utils/basicHelpers'
import { downloadFile } from '@md/shared/utils/fileHelpers'

/** Export raw Markdown document. */
export function downloadMD(doc: string, title: string = `untitled`) {
  const safeTitle = sanitizeTitle(title)
  downloadFile(doc, `${safeTitle}.md`, `text/markdown;charset=utf-8`)
}

/** Batch-export multiple posts as a ZIP archive. */
export async function exportPostsAsZip(posts: Array<{ title: string, content: string }>) {
  const JSZip = (await import(`jszip`)).default
  const zip = new JSZip()
  const usedNames = new Set<string>()
  posts.forEach(({ title, content }) => {
    const safeTitle = sanitizeTitle(title)
    let filename = `${safeTitle}.md`
    if (usedNames.has(filename)) {
      let counter = 1
      while (usedNames.has(`${safeTitle}-${counter}.md`))
        counter++
      filename = `${safeTitle}-${counter}.md`
    }
    usedNames.add(filename)
    zip.file(filename, content)
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
