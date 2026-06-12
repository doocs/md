import { getExportStyles, getHtmlContent } from '@/utils'

const PREVIEW_READY_TIMEOUT_MS = 20_000
const PREVIEW_POLL_INTERVAL_MS = 250

function delay(ms: number) {
  return new Promise<void>(resolve => window.setTimeout(resolve, ms))
}

function isDiagramStillLoading(output: HTMLElement): boolean {
  for (const el of output.querySelectorAll<HTMLElement>(`.mermaid-diagram, .plantuml-diagram, .infographic-diagram`)) {
    if (el.querySelector(`svg, img`))
      continue

    const text = el.textContent ?? ``
    if (text.includes(`正在加载`) || text.includes(`加载失败`))
      return true

    if (el.classList.contains(`mermaid-diagram`) || el.classList.contains(`infographic-diagram`))
      return true
  }

  return false
}

function isMathStillLoading(output: HTMLElement): boolean {
  if (output.querySelector(`.katex-fallback`))
    return true

  for (const el of output.querySelectorAll<HTMLElement>(`.katex-block, .katex-inline`)) {
    if (!el.querySelector(`svg, mjx-container`))
      return true
  }

  return false
}

/** 等待预览区异步图表与公式渲染完成 */
export async function waitForPreviewReady(timeoutMs = PREVIEW_READY_TIMEOUT_MS): Promise<void> {
  const output = document.getElementById(`output`)
  if (!output)
    throw new Error(`preview_not_ready`)

  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (!isDiagramStillLoading(output) && !isMathStillLoading(output))
      return
    await delay(PREVIEW_POLL_INTERVAL_MS)
  }
}

/** 捕获当前预览 HTML 与样式（与编辑器预览一致） */
export async function captureShareSnapshot(): Promise<{ bodyHtml: string, stylesHtml: string }> {
  await waitForPreviewReady()
  return {
    bodyHtml: getHtmlContent(),
    stylesHtml: await getExportStyles(),
  }
}
