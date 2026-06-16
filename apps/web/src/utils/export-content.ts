import { markedAlert, MDKatex } from '@md/core'
import { toPng } from 'html-to-image'
import { Marked } from 'marked'
import { stripUnresolvedAsyncPlaceholders, waitForPreviewReady } from './preview-ready'
import { downloadFile, sanitizeTitle } from './shared-helpers'

/**
 * 导出 / 分享 / 独立预览的 shell 变量。
 * 这些变量原本由 Web App 的全局样式（index.css 的 :root）提供，主题 CSS 通过
 * hsl(var(--foreground)) / var(--blockquote-background) 引用它们。脱离 App 后
 * 需手动补上，否则表格边框、引用块背景等会因变量未定义而失效。
 */
const SHARE_SHELL_VARS_CSS = `:root {
  --foreground: 0 0% 3.9%;
  --blockquote-background: #f7f7f7;
}`

/**
 * 导出原始 Markdown 文档
 * @param {string} doc - 文档内容
 * @param {string} title - 文档标题
 */
export function downloadMD(doc: string, title: string = `untitled`) {
  const safeTitle = sanitizeTitle(title)
  downloadFile(doc, `${safeTitle}.md`, `text/markdown;charset=utf-8`)
}

/**
 * 批量导出多篇文章为 ZIP
 * @param posts - 文章列表（含 title 和 content）
 */
export async function exportPostsAsZip(posts: Array<{ title: string, content: string }>) {
  const JSZip = (await import(`jszip`)).default
  const zip = new JSZip()
  posts.forEach(({ title, content }) => {
    const safeTitle = sanitizeTitle(title)
    zip.file(`${safeTitle}.md`, content)
  })
  const blob = await zip.generateAsync({ type: `blob` })
  const date = new Date().toISOString().slice(0, 10)
  const url = URL.createObjectURL(blob)
  const a = document.createElement(`a`)
  a.href = url
  a.download = `posts-${date}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 获取 HTML 内容
 * @returns {string} HTML 字符串
 */
export function getHtmlContent(): string {
  const element = document.querySelector(`#output`)
  if (!element)
    return ``
  // Clone to avoid mutating the live DOM, then strip injected UI overlays
  // (e.g. diagram download bars) that must not appear in exported content.
  const clone = element.cloneNode(true) as HTMLElement
  clone.querySelectorAll(`.diagram-download-bar`).forEach(el => el.remove())
  return clone.innerHTML
}

/**
 * 导出 HTML 生成内容
 */
export async function exportHTML(title: string = `untitled`) {
  await waitForPreviewReady()
  const htmlStr = getHtmlContent()
  const stylesToAdd = await getStylesToAdd()

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${sanitizeTitle(title)}</title>
  <style>${SHARE_SHELL_VARS_CSS}</style>
  ${stylesToAdd}
</head>
<body>
  <div style="width: 750px; margin: auto; padding: 20px;">
    ${htmlStr}
  </div>
</body>
</html>`

  downloadFile(fullHtml, `${sanitizeTitle(title)}.html`, `text/html`)
}

/**
 * 生成无样式 HTML
 * @param raw - 原始 Markdown 内容
 * @returns string
 */
export async function generatePureHTML(raw: string): Promise<string> {
  const markedInstance = new Marked()
  markedInstance.use(markedAlert({ withoutStyle: true }))
  markedInstance.use(
    MDKatex({ nonStandard: true }, false),
  )
  const pureHtml = await markedInstance.parse(raw)
  return pureHtml
}

/**
 * 导出无样式 HTML 文件
 * @param raw - 原始 Markdown 内容
 * @param title - 文档标题
 */
export async function exportPureHTML(raw: string, title: string = `untitled`) {
  const safeTitle = sanitizeTitle(title)

  const pureHtml = await generatePureHTML(raw)

  downloadFile(pureHtml, `${safeTitle}.html`, `text/html`)
}

/**
 * 导出 PDF 文档（新主题系统）
 * @param {string} title - 文档标题
 */
export async function exportPDF(title: string = `untitled`) {
  await waitForPreviewReady()
  const htmlStr = getHtmlContent()
  const stylesToAdd = await getStylesToAdd()
  const safeTitle = sanitizeTitle(title)

  const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${safeTitle}</title>
  <style>${SHARE_SHELL_VARS_CSS}</style>
  ${stylesToAdd}
  <style>
    /* 强制打印背景颜色和图片 */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    /* 打印页面设置 */
    @page {
      @top-center {
        content: "${safeTitle}";
        font-size: 12px;
        color: #666;
      }
      @bottom-left {
        content: "https://md.doocs.org";
        font-size: 10px;
        color: #999;
      }
      @bottom-right {
        content: "第 " counter(page) " 页，共 " counter(pages) " 页";
        font-size: 10px;
        color: #999;
      }
    }

    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body>
  <div style="width: 100%; max-width: 750px; margin: auto;">
    ${htmlStr}
  </div>
</body>
</html>`
  const iframe = document.createElement(`iframe`)
  iframe.style.cssText = `position:fixed;width:0;height:0;top:-9999px;left:-9999px;border:none;`
  iframe.srcdoc = printHtml
  document.body.appendChild(iframe)

  const removeIframe = () => {
    if (iframe.parentNode) {
      document.body.removeChild(iframe)
    }
  }

  iframe.onload = () => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    // 延迟移除，确保打印完成
    setTimeout(removeIframe, 500)
  }

  iframe.onerror = () => {
    removeIframe()
  }

  // 兜底：如果 onload/onerror 都未触发，5 秒后强制清理
  setTimeout(removeIframe, 5000)
}

