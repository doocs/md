/** Sanitize a title for use as a filename (strip illegal characters). */
export function sanitizeTitle(title: string) {
  const MAX_FILENAME_LENGTH = 100

  // Windows-forbidden chars; superset of illegal chars on other platforms
  const INVALID_CHARS = /[\\/:*?"<>|]/g

  if (!INVALID_CHARS.test(title) && title.length <= MAX_FILENAME_LENGTH) {
    return title.trim() || `untitled`
  }

  const replaced = title.replace(INVALID_CHARS, `_`).trim()
  const safe = replaced.length > MAX_FILENAME_LENGTH
    ? replaced.slice(0, MAX_FILENAME_LENGTH)
    : replaced

  return safe || `untitled`
}

/** Remove common leading indentation from every line. */
export function removeLeft(str: string) {
  const lines = str.split(`\n`)
  const minSpaceNum = lines
    .filter(item => item.trim())
    .map(item => (item.match(/(^\s+)?/)!)[0].length)
    .sort((a, b) => a - b)[0]
  return lines.map(item => item.slice(minSpaceNum)).join(`\n`)
}

/** Validate image file type and size for WeChat upload limits. */
export function checkImage(file: File) {
  const isValidSuffix = /\.(?:gif|pjp|jfif|jpe|pjpeg|jpe?g|png|webp)$/i.test(file.name)
  if (!isValidSuffix) {
    return {
      ok: false,
      msg: `请上传 GIF/JPG/JPEG/PNG/WEBP 格式的图片`,
    }
  }

  const maxSizeMB = 10
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      ok: false,
      msg: `由于公众号限制，图片大小不能超过 ${maxSizeMB}M`,
    }
  }

  return { ok: true, msg: `` }
}
