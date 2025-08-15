import type { PropertiesHyphen } from 'csstype'
import type { Block, Inline } from '../types'

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

/**
 * 将 CSS 字符串转换为 JSON 对象
 *
 * @param {string} css - CSS 字符串
 * @returns {object} - JSON 格式的 CSS
 */
export function css2json(css: string): Partial<Record<Block | Inline, PropertiesHyphen>> {
  // 去除所有 CSS 注释
  css = css.replace(/\/\*[\s\S]*?\*\//g, ``)

  const json: Partial<Record<Block | Inline, PropertiesHyphen>> = {}

  // 辅助函数：将声明数组转换为对象
  const toObject = (array: any[]) =>
    array.reduce<{ [k: string]: string }>((obj, item) => {
      const [property, ...value] = item.split(`:`).map((part: string) => part.trim())
      if (property)
        obj[property] = value.join(`:`)
      return obj
    }, {})

  while (css.includes(`{`) && css.includes(`}`)) {
    const lbracket = css.indexOf(`{`)
    const rbracket = css.indexOf(`}`)

    // 获取声明块并转换为对象
    const declarations = css.substring(lbracket + 1, rbracket)
      .split(`;`)
      .map(e => e.trim())
      .filter(Boolean)

    // 获取选择器并去除空格
    const selectors = css.substring(0, lbracket)
      .split(`,`)
      .map(selector => selector.trim()) as (Block | Inline)[]

    const declarationObj = toObject(declarations)

    // 将声明对象关联到相应的选择器
    selectors.forEach((selector) => {
      json[selector] = { ...(json[selector] || {}), ...declarationObj }
    })

    // 处理下一个声明块
    css = css.slice(rbracket + 1).trim()
  }

  return json
}
