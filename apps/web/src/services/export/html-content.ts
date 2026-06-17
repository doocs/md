/** 获取 HTML 内容 */
export function getHtmlContent(): string {
  const element = document.querySelector(`#output`)
  if (!element)
    return ``
  const clone = element.cloneNode(true) as HTMLElement
  clone.querySelectorAll(`.diagram-download-bar`).forEach(el => el.remove())
  return clone.innerHTML
}
