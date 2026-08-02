import { sanitizeTitle } from '@md/shared/utils/basicHelpers'
import { downloadFile } from '@md/shared/utils/fileHelpers'

/** Export raw Markdown document. */
export function downloadMD(doc: string, title: string = `untitled`) {
  const safeTitle = sanitizeTitle(title)
  downloadFile(doc, `${safeTitle}.md`, `text/markdown;charset=utf-8`)
}

/** Batch-export multiple posts as a ZIP archive. */
export async function exportPostsAsZip(posts: Array<{ title: string, content: string }>) {
  const { strToU8, zip } = await import(`fflate`)
  const usedNames = new Set<string>()
  const files: Record<string, Uint8Array> = {}
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
    files[filename] = strToU8(content)
  })
  const data = await new Promise<Uint8Array<ArrayBuffer>>((resolve, reject) =>
    zip(files, (err, out) => (err ? reject(err) : resolve(out as Uint8Array<ArrayBuffer>))))
  const blob = new Blob([data], { type: `application/zip` })
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
