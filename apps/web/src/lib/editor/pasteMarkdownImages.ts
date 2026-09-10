const MARKDOWN_REMOTE_IMAGE_RE = /!\[(.*?)\]\((https?:\/\/[^)]+)\)/g

function markdownRemoteImageRe(): RegExp {
  return new RegExp(MARKDOWN_REMOTE_IMAGE_RE.source, `g`)
}

export function hasMarkdownRemoteImages(text: string): boolean {
  return markdownRemoteImageRe().test(text)
}

export interface ImagePlaceholder {
  id: string
  originalUrl: string
  originalAlt: string
}

export function rewriteMarkdownImagesToPlaceholders(
  text: string,
  placeholderLabel: string,
  now = Date.now(),
): { previewText: string, placeholders: ImagePlaceholder[] } {
  const placeholders: ImagePlaceholder[] = []
  let matchIndex = 0
  const previewText = text.replace(markdownRemoteImageRe(), (_, alt: string, url: string) => {
    const id = `LOADING_${now}_${matchIndex++}`
    placeholders.push({ id, originalUrl: url, originalAlt: alt })
    return `![${placeholderLabel}](${id})`
  })
  return { previewText, placeholders }
}

export function collectPlaceholderReplacements(
  doc: string,
  placeholderLabel: string,
  placeholders: ImagePlaceholder[],
  urlByOriginal: Map<string, string>,
): { from: number, to: number, insert: string }[] {
  const changes: { from: number, to: number, insert: string }[] = []
  for (const info of placeholders) {
    const searchStr = `![${placeholderLabel}](${info.id})`
    const from = doc.indexOf(searchStr)
    if (from === -1)
      continue
    const newUrl = urlByOriginal.get(info.originalUrl) ?? info.originalUrl
    changes.push({
      from,
      to: from + searchStr.length,
      insert: `![${info.originalAlt}](${newUrl})`,
    })
  }
  return changes
}
