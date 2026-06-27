import { stripUnresolvedAsyncPlaceholders, waitForPreviewReady } from '@/lib/preview/preview-ready'
import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'
import { getStylesToAdd } from './share-styles'
import { prepareMathFormulasForWeChat, sanitizeSvgsForWeChat } from './wechat-svg'

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
      image.style.width = /^\d+$/.test(width) ? `${width}px` : width
    }

    if (height) {
      image.removeAttribute(`height`)
      image.style.height = /^\d+$/.test(height) ? `${height}px` : height
    }
  })
}

async function mergeCss(html: string): Promise<string> {
  const { default: juice } = await import(`juice`)
  return juice(html, {
    inlinePseudoElements: true,
    preserveImportant: true,
    resolveCSSVariables: false,
  })
}

function modifyHtmlStructure(htmlString: string): string {
  const tempDiv = document.createElement(`div`)
  tempDiv.innerHTML = htmlString

  tempDiv.querySelectorAll(`li > ul, li > ol`).forEach((originalItem) => {
    originalItem.parentElement?.insertAdjacentElement(`afterend`, originalItem)
  })

  return tempDiv.innerHTML
}

/**
 * 公众号不支持 ::after / ::before / ::first-letter 伪元素。
 * 一次 DOM 解析，把所有伪元素转成真正的 HTML 元素。
 */
function processPseudoElementsForWeChat(html: string): string {
  const tempDiv = document.createElement(`div`)
  tempDiv.innerHTML = html

  // 1. hr::after { content: '■ ■ ■' } → 在 hr 后插入 span
  const hrAfterMatch = html.match(/hr::after\s*\{([^}]+)\}/)
  if (hrAfterMatch) {
    const styles = hrAfterMatch[1]
    const contentMatch = styles.match(/content:\s*['"](.+?)['"]/)
    if (contentMatch) {
      const text = contentMatch[1].replace(/\\([0-9a-f]{2,6})/gi, (_, h) => String.fromCodePoint(Number.parseInt(h, 16)))
      const ls = styles.match(/letter-spacing:\s*([^;]+)/)?.[1]?.trim() ?? `0.5em`
      const fs = styles.match(/font-size:\s*([^;]+)/)?.[1]?.trim() ?? `0.6em`
      tempDiv.querySelectorAll(`hr`).forEach((hr) => {
        hr.style.border = `none`
        hr.style.textAlign = `center`
        hr.style.margin = `2.5em 8px`
        const span = document.createElement(`span`)
        span.textContent = text
        span.style.letterSpacing = ls
        span.style.fontSize = fs
        hr.parentElement?.insertBefore(span, hr.nextSibling)
      })
    }
  }

  // 2. h1::after { 下划线 } → 在 h1 后插入 div
  const h1AfterMatch = html.match(/h1::after\s*\{([^}]+)\}/)
  if (h1AfterMatch) {
    const s = h1AfterMatch[1]
    const w = s.match(/width:\s*([^;]+)/)?.[1]?.trim() ?? `60%`
    const h = s.match(/height:\s*([^;]+)/)?.[1]?.trim() ?? `3px`
    tempDiv.querySelectorAll(`h1`).forEach((h1) => {
      const line = document.createElement(`div`)
      line.style.width = w
      line.style.height = h
      line.style.background = `#3f3f3f`
      line.style.margin = `0 auto`
      h1.parentElement?.insertBefore(line, h1.nextSibling)
    })
  }

  // 3. ::first-letter → span 包裹首字
  const ruleRegex = /([^{}]+?)::first-letter\s*\{([^}]+)\}/g
  const firstLetterRules: { sel: string, styles: string }[] = []
  let m = ruleRegex.exec(html)
  while (m) {
    for (const s of m[1].split(`,`)) {
      firstLetterRules.push({ sel: s.trim().replace(/^body\s+/i, ``), styles: m[2].trim().replace(/;?\s*$/, ``) })
    }
    m = ruleRegex.exec(html)
  }
  const resolveColor = (s: string) => s.replace(/hsl\(var\(--foreground\)\)/g, `#3f3f3f`)
  const flStyle = resolveColor(firstLetterRules[0]?.styles ?? ``)
  const matchedPs = new Set<Element>()
  for (const { sel, styles } of firstLetterRules) {
    const prevSel = sel.replace(/\s*\+\s*p\s*$/, ``)
    if (!prevSel)
      continue
    for (const prevEl of tempDiv.querySelectorAll(prevSel)) {
      const nextP = prevEl.nextElementSibling
      if (!nextP || nextP.tagName !== `P`)
        continue
      matchedPs.add(nextP)
      const tn = Array.from(nextP.childNodes).find(n => n.nodeType === 3 && (n.textContent ?? ``).trim())
      if (!tn)
        continue
      const txt = tn.textContent ?? ``
      const span = document.createElement(`span`)
      span.textContent = txt[0]
      span.setAttribute(`style`, resolveColor(styles))
      nextP.insertBefore(span, tn)
      tn.textContent = txt.slice(1)
    }
  }
  // h1 在公众号变成原生标题，h1+p 失效，对第一个 <p> 补首字
  const firstP = tempDiv.querySelector(`p`)
  if (firstP && !matchedPs.has(firstP) && flStyle) {
    const tn = Array.from(firstP.childNodes).find(n => n.nodeType === 3 && (n.textContent ?? ``).trim())
    if (tn) {
      const txt = tn.textContent ?? ``
      const span = document.createElement(`span`)
      span.textContent = txt[0]
      span.setAttribute(`style`, flStyle)
      firstP.insertBefore(span, tn)
      tn.textContent = txt.slice(1)
    }
  }

  // 4. 清理所有伪元素 CSS 规则
  let result = tempDiv.innerHTML
  result = result.replace(/[^{}]+?::(after|before|first-letter)\s*\{[^}]+\}\s*/g, ``)
  return result
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
 * Prepare clipboard HTML for WeChat.
 * Diagrams are always exported in light theme (WeChat does not remap SVG colors;
 * dual-theme @media/class wrappers violate WeChat SVG constraints).
 */
