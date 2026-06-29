import { sanitizeTitle } from '@md/shared/utils/basicHelpers'
import { downloadFile } from '@md/shared/utils/fileHelpers'
import { toPng } from 'html-to-image'
import { stripUnresolvedAsyncPlaceholders, waitForPreviewReady } from '@/lib/preview/preview-ready'
import {
  applyExportLayout,
  getPngCaptureBackgroundColor,
  getPngCaptureStyles,
  PNG_CAPTURE_ROOT_CLASS,
} from './apply-export-layout'

function delay(ms: number) {
  return new Promise<void>(resolve => window.setTimeout(resolve, ms))
}

async function createOffScreenPreviewElement(
  previewDevice: `desktop` | `mobile`,
): Promise<{ el: HTMLElement, cleanup: () => void } | null> {
  const output = document.getElementById(`output`)
  if (!output)
    return null

  const isDarkApp = document.documentElement.classList.contains(`dark`)
  const useNightPreview = isDarkApp
    && document.getElementById(`output-wrapper`)?.classList.contains(`output_night`)
  const width = previewDevice === `mobile` ? `375px` : `750px`

  const host = document.createElement(`div`)
  host.setAttribute(`data-png-export-host`, ``)
  host.style.cssText = `position:fixed;left:-99999px;top:0;z-index:-1;visibility:visible;pointer-events:none;`
  host.innerHTML = await getPngCaptureStyles()

  const wrapper = document.createElement(`div`)
  wrapper.className = useNightPreview ? `output_night` : ``
  wrapper.style.width = width

  const preview = document.createElement(`div`)
  preview.className = `preview border-x shadow-xl mx-auto`
  preview.style.width = width
  preview.style.margin = `0`

  const content = output.cloneNode(true) as HTMLElement
  content.removeAttribute(`id`)
  content.classList.add(PNG_CAPTURE_ROOT_CLASS)
  content.style.width = `100%`
  content.querySelectorAll(`.diagram-download-bar`).forEach(el => el.remove())
  stripUnresolvedAsyncPlaceholders(content)
  applyExportLayout(content)

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
  options: { previewDevice: `desktop` | `mobile` },
) {
  await waitForPreviewReady()

  const offScreen = await createOffScreenPreviewElement(options.previewDevice)
  if (!offScreen)
    return

  try {
    await delay(100)
    const url = await toPng(offScreen.el, {
      backgroundColor: getPngCaptureBackgroundColor(),
      skipFonts: true,
      pixelRatio: Math.max(window.devicePixelRatio || 1, 2),
      style: { margin: `0` },
    })
    downloadFile(url, `${sanitizeTitle(title)}.png`, `image/png`)
  }
  finally {
    offScreen.cleanup()
  }
}
