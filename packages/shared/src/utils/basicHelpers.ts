/**
 * 清理文件标题，移除非法字符
 * @param title - 原始标题
 * @returns 清理后的安全标题
 */
export function sanitizeTitle(title: string) {
  const MAX_FILENAME_LENGTH = 100

  // Windows 禁止字符，包含所有平台非法字符合集
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

/**
 * 移除左边多余空格
 * @param str - 要处理的字符串
 * @returns 处理后的字符串
 */
export function removeLeft(str: string) {
  const lines = str.split(`\n`)
  // 获取应该删除的空白符数量
  const minSpaceNum = lines
    .filter(item => item.trim())
    .map(item => (item.match(/(^\s+)?/)!)[0].length)
    .sort((a, b) => a - b)[0]
  // 删除空白符
  return lines.map(item => item.slice(minSpaceNum)).join(`\n`)
}

/**
 * 检查图片文件是否符合要求
 * @param file - 要检查的文件
 * @returns 检查结果
 */
export function checkImage(file: File) {
  // 检查文件名后缀
  const isValidSuffix = /\.(?:gif|jpe?g|png)$/i.test(file.name)
  if (!isValidSuffix) {
    return {
      ok: false,
      msg: `请上传 JPG/PNG/GIF 格式的图片`,
    }
  }

  // 检查文件大小
  const maxSizeMB = 10
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      ok: false,
      msg: `由于公众号限制，图片大小不能超过 ${maxSizeMB}M`,
    }
  }

  return { ok: true, msg: `` }
}
