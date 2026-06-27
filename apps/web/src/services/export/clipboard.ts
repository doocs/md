import { stripUnresolvedAsyncPlaceholders, waitForPreviewReady } from '@/lib/preview/preview-ready'
import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'
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
export async function processClipboardContent(_primaryColor: string) {
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
    // 背景色/图案在父元素 .preview 上
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

    // 核心：从预览 DOM 的 computedStyle 提取关键属性，直接内联
    // 不依赖 juice，保证样式 1:1 还原
    const STYLE_PROPS = [
      `color`,
      `background-color`,
      `background-image`,
      `background-size`,
      `font-size`,
      `font-weight`,
      `font-style`,
      `font-family`,
      `line-height`,
      `letter-spacing`,
      `text-align`,
      `text-decoration`,
      `text-indent`,
      `vertical-align`,
      `white-space`,
      `word-break`,
      `border`,
      `border-left`,
      `border-right`,
      `border-top`,
      `border-bottom`,
      `border-collapse`,
      `border-spacing`,
      `padding`,
      `padding-left`,
      `padding-right`,
      `padding-top`,
      `padding-bottom`,
      `margin`,
      `margin-left`,
      `margin-right`,
      `margin-top`,
      `margin-bottom`,
      `display`,
      `float`,
      `clear`,
      `list-style`,
      `list-style-type`,
      `list-style-position`,
    ] as const

    function inlineComputedStyles(live: Element, cloned: Element) {
      const computed = window.getComputedStyle(live)
      const el = cloned as HTMLElement
      for (const prop of STYLE_PROPS) {
        const val = computed.getPropertyValue(prop)
        if (val && val !== `initial` && val !== `normal`) {
          if (prop === `display` && (val === `flex` || val === `grid` || val === `contents`))
            continue
          el.style.setProperty(prop, val)
        }
      }
    }

    // 遍历克隆 DOM，与预览 DOM 一一对应提取样式
    const liveElements = outputElement.querySelectorAll(`*`)
    const clonedElements = clipboardDiv.querySelectorAll(`*`)
    for (let i = 0; i < liveElements.length && i < clonedElements.length; i++) {
      inlineComputedStyles(liveElements[i], clonedElements[i])
    }

    const liPositions = new Map<Element, number>()
    for (const ol of clipboardDiv.querySelectorAll(`ol`)) {
      let idx = 1
      for (const child of ol.children) {
        if (child.tagName === `LI`)
          liPositions.set(child, idx++)
      }
    }
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
        p.setAttribute(`data-from-list`, `true`)
        p.innerHTML = li.innerHTML
        // 从 li 复制 computed style（含 font/color/line-height 等）
        const liStyle = li.getAttribute(`style`)
        if (liStyle) {
          const cleaned = liStyle
            .replace(/padding-left[^;]*;?\s*/g, ``)
            .replace(/list-style[^;]*;?\s*/g, ``)
          if (cleaned)
            p.setAttribute(`style`, cleaned)
        }
        // 用全角空格做缩进（CSS padding-left 公众号会吃掉）
        let depth = 0
        let cur: Element | null = li.parentElement
        while (cur) {
          if (cur.tagName === `OL` || cur.tagName === `UL`)
            depth++
          cur = cur.parentElement
        }
        // 去掉已有 bullet/number 前缀（防止双重）
        const firstTn = Array.from(p.childNodes).find(n => n.nodeType === 3)
        if (isOrdered) {
          const idx = liPositions.get(li) ?? 1
          if (firstTn)
            firstTn.textContent = (firstTn.textContent ?? ``).replace(/^\d+\.\s*/, ``)
          const indent = depth > 1 ? `\u3000\u3000`.repeat(depth - 1) : ``
          p.innerHTML = `${indent}${idx}. ${p.innerHTML}`
        }
        else {
          if (firstTn)
            firstTn.textContent = (firstTn.textContent ?? ``).replace(/^[•·\-*]\s*/, ``)
          const indent = depth > 1 ? `\u3000\u3000`.repeat(depth - 1) : ``
          p.innerHTML = `${indent}• ${p.innerHTML}`
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
    // 清除列表转换来的段落的 margin
    clipboardDiv.querySelectorAll(`p[data-from-list]`).forEach((p) => {
      p.removeAttribute(`data-from-list`)
      p.style.marginTop = `0`
      p.style.marginBottom = `0`
    })

    // 公众号 blockquote 超 300 字报错，转成 section（computed style 已内联）
    clipboardDiv.querySelectorAll(`blockquote`).forEach((bq) => {
      const section = document.createElement(`section`)
      for (const attr of bq.attributes) {
        section.setAttribute(attr.name, attr.value)
      }
      section.innerHTML = bq.innerHTML
      bq.parentElement?.replaceChild(section, bq)
    })

    // h1 inline-block + margin:auto 在公众号不居中
    clipboardDiv.querySelectorAll(`h1`).forEach((h1) => {
      const style = h1.getAttribute(`style`) ?? ``
      if (style.includes(`inline-block`)) {
        h1.setAttribute(`style`, style
          .replace(/display:\s*inline-block\s*;?/g, `display: block; width: fit-content; margin-left: auto; margin-right: auto;`))
      }
    })

    clipboardDiv.querySelectorAll(`a[href^="#"]`).forEach(a => a.removeAttribute(`href`))

    clipboardDiv.innerHTML = clipboardDiv.innerHTML
      .replace(/([^-])top:(.*?)em/g, `$1transform: translateY($2em)`)
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
      finalHtml = `<section style="${bgParts.join(`; `)}; margin: 0; padding: 16px 8px; box-sizing: border-box;">${finalHtml}</section>`
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
