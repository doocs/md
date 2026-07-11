import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DIAGRAM_MESSAGES,
  formatDiagramMessage,
  isAsyncDiagramPending,
  MD_DIAGRAM_STATE,
  MD_DIAGRAM_STATE_ATTR,
} from './asyncDiagramState'

function diagram(className: string, attrs: Record<string, string>, innerHTML: string) {
  const el = document.createElement(`div`)
  el.className = className
  for (const [key, value] of Object.entries(attrs))
    el.setAttribute(key, value)
  el.innerHTML = innerHTML
  return el
}

describe(`isAsyncDiagramPending`, () => {
  it(`treats loading state as pending regardless of text language`, () => {
    const el = diagram(`mermaid-diagram`, { [MD_DIAGRAM_STATE_ATTR]: MD_DIAGRAM_STATE.loading }, `Loading Mermaid…`)
    expect(isAsyncDiagramPending(el)).toBe(true)
  })

  it(`treats error state as settled`, () => {
    const el = diagram(
      `mermaid-diagram`,
      { [MD_DIAGRAM_STATE_ATTR]: MD_DIAGRAM_STATE.error },
      `Mermaid render failed: syntax error`,
    )
    expect(isAsyncDiagramPending(el)).toBe(false)
  })

  it(`treats rendered svg as settled`, () => {
    const el = diagram(`mermaid-diagram`, { [MD_DIAGRAM_STATE_ATTR]: MD_DIAGRAM_STATE.loading }, `<svg><path /></svg>`)
    expect(isAsyncDiagramPending(el)).toBe(false)
  })
})

describe(`formatDiagramMessage`, () => {
  it(`replaces detail placeholder`, () => {
    expect(formatDiagramMessage(DEFAULT_DIAGRAM_MESSAGES.mermaidError, `bad syntax`))
      .toBe(`Mermaid render failed: bad syntax`)
  })
})
