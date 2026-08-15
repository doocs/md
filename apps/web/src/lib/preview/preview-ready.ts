import {
  hydratePendingInfographicDiagrams,
  isAsyncDiagramPending,
  MD_DIAGRAM_STATE,
  MD_DIAGRAM_STATE_ATTR,
} from '@md/core'
import { nextTick } from 'vue'
import { delay } from '@/lib/delay'

const PREVIEW_READY_TIMEOUT_MS = 20_000
const PREVIEW_POLL_INTERVAL_MS = 250
const ASYNC_DIAGRAM_SELECTOR = `.mermaid-diagram, .plantuml-diagram, .infographic-diagram`

export interface WaitForPreviewReadyOptions {
  themeMode?: `light` | `dark`
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

/**
 * Folder-image hydration runs in a `MutationObserver` callback after the
 * renderer emits a placeholder `<img src="about:blank">`. Export / clipboard
 * paths that clone `#output` before the observer has a chance to swap in the
 * blob URL will end up serializing the placeholder, which is useless on the
 * receiving end. Wait for every folder image to either carry a real URL or
 * to be removed entirely (failure case).
 */
function isFolderImageStillLoading(output: HTMLElement): boolean {
  return Boolean(output.querySelector(`img.md-folder-img[src="about:blank"]`))
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

    if (!isDiagramStillLoading(output) && !isMathStillLoading(output) && !isFolderImageStillLoading(output))
      return true

    await delay(PREVIEW_POLL_INTERVAL_MS)
  }

  hydratePendingInfographicDiagrams(output, infographicOptions)
  return !isDiagramStillLoading(output) && !isMathStillLoading(output) && !isFolderImageStillLoading(output)
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
