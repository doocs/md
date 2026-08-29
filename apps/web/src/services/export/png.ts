import type { PreviewDevice } from './png-capture'
import { sanitizeTitle } from '@md/shared/utils/basicHelpers'
import { downloadFile } from '@md/shared/utils/fileHelpers'
import { delay } from '@/lib/delay'
import { waitForPreviewReady } from '@/lib/preview/preview-ready'
import { createOffScreenPreview, getPngCaptureOptions } from './png-capture'

/** Export PNG card image. */
export async function exportPNG(
  title: string = `untitled`,
  options: { previewDevice: PreviewDevice },
) {
  await waitForPreviewReady()

  const offScreen = await createOffScreenPreview(options.previewDevice)
  if (!offScreen)
    return

  try {
    await delay(100)
    const { toPng } = await import(`html-to-image`)
    const url = await toPng(offScreen.el, getPngCaptureOptions())
    downloadFile(url, `${sanitizeTitle(title)}.png`, `image/png`)
  }
  finally {
    offScreen.cleanup()
  }
}