const PNG_CAPTURE_STYLES = `
  .diagram-download-bar { display: none !important; }
  .preview pre.code__pre,
  .preview .hljs.code__pre,
  .preview pre.code__pre > code,
  .preview .hljs.code__pre > code,
  .preview .code-scroll,
  .preview pre section,
  .preview code section {
    overflow: visible !important;
  }
  .preview pre.code__pre > code,
  .preview .code-scroll,
  .preview .code-scroll > div {
    white-space: pre-wrap !important;
    word-break: break-all !important;
    min-width: auto !important;
  }
`

const OFFSCREEN_NIGHT_PREVIEW_CSS = `
  .output_night .preview {
    background-color: #191919;
    box-shadow: 0 0 70px rgba(0, 0, 0, 0.3);
  }
`

function delay(ms: number) {
  return new Promise<void>(resolve => window.setTimeout(resolve, ms))
}

function isCapturable(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

/** 将隐藏或折叠的预览区临时移到视口外可见位置，便于 html-to-image 截图 */
function revealPreviewForCapture(target: HTMLElement, fallbackWidth: string): () => void {
  const saved: Array<{ el: HTMLElement, cssText: string }> = []
  let node: HTMLElement | null = target

  while (node && node !== document.body) {
    const rect = node.getBoundingClientRect()
    const computed = getComputedStyle(node)
    const needsFix = computed.display === `none`
      || computed.visibility === `hidden`
      || rect.width === 0

    if (needsFix) {
      saved.push({ el: node, cssText: node.style.cssText })
      node.style.setProperty(`display`, `block`, `important`)
      node.style.setProperty(`visibility`, `visible`, `important`)
      node.style.position = `fixed`
      node.style.left = `-99999px`
      node.style.top = `0`
      node.style.zIndex = `-1`
      node.style.pointerEvents = `none`
      node.style.overflow = `visible`
      node.style.height = `auto`
      node.style.maxHeight = `none`
      node.style.minWidth = `0`
      node.style.flex = `none`
      if (rect.width === 0)
        node.style.width = fallbackWidth
    }

    node = node.parentElement
  }

  if (!isCapturable(target)) {
    saved.push({ el: target, cssText: target.style.cssText })
    target.style.width = fallbackWidth
    target.style.margin = `0`
  }

  return () => {
    for (const { el, cssText } of saved)
      el.style.cssText = cssText
  }
}

/** 预览区未挂载时，克隆 #output 到离屏容器再截图 */
async function createOffScreenPreviewElement(
  previewDevice: `desktop` | `mobile`,
): Promise<{ el: HTMLElement, cleanup: () => void } | null> {
  const output = document.getElementById(`output`)
  if (!output)
    return null

  const outputWrapper = document.getElementById(`output-wrapper`)
  const isNight = outputWrapper?.classList.contains(`output_night`) ?? false
  const width = previewDevice === `mobile` ? `375px` : `750px`
  const stylesToAdd = await getStylesToAdd()

  const host = document.createElement(`div`)
  host.setAttribute(`data-png-export-host`, ``)
  host.style.cssText = `position:fixed;left:-99999px;top:0;z-index:-1;visibility:visible;pointer-events:none;`
  host.innerHTML = [
    `<style>${SHARE_SHELL_VARS_CSS}</style>`,
    `<style>${OFFSCREEN_NIGHT_PREVIEW_CSS}</style>`,
    stylesToAdd,
  ].join(``)

  const wrapper = document.createElement(`div`)
  wrapper.className = isNight ? `output_night` : ``
  wrapper.style.width = width

  const preview = document.createElement(`div`)
  preview.className = `preview border-x shadow-xl mx-auto`
  preview.style.width = width
  preview.style.margin = `0`

  const content = output.cloneNode(true) as HTMLElement
  content.removeAttribute(`id`)
  content.style.width = `100%`
  content.querySelectorAll(`.diagram-download-bar`).forEach(el => el.remove())
  stripUnresolvedAsyncPlaceholders(content)

  preview.appendChild(content)
  wrapper.appendChild(preview)
  host.appendChild(wrapper)
  document.body.appendChild(host)

  return {
    el: preview,
    cleanup: () => host.remove(),
  }
}

/**
 * 导出 PNG 卡片图片
 * 预览区关闭时通过离屏渲染截图，避免 html-to-image 对 display:none 元素截出空白图
 */
export async function exportPNG(
  title: string = `untitled`,
  options: { isDark: boolean, previewDevice: `desktop` | `mobile` },
) {
  await waitForPreviewReady()

  const fallbackWidth = options.previewDevice === `mobile` ? `375px` : `750px`
  const livePreview = document.querySelector<HTMLElement>(`#output-wrapper>.preview`)

  let captureEl: HTMLElement | null = livePreview
  let restoreVisibility: (() => void) | null = null
  let cleanupOffScreen: (() => void) | null = null

  if (captureEl && !isCapturable(captureEl)) {
    restoreVisibility = revealPreviewForCapture(captureEl, fallbackWidth)
    await delay(100)
  }

  if (!captureEl || !isCapturable(captureEl)) {
    restoreVisibility?.()
    restoreVisibility = null

    const offScreen = await createOffScreenPreviewElement(options.previewDevice)
    if (!offScreen)
      return

    captureEl = offScreen.el
    cleanupOffScreen = offScreen.cleanup
    await delay(100)
  }

  const style = document.createElement(`style`)
  style.textContent = PNG_CAPTURE_STYLES
  document.head.appendChild(style)

  try {
    await delay(100)
    const url = await toPng(captureEl, {
      backgroundColor: options.isDark ? `` : `#fff`,
      skipFonts: true,
      pixelRatio: Math.max(window.devicePixelRatio || 1, 2),
      style: { margin: `0` },
    })
    downloadFile(url, `${sanitizeTitle(title)}.png`, `image/png`)
  }
  finally {
    style.remove()
    restoreVisibility?.()
    cleanupOffScreen?.()
  }
}

export function solveWeChatImage(container?: HTMLElement) {
  const clipboardDiv = container ?? document.getElementById(`output`)
  if (!clipboardDiv)
    return
  const images = clipboardDiv.getElementsByTagName(`img`)

  Array.from(images).forEach((image) => {
    const width = image.getAttribute(`width`)
    const height = image.getAttribute(`height`)

    if (width) {
      image.removeAttribute(`width`)
      // 如果是纯数字，添加 px 单位；否则保持原值
      image.style.width = /^\d+$/.test(width) ? `${width}px` : width
    }

    if (height) {
      image.removeAttribute(`height`)
      // 如果是纯数字，添加 px 单位；否则保持原值
      image.style.height = /^\d+$/.test(height) ? `${height}px` : height
    }
  })
}

async function getHljsStyles(): Promise<string> {
  const hljsLink = document.querySelector(`#hljs`) as HTMLLinkElement
  if (!hljsLink)
    return ``

  try {
    const response = await fetch(hljsLink.href)
    const cssText = await response.text()
    return `<style>${cssText}</style>`
  }
  catch (error) {
    console.warn(`Failed to fetch highlight.js styles:`, error)
    return ``
  }
}

function scopeThemeCss(cssContent: string, scope: string): string {
  let css = cssContent
  css = css.replace(/#output\s*\{/g, `${scope} {`)
  css = css.replace(/#output\s+/g, `${scope} `)
  css = css.replace(/^#output\s*/gm, `${scope} `)
  return css
}

/** 复制/导出：剥离 #output 前缀，使 juice 能匹配片段内元素（无 body/#output 祖先） */
function stripOutputScope(cssContent: string): string {
  let css = cssContent
  css = css.replace(/#output\s*\{/g, `body {`)
  css = css.replace(/#output\s+/g, ``)
  css = css.replace(/^#output\s*/gm, ``)
  return css
}

function getThemeStyles(): string {
  const themeStyle = document.querySelector(`#md-theme`) as HTMLStyleElement

  if (!themeStyle || !themeStyle.textContent) {
    console.warn('[getThemeStyles] 未找到主题样式')
    return ``
  }

  // 移除 #output 作用域前缀，因为复制后的 HTML 不在 #output 容器中
  const cssContent = stripOutputScope(themeStyle.textContent)

  const styleContent = `<style>${cssContent}</style>`
  return styleContent
}

/** 分享页专用样式（固定浅色，作用域到 .share-content） */
export async function getShareExportStyles(): Promise<string> {
  const themeStyle = document.querySelector(`#md-theme`) as HTMLStyleElement
  if (!themeStyle?.textContent) {
    console.warn('[getShareExportStyles] 未找到主题样式')
    return ``
  }

  const parts: string[] = [
    `<style>${SHARE_SHELL_VARS_CSS}</style>`,
    `<style>${scopeThemeCss(themeStyle.textContent, `.share-content`)}</style>`,
  ]

  const hljsStyles = await getHljsStyles()
  if (hljsStyles)
    parts.push(hljsStyles)

  return parts.join(``)
}

async function mergeCss(html: string): Promise<string> {
  const { default: juice } = await import(`juice`)
  return juice(html, {
    inlinePseudoElements: true,
    preserveImportant: true,
    // 禁用 CSS 变量解析，避免 juice 处理时的错误
    // 新主题系统已通过 postcss 处理 CSS 变量
    resolveCSSVariables: false,
  })
}

function modifyHtmlStructure(htmlString: string): string {
  const tempDiv = document.createElement(`div`)
  tempDiv.innerHTML = htmlString

  // 移动 `li > ul` 和 `li > ol` 到 `li` 后面
  tempDiv.querySelectorAll(`li > ul, li > ol`).forEach((originalItem) => {
    originalItem.parentElement?.insertAdjacentElement(`afterend`, originalItem)
  })

  return tempDiv.innerHTML
}

function createEmptyNode(): HTMLElement {
  const node = document.createElement(`p`)
  node.style.fontSize = `0`
  node.style.lineHeight = `0`
  node.style.margin = `0`
  node.innerHTML = `&nbsp;`
  return node
}

/**
 * 获取需要添加的样式（导出 / 分享页使用）
 */
export async function getExportStyles(): Promise<string> {
  return getStylesToAdd()
}

/**
 * 获取需要添加的样式
 * @returns {Promise<string>} 样式字符串
 */
async function getStylesToAdd(): Promise<string> {
  const themeStyles = getThemeStyles()
  const hljsStyles = await getHljsStyles()
  return [themeStyles, hljsStyles].filter(Boolean).join(``)
}

export async function processClipboardContent(primaryColor: string) {
  const outputElement = document.getElementById(`output`)
  if (!outputElement) {
    return {
      html: ``,
      plainText: ``,
      hasPendingAsyncContent: false,
    }
  }

  const previewReady = await waitForPreviewReady()

  const clipboardDiv = outputElement.cloneNode(true) as HTMLElement
  stripUnresolvedAsyncPlaceholders(clipboardDiv)

  const stylesToAdd = await getStylesToAdd()

  if (stylesToAdd) {
    clipboardDiv.innerHTML = stylesToAdd + clipboardDiv.innerHTML
  }

  // 先合并 CSS 和修改 HTML 结构
  clipboardDiv.innerHTML = modifyHtmlStructure(await mergeCss(clipboardDiv.innerHTML))

  // 移除 fragment 锚点的 href（微信公众号后台不支持页面内跳转，保留会导致保存报错）
  clipboardDiv.querySelectorAll(`a[href^="#"]`).forEach(a => a.removeAttribute(`href`))

  // 处理样式和颜色变量
  clipboardDiv.innerHTML = clipboardDiv.innerHTML
    .replace(/([^-])top:(.*?)em/g, `$1transform: translateY($2em)`)
    .replace(/hsl\(var\(--foreground\)\)/g, `#3f3f3f`)
    .replace(/var\(--blockquote-background\)/g, `#f7f7f7`)
    .replace(/var\(--md-primary-color\)/g, primaryColor)
    .replace(/--md-primary-color:.+?;/g, ``)
    .replace(/--md-font-family:.+?;/g, ``)
    .replace(/--md-font-size:.+?;/g, ``)
    .replace(
      /<span class="nodeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,
      `<span class="nodeLabel"$1>$2</span>`,
    )
    .replace(
      /<span class="edgeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,
      `<span class="edgeLabel"$1>$2</span>`,
    )

  // 处理图片大小
  solveWeChatImage(clipboardDiv)

  // 添加空白节点用于兼容 SVG 复制
  const beforeNode = createEmptyNode()
  const afterNode = createEmptyNode()
  clipboardDiv.insertBefore(beforeNode, clipboardDiv.firstChild)
  clipboardDiv.appendChild(afterNode)

  // 兼容 Mermaid
  const nodes = clipboardDiv.querySelectorAll(`.nodeLabel`)
  nodes.forEach((node) => {
    const parent = node.parentElement
    if (!parent)
      return
    const xmlns = parent.getAttribute(`xmlns`)
    const style = parent.getAttribute(`style`)
    if (!xmlns || !style)
      return
    const section = document.createElement(`section`)
    section.setAttribute(`xmlns`, xmlns)
    section.setAttribute(`style`, style)
    section.innerHTML = parent.innerHTML

    const grand = parent.parentElement
    if (!grand)
      return
    // 清空父元素
    grand.innerHTML = ``
    grand.appendChild(section)
  })

  // fix: mermaid 部分文本颜色被 stroke 覆盖
  clipboardDiv.innerHTML = clipboardDiv.innerHTML
    .replace(
      /<tspan([^>]*)>/g,
      `<tspan$1 style="fill: #333333 !important; color: #333333 !important; stroke: none !important;">`,
    )

  // fix: antv infographic 复制到微信公众平台时 <text></text> 被自动转为 <text><tspan></tspan></text> 导致在 Safari 浏览器中文字异常的问题
  clipboardDiv.querySelectorAll('.infographic-diagram').forEach((diagram) => {
    diagram.querySelectorAll('text').forEach((textElem) => {
      // 如果有 dominant-baseline 属性，替换为 dy
      const dominantBaseline = textElem.getAttribute('dominant-baseline')
      const variantMap = {
        'alphabetic': '',
        'central': '0.35em',
        'middle': '0.35em',
        'hanging': '-0.55em',
        'ideographic': '0.18em',
        'text-before-edge': '-0.85em',
        'text-after-edge': '0.15em',
      }
      if (dominantBaseline) {
        textElem.removeAttribute('dominant-baseline')
        const dy = variantMap[dominantBaseline as keyof typeof variantMap]
        if (dy) {
          textElem.setAttribute('dy', dy)
        }
      }
    })
  })

  return {
    html: clipboardDiv.innerHTML,
    plainText: clipboardDiv.textContent || ``,
    hasPendingAsyncContent: !previewReady,
  }
}
