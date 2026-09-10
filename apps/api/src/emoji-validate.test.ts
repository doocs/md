import { Buffer } from 'node:buffer'
import { describe, expect, it } from 'vitest'
import { sanitizeEmojiName, sanitizePackName, validateEmojiFile } from './emoji-validate'
import { UPLOAD_MAX_BYTES } from './upload-config'

describe(`validateEmojiFile`, () => {
  it.each([
    [`image/png`, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    [`image/jpeg`, [0xFF, 0xD8, 0xFF, 0xE0]],
    [`image/gif`, [...Buffer.from(`GIF89a`)]],
    [`image/webp`, [...Buffer.from(`RIFF`), 0, 0, 0, 0, ...Buffer.from(`WEBP`)]],
  ])(`accepts valid %s magic bytes`, (mime, bytes) => {
    expect(validateEmojiFile(mime, bytes.length, Uint8Array.from(bytes)).ok).toBe(true)
  })

  it(`rejects unsupported types and mismatched magic bytes`, () => {
    expect(validateEmojiFile(`image/svg+xml`, 4, Uint8Array.from([1, 2, 3, 4]))).toEqual({
      ok: false,
      error: `invalid_file_type`,
    })
    expect(validateEmojiFile(`image/png`, 4, Uint8Array.from([0xFF, 0xD8, 0xFF, 0xE0]))).toEqual({
      ok: false,
      error: `mime_mismatch`,
    })
  })

  it(`rejects empty and oversized files`, () => {
    expect(validateEmojiFile(`image/png`, 0, new Uint8Array())).toEqual({
      ok: false,
      error: `empty_file`,
    })
    expect(validateEmojiFile(`image/png`, UPLOAD_MAX_BYTES + 1, new Uint8Array())).toEqual({
      ok: false,
      error: `file_too_large`,
    })
  })
})

describe(`emoji name sanitization`, () => {
  it(`removes paths, extensions, control characters, and excess whitespace`, () => {
    expect(sanitizeEmojiName(`folder\\ happy\u0000   face.png`)).toBe(`happy face`)
  })

  it(`rejects empty pack names`, () => {
    expect(sanitizePackName(` \u0000 `)).toBeNull()
  })
})
