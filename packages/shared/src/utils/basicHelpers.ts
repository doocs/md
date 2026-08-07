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
