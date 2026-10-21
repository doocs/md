import { afterEach, describe, expect, it, vi } from 'vitest'
import { initRenderer } from '../renderer/renderer-impl'
import { renderMarkdown } from '../utils/markdownHelpers'

const mermaid = vi.hoisted(() => {
  let release: (() => void) | undefined
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  return {
    initialize: vi.fn(),
    render: vi.fn(async (id: string) => {
      await gate
      return { svg: `<svg id="${id}" viewBox="0 0 10 10"></svg>` }
    }),
    release: () => release!(),
  }
})

vi.mock(`mermaid`, () => ({
  default: { initialize: mermaid.initialize, render: mermaid.render },
}))

function render(md: string): string {
  return renderMarkdown(md, initRenderer({ themeMode: `light` })).html
}

describe(`mermaid extension`, () => {
  afterEach(() => {
    document.body.innerHTML = ``
  })

  it(`shares a pending render so re-renders cannot clash on the element id`, async () => {
    const markdown = `\`\`\`mermaid\ngraph TD\n  A --> B\n\`\`\``
    const host = document.createElement(`div`)
    document.body.append(host)

    host.innerHTML = render(markdown)
    host.innerHTML = render(markdown)
    await vi.waitFor(() => expect(mermaid.render).toHaveBeenCalled())
    mermaid.release()

    await vi.waitFor(() => expect(host.querySelector(`.mermaid-diagram svg`)).not.toBeNull())
    expect(mermaid.render).toHaveBeenCalledTimes(1)
    expect(render(markdown)).toContain(`viewBox="0 0 10 10"`)
  })
})
