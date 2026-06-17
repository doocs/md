import { stripUnresolvedAsyncPlaceholders, waitForPreviewReady } from '@/lib/preview/preview-ready'
import { getStylesToAdd } from './share-styles'

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

function createEmptyNode(): HTMLElement {
  const node = document.createElement(`p`)
  node.style.fontSize = `0`
  node.style.lineHeight = `0`
  node.style.margin = `0`
  node.innerHTML = `&nbsp;`
  return node
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

  clipboardDiv.innerHTML = modifyHtmlStructure(await mergeCss(clipboardDiv.innerHTML))

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

  clipboardDiv.querySelectorAll('.infographic-diagram').forEach((diagram) => {
    diagram.querySelectorAll('text').forEach((textElem) => {
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
