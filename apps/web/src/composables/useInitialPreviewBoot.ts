import { dismissInitialLoader } from '@/lib/bootstrap/dismiss-initial-loader'
import { waitForPreviewReady } from '@/lib/preview/preview-ready'

const INITIAL_PREVIEW_TIMEOUT_MS = 20_000
const OUTPUT_WAIT_TIMEOUT_MS = 5_000
const OUTPUT_POLL_INTERVAL_MS = 50

let initialPreviewBootstrapped = false

function delay(ms: number) {
  return new Promise<void>(resolve => window.setTimeout(resolve, ms))
}

/** 等待 PreviewPanel 挂载并将 #output 写入 DOM */
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

/** 首次 Markdown 渲染进预览区后，等待异步图表/公式就绪再关闭启动屏 */
export async function completeInitialPreviewBoot() {
  if (initialPreviewBootstrapped)
    return
  initialPreviewBootstrapped = true

  await waitForOutputElement()
  await waitForPreviewReady(INITIAL_PREVIEW_TIMEOUT_MS)
  dismissInitialLoader()
}
