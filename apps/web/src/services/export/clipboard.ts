import { stripUnresolvedAsyncPlaceholders, waitForPreviewReady } from '@/lib/preview/preview-ready'
import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useUIStore } from '@/stores/ui'
import { createEmptyNode, modifyHtmlStructure, promoteSvgHtmlLabels, sanitizeHtmlCssForJuice, solveWeChatImage, stripFontFamilyForJuiceFallback, stripInvalidCssForJuice } from './clipboard-dom'
import { getStylesToAdd } from './share-styles'
import { prepareDiagramSvgsForWeChat, prepareMathFormulasForWeChat, sanitizeSvgsForWeChat } from './wechat-svg'

export { modifyHtmlStructure, solveWeChatImage } from './clipboard-dom'

const JUICE_OPTIONS = {
  inlinePseudoElements: true,
  preserveImportant: true,
  resolveCSSVariables: false,
} as const

async function mergeCss(html: string): Promise<string> {
  const { default: juice } = await import(`juice`)
  const sanitized = sanitizeHtmlCssForJuice(html)
  const attempts = [
    () => juice(sanitized, JUICE_OPTIONS),
    () => juice(sanitized, { ...JUICE_OPTIONS, inlinePseudoElements: false }),
    () => juice(stripFontFamilyForJuiceFallback(sanitized), { ...JUICE_OPTIONS, inlinePseudoElements: false }),
  ]

  for (const attempt of attempts) {
    try {
      return attempt()
    }
    catch (error) {
      console.warn(`WeChat copy: juice failed, trying fallback`, error)
    }
  }

  return sanitized
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
    prepareDiagramSvgsForWeChat(clipboardDiv)

    const stylesToAdd = await getStylesToAdd()

    if (stylesToAdd) {
      clipboardDiv.innerHTML = stylesToAdd + clipboardDiv.innerHTML
    }

    stripInvalidCssForJuice(clipboardDiv)
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

    promoteSvgHtmlLabels(clipboardDiv)
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
