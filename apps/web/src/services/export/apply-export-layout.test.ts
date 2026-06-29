// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { applyExportLayout } from './apply-export-layout'

describe('applyExportLayout', () => {
  it('unwraps table and code scroll wrappers on export clones', () => {
    const root = document.createElement(`div`)
    root.innerHTML = `
      <section style="max-width: 100%; overflow: auto;">
        <table class="preview-table">
          <tbody><tr><td>Cell</td></tr></tbody>
        </table>
      </section>
      <section class="code-scroll" style="overflow-x:auto;">
        <div style="white-space:pre;min-width:max-content;">code</div>
      </section>
    `

    applyExportLayout(root)

    expect(root.querySelector<HTMLElement>(`section`)!.style.overflow).toBe(`visible`)
    expect(root.querySelector<HTMLElement>(`.code-scroll`)!.style.overflow).toBe(`visible`)
  })
})
