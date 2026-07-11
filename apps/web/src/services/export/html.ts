import { generatePureHTML } from '@md/core/utils'
import { sanitizeTitle } from '@md/shared/utils/basicHelpers'
import { downloadFile } from '@md/shared/utils/fileHelpers'
import { waitForPreviewReady } from '@/lib/preview/preview-ready'
import { EXPORT_LAYOUT_CSS } from './apply-export-layout'
import { getHtmlContent } from './html-content'
import { getStylesToAdd, SHARE_SHELL_VARS_CSS } from './share-styles'

/** Export rendered HTML content. */
export async function exportHTML(title: string = `untitled`) {
  await waitForPreviewReady()
  const htmlStr = getHtmlContent({ staticLayout: true })
  const stylesToAdd = await getStylesToAdd()

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${sanitizeTitle(title)}</title>
  <style>${SHARE_SHELL_VARS_CSS}</style>
  ${stylesToAdd}
  <style>${EXPORT_LAYOUT_CSS}</style>
</head>
<body>
  <div style="width: 750px; margin: auto; padding: 20px;">
    ${htmlStr}
  </div>
</body>
</html>`

  downloadFile(fullHtml, `${sanitizeTitle(title)}.html`, `text/html`)
}

export { generatePureHTML }

/** Export unstyled HTML file. */
export async function exportPureHTML(raw: string, title: string = `untitled`) {
  const safeTitle = sanitizeTitle(title)
  const pureHtml = await generatePureHTML(raw)
  downloadFile(pureHtml, `${safeTitle}.html`, `text/html`)
}
