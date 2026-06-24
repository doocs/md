// @vitest-environment jsdom
import { MD_DIAGRAM_STATE, MD_DIAGRAM_STATE_ATTR } from '@md/core'
import { describe, expect, it } from 'vitest'
import { stripUnresolvedAsyncPlaceholders, waitForPreviewReady } from './preview-ready'

function diagram(className: string, state: string, innerHTML: string) {
  const el = document.createElement(`div`)
  el.className = className
  el.setAttribute(MD_DIAGRAM_STATE_ATTR, state)
  el.innerHTML = innerHTML
  return el
}

describe(`waitForPreviewReady`, () => {
  it(`resolves immediately when async diagrams failed`, async () => {
    const output = document.createElement(`div`)
    output.id = `output`
    output.append(
      diagram(`mermaid-diagram`, MD_DIAGRAM_STATE.error, `<div>Mermaid render failed: syntax error</div>`),
      diagram(`plantuml-diagram`, MD_DIAGRAM_STATE.error, `<div>Failed to load PlantUML diagram</div>`),
      diagram(`infographic-diagram`, MD_DIAGRAM_STATE.error, `<div>Infographic render failed: invalid</div>`),
    )
    document.body.append(output)

    const started = Date.now()
    const ready = await waitForPreviewReady(20_000)
    const elapsed = Date.now() - started

    expect(ready).toBe(true)
    expect(elapsed).toBeLessThan(1_000)

    output.remove()
  })

  it(`waits while diagrams are still loading`, async () => {
    const output = document.createElement(`div`)
    output.id = `output`
    output.append(diagram(`mermaid-diagram`, MD_DIAGRAM_STATE.loading, `Loading Mermaid…`))
    document.body.append(output)

    const readyPromise = waitForPreviewReady(500)
    await new Promise(resolve => setTimeout(resolve, 100))
    output.firstElementChild?.setAttribute(MD_DIAGRAM_STATE_ATTR, MD_DIAGRAM_STATE.ready)
    output.firstElementChild!.innerHTML = `<svg><path /></svg>`

    const ready = await readyPromise
    expect(ready).toBe(true)

    output.remove()
  })
})

describe(`stripUnresolvedAsyncPlaceholders`, () => {
  it(`removes loading placeholders but keeps failure messages`, () => {
    const root = document.createElement(`div`)
    root.append(
      diagram(`mermaid-diagram`, MD_DIAGRAM_STATE.loading, `Loading Mermaid…`),
      diagram(`mermaid-diagram`, MD_DIAGRAM_STATE.error, `<div>Mermaid render failed: syntax error</div>`),
      diagram(`plantuml-diagram`, MD_DIAGRAM_STATE.error, `<div>Failed to load PlantUML diagram</div>`),
      diagram(`infographic-diagram`, MD_DIAGRAM_STATE.error, `<div>Infographic render failed: invalid</div>`),
      diagram(`mermaid-diagram`, MD_DIAGRAM_STATE.ready, `<svg><path /></svg>`),
    )

    stripUnresolvedAsyncPlaceholders(root)

    expect(root.children).toHaveLength(4)
    expect(root.textContent).toContain(`Mermaid render failed`)
    expect(root.textContent).toContain(`Failed to load PlantUML diagram`)
    expect(root.textContent).toContain(`Infographic render failed`)
    expect(root.textContent).not.toContain(`Loading Mermaid`)
  })
})