export async function processClipboardContent(primaryColor: string) {
  const outputElement = document.getElementById(`output`)
  if (!outputElement) {
    return {
      html: ``,
      plainText: ``,
      hasPendingAsyncContent: false,
    }
  }

  const renderStore = useRenderStore()
  const editorStore = useEditorStore()
  const uiStore = useUIStore()
  const content = editorStore.getContent()
  const wechatThemeMode = `light` as const
  const rerenderForLight = uiStore.isDark

  if (rerenderForLight)
    renderStore.render(content, { themeMode: wechatThemeMode })

  const previewReady = await waitForPreviewReady(undefined, { themeMode: wechatThemeMode })

  try {
    const clipboardDiv = outputElement.cloneNode(true) as HTMLElement
    // 背景色/图案在父元素 .preview 上，复制到剪贴板内容
    const previewParent = outputElement.closest(`.preview`) as HTMLElement | null
    if (previewParent) {
      const bg = previewParent.style.backgroundColor
      const bgImage = previewParent.style.backgroundImage
      const bgSize = previewParent.style.backgroundSize
      if (bg && bg !== `transparent`)
        clipboardDiv.style.backgroundColor = bg
      if (bgImage && bgImage !== `none`) {
        clipboardDiv.style.backgroundImage = bgImage
        clipboardDiv.style.backgroundSize = bgSize || `20px 20px`
      }
    }
    stripUnresolvedAsyncPlaceholders(clipboardDiv)
    const stylesToAdd = await getStylesToAdd()

    if (stylesToAdd) {
      clipboardDiv.innerHTML = stylesToAdd + clipboardDiv.innerHTML
    }

    // 公众号不支持伪元素，一次处理 ::after / ::before / ::first-letter
    clipboardDiv.innerHTML = processPseudoElementsForWeChat(clipboardDiv.innerHTML)

    clipboardDiv.innerHTML = modifyHtmlStructure(await mergeCss(clipboardDiv.innerHTML))

    // 公众号对 ul/ol/li 渲染有问题（重复圆点、序号全变成1），转成纯文本段落
    // 先禁用 CSS 圆点，防止转换后双重标记
    clipboardDiv.querySelectorAll(`ul, ol`).forEach((el) => { el.style.listStyle = `none` })
    // 从内向外处理，避免浏览器自动修正 DOM 结构
    let lis = clipboardDiv.querySelectorAll(`li`)
    while (lis.length) {
      const deepest = Array.from(lis).filter(li => !li.querySelector(`li`))
      if (!deepest.length)
        break
      for (const li of deepest) {
        const parent = li.parentElement
        const isOrdered = parent?.tagName === `OL`
        const nestedLists: Element[] = []
        li.querySelectorAll(`:scope > ul, :scope > ol`).forEach(l => nestedLists.push(l))
        nestedLists.forEach(l => li.removeChild(l))
        const p = document.createElement(`p`)
        p.innerHTML = li.innerHTML
        const liStyle = li.getAttribute(`style`)
        if (liStyle)
          p.setAttribute(`style`, liStyle)
        // 去掉已有 bullet/number 前缀（防止双重）
        if (isOrdered) {
          // 快照 siblings，避免 live 集合变化导致 index 错误
          const siblings = parent ? Array.from(parent.children).filter(c => c.tagName === `LI`) : []
          const idx = siblings.indexOf(li) + 1
          // 去掉已有数字前缀（第一个文本节点）
          const firstTn = Array.from(p.childNodes).find(n => n.nodeType === 3)
          if (firstTn)
            firstTn.textContent = (firstTn.textContent ?? ``).replace(/^\d+\.\s*/, ``)
          p.innerHTML = `${idx}. ${p.innerHTML}`
        }
        else {
          // 去掉已有 bullet 前缀（第一个文本节点）
          const firstTn = Array.from(p.childNodes).find(n => n.nodeType === 3)
          if (firstTn)
            firstTn.textContent = (firstTn.textContent ?? ``).replace(/^[•·\-*]\s*/, ``)
          p.innerHTML = `• ${p.innerHTML}`
        }
        parent?.insertBefore(p, li)
        li.remove()
        nestedLists.forEach(l => p.parentElement?.insertBefore(l, p.nextSibling))
      }
      lis = clipboardDiv.querySelectorAll(`li`)
    }
    // 移除空的 ul/ol 容器（先解包子节点再删）
    clipboardDiv.querySelectorAll(`ul, ol`).forEach((list) => {
      if (!list.querySelector(`li`)) {
        const listParent = list.parentElement
        if (listParent) {
          while (list.firstChild) listParent.insertBefore(list.firstChild, list)
          listParent.removeChild(list)
        }
      }
    })

    // 清除 juice 给 li 内联的 list-style（转成 p 后仍会被渲染）
    clipboardDiv.querySelectorAll(`p[style]`).forEach((p) => {
      const style = p.getAttribute(`style`) ?? ``
      if (style.includes(`list-style`)) {
        p.setAttribute(`style`, style.replace(/list-style[^;]*;?\s*/g, ``))
      }
    })

    // h1 inline-block + margin:auto 在公众号不居中，改成 block + fit-content
    clipboardDiv.querySelectorAll(`h1`).forEach((h1) => {
      const style = h1.getAttribute(`style`) ?? ``
      if (style.includes(`display: inline-block`) || style.includes(`display:inline-block`)) {
        const newStyle = style
          .replace(/display:\s*inline-block\s*;?/g, `display: block; width: fit-content; margin-left: auto; margin-right: auto;`)
        h1.setAttribute(`style`, newStyle)
      }
    })

    clipboardDiv.querySelectorAll(`a[href^="#"]`).forEach(a => a.removeAttribute(`href`))

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

    solveWeChatImage(clipboardDiv)

    const beforeNode = createEmptyNode()
    const afterNode = createEmptyNode()
    clipboardDiv.insertBefore(beforeNode, clipboardDiv.firstChild)
    clipboardDiv.appendChild(afterNode)

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
      grand.innerHTML = ``
      grand.appendChild(section)
    })

    clipboardDiv.innerHTML = clipboardDiv.innerHTML
      .replace(
        /<tspan([^>]*)>/g,
        `<tspan$1 style="fill: #333333 !important; color: #333333 !important; stroke: none !important;">`,
      )

    clipboardDiv.querySelectorAll(`.infographic-diagram`).forEach((diagram) => {
      diagram.querySelectorAll(`text`).forEach((textElem) => {
        const dominantBaseline = textElem.getAttribute(`dominant-baseline`)
        const variantMap = {
          'alphabetic': ``,
          'central': `0.35em`,
          'middle': `0.35em`,
          'hanging': `-0.55em`,
          'ideographic': `0.18em`,
          'text-before-edge': `-0.85em`,
          'text-after-edge': `0.15em`,
        }
        if (dominantBaseline) {
          textElem.removeAttribute(`dominant-baseline`)
          const dy = variantMap[dominantBaseline as keyof typeof variantMap]
          if (dy)
            textElem.setAttribute(`dy`, dy)
        }
      })
    })

    sanitizeSvgsForWeChat(clipboardDiv)
    prepareMathFormulasForWeChat(clipboardDiv)

    // 背景色/图案设在 clipboardDiv.style 上，innerHTML 会丢失。
    // 用 section 包裹，把背景样式带进去，清除边距铺满。
    const bgParts = [
      clipboardDiv.style.backgroundColor && `background-color: ${clipboardDiv.style.backgroundColor}`,
      clipboardDiv.style.backgroundImage && `background-image: ${clipboardDiv.style.backgroundImage}`,
      clipboardDiv.style.backgroundSize && `background-size: ${clipboardDiv.style.backgroundSize}`,
    ].filter(Boolean)
    let finalHtml = clipboardDiv.innerHTML
    if (bgParts.length) {
      finalHtml = `<section style="${bgParts.join(`; `)}; margin: 0; padding: 0; box-sizing: border-box;">${finalHtml}</section>`
    }

    return {
      html: finalHtml,
      plainText: clipboardDiv.textContent || ``,
      hasPendingAsyncContent: !previewReady,
    }
  }
  finally {
    if (rerenderForLight)
      renderStore.render(content, { themeMode: `dark` })
  }
}
