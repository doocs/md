import { dismissInitialLoader } from '@/lib/bootstrap/dismiss-initial-loader'
import { waitForPreviewReady } from '@/lib/preview/preview-ready'

const INITIAL_PREVIEW_TIMEOUT_MS = 20_000
const OUTPUT_WAIT_TIMEOUT_MS = 5_000
const OUTPUT_POLL_INTERVAL_MS = 50

let initialPreviewBootstrapped = false

function delay(ms: number) {
  return new Promise<void>(resolve => window.setTimeout(resolve, ms))
}

/** Wait for PreviewPanel mount and #output in the DOM. */
async function waitForOutputElement(timeoutMs = OUTPUT_WAIT_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const output = document.getElementById(`output`)
    if (output)
      return output
    await delay(OUTPUT_POLL_INTERVAL_MS)
  }
  return document.getElementById(`output`)
}

/** After first preview render, wait for async diagrams/math before dismissing loader. */
export async function completeInitialPreviewBoot() {
  if (initialPreviewBootstrapped)
    return
  initialPreviewBootstrapped = true

  await waitForOutputElement()
  await waitForPreviewReady(INITIAL_PREVIEW_TIMEOUT_MS)
  dismissInitialLoader()
}
