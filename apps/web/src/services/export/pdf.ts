import { sanitizeTitle } from '@md/shared/utils/basicHelpers'
import { t } from '@/i18n/translate'
import { waitForPreviewReady } from '@/lib/preview/preview-ready'
import { EXPORT_LAYOUT_CSS } from './apply-export-layout'
import { getHtmlContent } from './html-content'
import { getStylesToAdd, SHARE_SHELL_VARS_CSS } from './share-styles'

/** 导出 PDF 文档（新主题系统） */
export async function exportPDF(title: string = `untitled`) {
  await waitForPreviewReady()
  const htmlStr = getHtmlContent({ staticLayout: true })
  const stylesToAdd = await getStylesToAdd()
  const safeTitle = sanitizeTitle(title)
  const pageFooter = t('store.pdf.pageFooter')

  const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${safeTitle}</title>
  <style>${SHARE_SHELL_VARS_CSS}</style>
  ${stylesToAdd}
  <style>${EXPORT_LAYOUT_CSS}</style>
  <style>
    /* 强制打印背景颜色和图片 */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    /* 打印页面设置 */
    @page {
      @top-center {
        content: "${safeTitle}";
        font-size: 12px;
        color: #666;
      }
      @bottom-left {
        content: "https://md.doocs.org";
        font-size: 10px;
        color: #999;
      }
      @bottom-right {
        content: "${pageFooter}";
        font-size: 10px;
        color: #999;
      }
    }

    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body>
  <div style="width: 100%; max-width: 750px; margin: auto;">
    ${htmlStr}
  </div>
</body>
</html>`
  const iframe = document.createElement(`iframe`)
  iframe.style.cssText = `position:fixed;width:0;height:0;top:-9999px;left:-9999px;border:none;`
  iframe.srcdoc = printHtml
  document.body.appendChild(iframe)

  const removeIframe = () => {
    if (iframe.parentNode) {
      document.body.removeChild(iframe)
    }
  }

  iframe.onload = () => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(removeIframe, 500)
  }

  iframe.onerror = () => {
    removeIframe()
  }

  setTimeout(removeIframe, 5000)
}
