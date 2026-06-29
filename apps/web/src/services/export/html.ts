import { markedAlert, MDKatex } from '@md/core'
import { sanitizeTitle } from '@md/shared/utils/basicHelpers'
import { downloadFile } from '@md/shared/utils/fileHelpers'
import { Marked } from 'marked'
import { waitForPreviewReady } from '@/lib/preview/preview-ready'
import { EXPORT_LAYOUT_CSS } from './apply-export-layout'
import { getHtmlContent } from './html-content'
import { getStylesToAdd, SHARE_SHELL_VARS_CSS } from './share-styles'

/** 导出 HTML 生成内容 */
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

/** 生成无样式 HTML */
export async function generatePureHTML(raw: string): Promise<string> {
  const markedInstance = new Marked()
  markedInstance.use(markedAlert({ withoutStyle: true }))
  markedInstance.use(
    MDKatex({ nonStandard: true }, false),
  )
  return await markedInstance.parse(raw)
}

/** 导出无样式 HTML 文件 */
export async function exportPureHTML(raw: string, title: string = `untitled`) {
  const safeTitle = sanitizeTitle(title)
  const pureHtml = await generatePureHTML(raw)
  downloadFile(pureHtml, `${safeTitle}.html`, `text/html`)
}
