// @ts-expect-error - prettier v2.8.8 doesn't have proper TypeScript declarations
import parserBabel from 'prettier/parser-babel'
// @ts-expect-error - prettier v2.8.8 doesn't have proper TypeScript declarations
import parserMarkdown from 'prettier/parser-markdown'
// @ts-expect-error - prettier v2.8.8 doesn't have proper TypeScript declarations
import parserPostcss from 'prettier/parser-postcss'
// @ts-expect-error - prettier v2.8.8 doesn't have proper TypeScript declarations
import * as prettier from 'prettier/standalone'

/**
 * 通用文件下载函数
 * @param content - 文件内容
 * @param filename - 文件名
 * @param mimeType - MIME 类型，默认为 text/plain
 */
export function downloadFile(content: string, filename: string, mimeType: string = `text/plain`) {
  if (typeof document === `undefined`) {
    throw new TypeError(`downloadFile can only be used in browser environment`)
  }

  const downLink = document.createElement(`a`)
  downLink.download = filename
  downLink.style.display = `none`

  // 检查是否是 base64 data URL
  if (content.startsWith(`data:`)) {
    downLink.href = content
  }
  else if (mimeType === `text/html`) {
    downLink.href = `data:text/html;charset=utf-8,${encodeURIComponent(content)}`
  }
  else {
    const blob = new Blob([content], { type: mimeType })
    downLink.href = URL.createObjectURL(blob)
  }

  document.body.appendChild(downLink)
  downLink.click()
  document.body.removeChild(downLink)

  // 如果是 blob URL，释放内存
  if (!content.startsWith(`data:`) && mimeType !== `text/html`) {
    URL.revokeObjectURL(downLink.href)
  }
}

/**
 * 将文件转换为 Base64 格式
 * @param file - 要转换的文件
 * @returns Base64 字符串的 Promise
 */
export function toBase64(file: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve((reader.result as string).split(`,`).pop()!)
    reader.onerror = error => reject(error)
  })
}

/**
 * 根据数据生成 Markdown 表格
 * @param options - 表格选项
 * @param options.data - 表格数据对象
 * @param options.rows - 表格行数
 * @param options.cols - 表格列数
 * @returns 生成的 Markdown 表格字符串
 */
export function createTable({ data, rows, cols }: {
  data: { [k: string]: string }
  rows: number
  cols: number
}): string {
  let table = ``
  for (let i = 0; i < rows + 2; ++i) {
    table += `| `
    const currRow = []
    for (let j = 0; j < cols; ++j) {
      const rowIdx = i > 1 ? i - 1 : i
      currRow.push(i === 1 ? `---` : data[`k_${rowIdx}_${j}`] || `     `)
    }
    table += currRow.join(` | `)
    table += ` |\n`
  }

  return table
}

/**
 * 格式化文档内容
 * @param content - 要格式化的内容
 * @param type - 内容类型，决定使用的解析器，默认为 'markdown'
 * @returns 格式化后的内容
 */
export async function formatDoc(content: string, type: `markdown` | `css` | `javascript` = `markdown`): Promise<string> {
  const parser = type === `css` ? `css` : type === `javascript` ? `babel` : `markdown`
  const plugins = type === `css` ? [parserPostcss] : type === `javascript` ? [parserBabel] : [parserMarkdown, parserBabel]

  return await prettier.format(content, {
    parser,
    plugins,
    // prettier v2.8.8 配置选项
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: false,
    singleQuote: true,
    quoteProps: `as-needed`,
    trailingComma: `es5`,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: `avoid`,
    proseWrap: `preserve`,
    htmlWhitespaceSensitivity: `css`,
    endOfLine: `lf`,
  })
}
