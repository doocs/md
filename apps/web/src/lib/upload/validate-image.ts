const VALID_IMAGE_SUFFIX = /\.(?:gif|pjp|jfif|jpe|pjpeg|jpe?g|png|webp)$/i
const MAX_SIZE_MB = 10

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/gif': `gif`,
  'image/jpeg': `jpg`,
  'image/pjpeg': `jpg`,
  'image/png': `png`,
  'image/webp': `webp`,
}

export const VALID_IMAGE_TYPES = new Set(Object.keys(IMAGE_MIME_TO_EXT))

type Translate = (key: string, params?: Record<string, unknown>) => string

export function hasValidImageSuffix(name: string): boolean {
  return VALID_IMAGE_SUFFIX.test(name)
}

export function isAcceptedImageType(type: string): boolean {
  return type in IMAGE_MIME_TO_EXT
}

/** Clipboard screenshots often have a MIME type but no filename extension. */
export function normalizePastedImageFile(file: File): File {
  if (hasValidImageSuffix(file.name))
    return file

  const ext = IMAGE_MIME_TO_EXT[file.type] ?? `png`
  const type = isAcceptedImageType(file.type) ? file.type : `image/png`
  return new File([file], `pasted-image.${ext}`, { type })
}

export function validateImageFile(file: File, t: Translate): { ok: true } | { ok: false, msg: string } {
  if (!hasValidImageSuffix(file.name) && !isAcceptedImageType(file.type)) {
    return { ok: false, msg: t(`upload.errors.invalidFormat`) }
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { ok: false, msg: t(`upload.errors.tooLarge`, { maxSize: MAX_SIZE_MB }) }
  }

  return { ok: true }
}
