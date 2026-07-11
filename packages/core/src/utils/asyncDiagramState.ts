import type { DiagramMessages } from '@md/shared/types'

export const MD_DIAGRAM_STATE_ATTR = `data-md-diagram-state`

export const MD_DIAGRAM_STATE = {
  loading: `loading`,
  error: `error`,
  ready: `ready`,
} as const

export type MdDiagramState = typeof MD_DIAGRAM_STATE[keyof typeof MD_DIAGRAM_STATE]

/** Locale-neutral English fallbacks; Web injects localized strings via IOpts. */
export const DEFAULT_DIAGRAM_MESSAGES: DiagramMessages = {
  mermaidLoading: `Loading Mermaid…`,
  mermaidError: `Mermaid render failed: {detail}`,
  plantumlLoading: `Loading PlantUML diagram…`,
  plantumlError: `Failed to load PlantUML diagram`,
  infographicLoading: `Loading infographic…`,
  infographicError: `Infographic render failed: {detail}`,
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

/** Whether an async diagram placeholder is still awaiting render (locale-independent). */
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
