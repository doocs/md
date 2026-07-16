import { uuidv4 } from './uuid'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': `jpg`,
  'image/jpg': `jpg`,
  'image/png': `png`,
  'image/gif': `gif`,
  'image/webp': `webp`,
  'image/svg+xml': `svg`,
  'image/bmp': `bmp`,
  'image/avif': `avif`,
  'image/x-icon': `ico`,
  'image/vnd.microsoft.icon': `ico`,
}

const INVALID_EXTENSIONS = new Set([`blob`, `bin`, `octet-stream`])

function extensionFromMime(mimeType: string): string | null {
  const mime = mimeType.trim().toLowerCase()
  if (!mime)
    return null

  const mapped = MIME_TO_EXT[mime]
  if (mapped)
    return mapped

  const [, subtype] = mime.split(`/`)
  if (!subtype || subtype === `octet-stream`)
    return null

  return subtype.split(`+`)[0] || null
}

function extensionFromFilename(filename: string): string | null {
  const name = filename.trim()
  const dotIndex = name.lastIndexOf(`.`)
  if (dotIndex <= 0 || dotIndex >= name.length - 1)
    return null

  const ext = name.slice(dotIndex + 1).toLowerCase()
  if (!ext || INVALID_EXTENSIONS.has(ext) || ext.length > 10)
    return null

  return ext
}

export function resolveImageExtension(filename: string, mimeType: string): string {
  return extensionFromFilename(filename)
    ?? extensionFromMime(mimeType)
    ?? `png`
}

export function buildDatedObjectKey(filename: string, mimeType: string): string {
  const ext = resolveImageExtension(filename, mimeType)
  return `${Date.now()}-${uuidv4()}.${ext}`
}
