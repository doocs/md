const VALID_IMAGE_SUFFIX = /\.(?:gif|pjp|jfif|jpe|pjpeg|jpe?g|png|webp)$/i
const MAX_SIZE_MB = 10

type Translate = (key: string, params?: Record<string, unknown>) => string

export function validateImageFile(file: File, t: Translate): { ok: true } | { ok: false, msg: string } {
  if (!VALID_IMAGE_SUFFIX.test(file.name)) {
    return { ok: false, msg: t(`upload.errors.invalidFormat`) }
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { ok: false, msg: t(`upload.errors.tooLarge`, { maxSize: MAX_SIZE_MB }) }
  }

  return { ok: true }
}
