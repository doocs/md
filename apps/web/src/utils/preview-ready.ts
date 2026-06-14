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

/** 等待预览区异步图表与公式渲染完成；超时返回 false */
export async function waitForPreviewReady(timeoutMs = PREVIEW_READY_TIMEOUT_MS): Promise<boolean> {
  const output = document.getElementById(`output`)
  if (!output)
    return false

  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (!isDiagramStillLoading(output) && !isMathStillLoading(output))
      return true
    await delay(PREVIEW_POLL_INTERVAL_MS)
  }

  return false
}

/** 移除仍未渲染完成的占位内容，避免复制/导出时出现「正在加载…」文案 */
export function stripUnresolvedAsyncPlaceholders(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(`.mermaid-diagram, .plantuml-diagram, .infographic-diagram`).forEach((el) => {
    if (el.querySelector(`svg, img`))
      return

    const text = el.textContent ?? ``
    if (text.includes(`正在加载`) || text.includes(`加载失败`))
      el.remove()
  })

  root.querySelectorAll<HTMLElement>(`.katex-pending`).forEach((el) => {
    if (!el.querySelector(`svg, mjx-container`))
      el.remove()
  })
}
