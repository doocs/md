import type { DiagramMessages } from '@md/shared/types'

export const MD_DIAGRAM_STATE_ATTR = `data-md-diagram-state`

export const MD_DIAGRAM_STATE = {
  loading: `loading`,
  error: `error`,
  ready: `ready`,
} as const

export type MdDiagramState = typeof MD_DIAGRAM_STATE[keyof typeof MD_DIAGRAM_STATE]

export const DEFAULT_DIAGRAM_MESSAGES: DiagramMessages = {
  mermaidLoading: `正在加载 Mermaid...`,
  mermaidError: `Mermaid 渲染失败: {detail}`,
  plantumlLoading: `正在加载 PlantUML 图表...`,
  plantumlError: `PlantUML 图表加载失败`,
  infographicLoading: `正在加载 Infographic...`,
  infographicError: `Infographic 渲染失败: {detail}`,
}

export function diagramStateAttr(state: MdDiagramState): string {
  return `${MD_DIAGRAM_STATE_ATTR}="${state}"`
}

export function resolveDiagramMessages(messages?: DiagramMessages): DiagramMessages {
  return messages ?? DEFAULT_DIAGRAM_MESSAGES
}

export function formatDiagramMessage(template: string, detail: string): string {
  return template.replace(`{detail}`, detail)
}

export function isSvgMarkup(content: string): boolean {
  return content.trimStart().startsWith(`<svg`)
}

/** 异步图表占位是否仍在等待渲染（与文案语言无关） */
export function isAsyncDiagramPending(el: Element): boolean {
  if (!(el instanceof HTMLElement))
    return false

  if (el.querySelector(`svg, img`))
    return false

  const state = el.getAttribute(MD_DIAGRAM_STATE_ATTR)
  if (state === MD_DIAGRAM_STATE.error || state === MD_DIAGRAM_STATE.ready)
    return false

  return true
}
