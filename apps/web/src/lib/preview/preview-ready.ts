import {
  hydratePendingInfographicDiagrams,
  isAsyncDiagramPending,
  MD_DIAGRAM_STATE,
  MD_DIAGRAM_STATE_ATTR,
} from '@md/core'
import { nextTick } from 'vue'

const PREVIEW_READY_TIMEOUT_MS = 20_000
const PREVIEW_POLL_INTERVAL_MS = 250
const ASYNC_DIAGRAM_SELECTOR = `.mermaid-diagram, .plantuml-diagram, .infographic-diagram`

export interface WaitForPreviewReadyOptions {
  themeMode?: `light` | `dark`
}

function delay(ms: number) {
  return new Promise<void>(resolve => window.setTimeout(resolve, ms))
}

function resolveInfographicOptions(options?: WaitForPreviewReadyOptions) {
  return options?.themeMode ? { themeMode: options.themeMode } : undefined
}

function isDiagramStillLoading(output: HTMLElement): boolean {
  for (const el of output.querySelectorAll<HTMLElement>(ASYNC_DIAGRAM_SELECTOR)) {
    if (isAsyncDiagramPending(el))
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

/** Wait for async diagrams and math in preview; returns false on timeout. */
export async function waitForPreviewReady(
  timeoutMs = PREVIEW_READY_TIMEOUT_MS,
  options?: WaitForPreviewReadyOptions,
): Promise<boolean> {
  // Wait for Vue to sync renderStore.output into #output (avoid stale DOM)
  await nextTick()
  await nextTick()

  const output = document.getElementById(`output`)
  if (!output)
    return false

  const infographicOptions = resolveInfographicOptions(options)
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    hydratePendingInfographicDiagrams(output, infographicOptions)

    if (!isDiagramStillLoading(output) && !isMathStillLoading(output))
      return true

    await delay(PREVIEW_POLL_INTERVAL_MS)
  }

  hydratePendingInfographicDiagrams(output, infographicOptions)
  return !isDiagramStillLoading(output) && !isMathStillLoading(output)
}

/** Strip unresolved async placeholders so copy/export omit loading text. */
export function stripUnresolvedAsyncPlaceholders(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(ASYNC_DIAGRAM_SELECTOR).forEach((el) => {
    if (el.querySelector(`svg, img`))
      return

    if (el.getAttribute(MD_DIAGRAM_STATE_ATTR) === MD_DIAGRAM_STATE.loading)
      el.remove()
  })

  root.querySelectorAll<HTMLElement>(`.katex-pending`).forEach((el) => {
    if (!el.querySelector(`svg, mjx-container`))
      el.remove()
  })
}
