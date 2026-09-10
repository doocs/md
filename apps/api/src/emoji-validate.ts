import { UPLOAD_MAX_BYTES } from './upload-config'

export const EMOJI_MAX_ITEMS = 100

const MIME_EXTENSIONS = {
  'image/png': `png`,
  'image/jpeg': `jpg`,
  'image/gif': `gif`,
  'image/webp': `webp`,
} as const

export type EmojiMime = keyof typeof MIME_EXTENSIONS

export type EmojiFileValidation
  = | { ok: true, mime: EmojiMime, extension: string }
    | { ok: false, error: `empty_file` | `file_too_large` | `invalid_file_type` | `mime_mismatch` }

function stripControlCharacters(value: string): string {
  return [...value]
    .filter((character) => {
      const code = character.charCodeAt(0)
      return code > 0x1F && code !== 0x7F
    })
    .join(``)
}

function bytesMatch(bytes: Uint8Array, expected: number[]): boolean {
  return expected.every((value, index) => bytes[index] === value)
}

function magicMatches(mime: EmojiMime, bytes: Uint8Array): boolean {
  if (mime === `image/png`)
    return bytesMatch(bytes, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
  if (mime === `image/jpeg`)
    return bytesMatch(bytes, [0xFF, 0xD8, 0xFF])
  if (mime === `image/gif`) {
    const signature = new TextDecoder().decode(bytes.slice(0, 6))
    return signature === `GIF87a` || signature === `GIF89a`
  }
  return bytesMatch(bytes, [0x52, 0x49, 0x46, 0x46])
    && bytesMatch(bytes.slice(8), [0x57, 0x45, 0x42, 0x50])
}

export function validateEmojiFile(
  mime: string,
  size: number,
  bytes: Uint8Array,
): EmojiFileValidation {
  if (size <= 0)
    return { ok: false, error: `empty_file` }
  if (size > UPLOAD_MAX_BYTES)
    return { ok: false, error: `file_too_large` }

  const normalizedMime = mime.trim().toLowerCase()
  if (!(normalizedMime in MIME_EXTENSIONS))
    return { ok: false, error: `invalid_file_type` }

  const typedMime = normalizedMime as EmojiMime
  if (!magicMatches(typedMime, bytes))
    return { ok: false, error: `mime_mismatch` }

  return {
    ok: true,
    mime: typedMime,
    extension: MIME_EXTENSIONS[typedMime],
  }
}

export function sanitizeEmojiName(value: string, fallback = `emoji`): string {
  const basename = value.split(/[\\/]/).pop() ?? ``
  const withoutExtension = basename.replace(/\.[^.]+$/, ``)
  const sanitized = stripControlCharacters(withoutExtension)
    .replace(/\s+/g, ` `)
    .trim()
    .slice(0, 100)
  return sanitized || fallback
}

export function sanitizePackName(value: unknown): string | null {
  if (typeof value !== `string`)
    return null
  const sanitized = stripControlCharacters(value)
    .replace(/\s+/g, ` `)
    .trim()
    .slice(0, 60)
  return sanitized || null
}
