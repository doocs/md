import { hydratePendingInfographicDiagrams } from '@md/core'

/** 获取 HTML 内容 */
export function getHtmlContent(options?: { themeMode?: `light` | `dark` }): string {
  const element = document.querySelector(`#output`)
  if (!element)
    return ``
  const clone = element.cloneNode(true) as HTMLElement
  clone.querySelectorAll(`.diagram-download-bar`).forEach(el => el.remove())
  hydratePendingInfographicDiagrams(
    clone,
    options?.themeMode ? { themeMode: options.themeMode } : undefined,
  )
  return clone.innerHTML
}
