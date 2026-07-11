import { hydratePendingInfographicDiagrams } from '@md/core'
import { applyExportLayout } from './apply-export-layout'

export interface GetHtmlContentOptions {
  themeMode?: `light` | `dark`
  /** Wrap wide tables/code for static exports (PDF/HTML). */
  staticLayout?: boolean
}

/** Get export HTML content. */
export function getHtmlContent(options?: GetHtmlContentOptions): string {
  const element = document.querySelector(`#output`)
  if (!element)
    return ``
  const clone = element.cloneNode(true) as HTMLElement
  clone.querySelectorAll(`.diagram-download-bar`).forEach(el => el.remove())
  hydratePendingInfographicDiagrams(
    clone,
    options?.themeMode ? { themeMode: options.themeMode } : undefined,
  )
  if (options?.staticLayout)
    applyExportLayout(clone)
  return clone.innerHTML
}
