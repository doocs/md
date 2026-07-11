import { stripUnresolvedAsyncPlaceholders, waitForPreviewReady } from '@/lib/preview/preview-ready'
import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'
import { createEmptyNode, modifyHtmlStructure, solveWeChatImage } from './clipboard-dom'
import { getStylesToAdd } from './share-styles'
import { prepareMathFormulasForWeChat, sanitizeSvgsForWeChat } from './wechat-svg'

export { modifyHtmlStructure, solveWeChatImage } from './clipboard-dom'

async function mergeCss(html: string): Promise<string> {
  const { default: juice } = await import(`juice`)
  return juice(html, {
    inlinePseudoElements: true,
    preserveImportant: true,
    resolveCSSVariables: false,
  })
}

/**
 * Prepare clipboard HTML for WeChat.
 * Diagrams are exported in light theme structure, but dark ink colors are remapped
 * to currentColor so WeChat reader dark mode can follow text color.
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
    renderStore.render(content, { themeMode: wechatThemeMode, force: true })

  const previewReady = await waitForPreviewReady(undefined, { themeMode: wechatThemeMode })

  try {
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
        `<tspan$1 style="fill: currentColor !important; color: currentColor !important; stroke: none !important;">`,
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
          if (dy) {
            textElem.setAttribute(`dy`, dy)
          }
        }
      })
    })

    sanitizeSvgsForWeChat(clipboardDiv)
    prepareMathFormulasForWeChat(clipboardDiv)

    return {
      html: clipboardDiv.innerHTML,
      plainText: clipboardDiv.textContent || ``,
      hasPendingAsyncContent: !previewReady,
    }
  }
  finally {
    if (rerenderForLight)
      renderStore.render(content, { themeMode: `dark`, force: true })
  }
}
