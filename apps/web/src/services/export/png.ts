import { sanitizeTitle } from '@md/shared/utils/basicHelpers'
import { downloadFile } from '@md/shared/utils/fileHelpers'
import { toPng } from 'html-to-image'
import { stripUnresolvedAsyncPlaceholders, waitForPreviewReady } from '@/lib/preview/preview-ready'
import { getStylesToAdd, SHARE_SHELL_VARS_CSS } from './share-styles'

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

/** 导出 PNG 卡片图片 */
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
