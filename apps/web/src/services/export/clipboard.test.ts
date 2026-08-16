// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { modifyHtmlStructure, promoteSvgHtmlLabels, sanitizeHtmlCssForJuice, solveWeChatImage, stripInvalidCssForJuice } from './clipboard-dom'

describe(`modifyHtmlStructure`, () => {
  it(`moves nested lists out of their parent li`, () => {
    const input = `<ul><li>Item<ul><li>Nested</li></ul></li></ul>`
    const output = modifyHtmlStructure(input)

    const root = document.createElement(`div`)
    root.innerHTML = output

    const outerUl = root.querySelector(`ul`)
    expect(outerUl).not.toBeNull()
    expect(outerUl?.children).toHaveLength(2)
    expect(outerUl?.children[0].tagName).toBe(`LI`)
    expect(outerUl?.children[0].querySelector(`ul`)).toBeNull()
    expect(outerUl?.children[1].tagName).toBe(`UL`)
    expect(outerUl?.children[1].textContent).toContain(`Nested`)
  })

  it(`moves nested ordered lists the same way`, () => {
    const input = `<ol><li>One<ol><li>Two</li></ol></li></ol>`
    const output = modifyHtmlStructure(input)

    const root = document.createElement(`div`)
    root.innerHTML = output
    const outerOl = root.querySelector(`ol`)
    expect(outerOl?.children[1].tagName).toBe(`OL`)
  })
})

describe(`solveWeChatImage`, () => {
  it(`converts numeric width/height attributes into px styles`, () => {
    const container = document.createElement(`div`)
    container.innerHTML = `<img width="120" height="80" src="https://example.com/a.png">`
    document.body.appendChild(container)

    solveWeChatImage(container)

    const img = container.querySelector(`img`)!
    expect(img.getAttribute(`width`)).toBeNull()
    expect(img.getAttribute(`height`)).toBeNull()
    expect(img.style.width).toBe(`120px`)
    expect(img.style.height).toBe(`80px`)

    container.remove()
  })

  it(`keeps non-numeric dimension values as-is in style`, () => {
    const container = document.createElement(`div`)
    container.innerHTML = `<img width="50%" height="auto" src="https://example.com/a.png">`
    document.body.appendChild(container)

    solveWeChatImage(container)

    const img = container.querySelector(`img`)!
    expect(img.style.width).toBe(`50%`)
    expect(img.style.height).toBe(`auto`)

    container.remove()
  })
})

describe(`stripInvalidCssForJuice`, () => {
  it(`removes mermaid edge styles that are only undefined`, () => {
    const root = document.createElement(`div`)
    root.innerHTML = `<svg><path style="undefined;" d="M0 0"></path><path style="undefined;;;undefined" d="M1 1"></path></svg>`

    stripInvalidCssForJuice(root)

    expect(root.querySelectorAll(`[style]`)).toHaveLength(0)
  })

  it(`keeps valid declarations and drops undefined values`, () => {
    const root = document.createElement(`div`)
    root.innerHTML = `<path style="fill:#fff;stroke:undefined;stroke-width:1.5"></path>`

    stripInvalidCssForJuice(root)

    expect(root.querySelector(`path`)?.getAttribute(`style`)).toBe(`fill:#fff; stroke-width:1.5`)
  })

  it(`strips undefined declarations from embedded stylesheets`, () => {
    const root = document.createElement(`div`)
    root.innerHTML = `<style>#n{fill:#fff;stroke:undefined;color:#333}</style>`

    stripInvalidCssForJuice(root)

    expect(root.querySelector(`style`)?.textContent).toBe(`#n{fill:#fff;color:#333}`)
  })

  it(`lets juice parse mermaid HTML that previously threw Unknown word undefined`, async () => {
    const { default: juice } = await import(`juice`)
    const root = document.createElement(`div`)
    root.innerHTML = `<div><svg><path class="edge" style="undefined;;;undefined" d="M0 0"></path></svg></div>`

    stripInvalidCssForJuice(root)

    expect(() => juice(root.innerHTML, {
      inlinePseudoElements: true,
      preserveImportant: true,
      resolveCSSVariables: false,
    })).not.toThrow()
  })

  it(`quotes unquoted Open Sans so juice does not throw Unknown word Open`, async () => {
    const { default: juice } = await import(`juice`)
    const root = document.createElement(`div`)
    root.innerHTML = `<svg><path style="fill: #1168BD;stroke: #0B4884;color: #FFFFFF;font-family:Open Sans, sans-serif"></path></svg>`

    stripInvalidCssForJuice(root)

    expect(root.querySelector(`path`)?.getAttribute(`style`)).toContain(`sans-serif`)
    expect(root.querySelector(`path`)?.getAttribute(`style`)).not.toMatch(/Open Sans/)
    expect(() => juice(sanitizeHtmlCssForJuice(root.innerHTML), {
      inlinePseudoElements: true,
      preserveImportant: true,
      resolveCSSVariables: false,
    })).not.toThrow()
  })

  it(`rewrites Open Sans in the HTML string after browsers drop style quotes`, async () => {
    const { default: juice } = await import(`juice`)
    const html = `<svg><path style="fill: #1168BD;stroke: #0B4884;color: #FFFFFF;font-family:Open Sans, sans-serif"></path></svg>`

    const sanitized = sanitizeHtmlCssForJuice(html)
    expect(sanitized).toContain(`sans-serif`)
    expect(sanitized).not.toMatch(/Open Sans/)
    expect(() => juice(sanitized, {
      inlinePseudoElements: true,
      preserveImportant: true,
      resolveCSSVariables: false,
    })).not.toThrow()
  })

  it(`rewrites sequence/C4 text styles that juice reports at column 43`, async () => {
    const { default: juice } = await import(`juice`)
    const html = `<svg><text style="dominant-baseline:central;font-family:Open Sans,sans-serif" font-family="Open Sans, sans-serif">A</text></svg>`

    const sanitized = sanitizeHtmlCssForJuice(html)
    expect(sanitized).not.toMatch(/Open Sans/)
    expect(() => juice(sanitized, {
      inlinePseudoElements: true,
      preserveImportant: true,
      resolveCSSVariables: false,
    })).not.toThrow()
  })
})

describe(`promoteSvgHtmlLabels`, () => {
  it(`turns mermaid foreignObject labels into WeChat <section> nodes`, () => {
    const root = document.createElement(`div`)
    root.className = `mermaid-diagram`
    root.innerHTML = `
      <svg>
        <g class="label">
          <foreignObject>
            <div style="display: table;">
              <span class="nodeLabel">决策</span>
            </div>
          </foreignObject>
        </g>
        <g class="name">
          <foreignObject>
            <div xmlns="http://www.w3.org/1999/xhtml" style="color:#333">
              <span>用户</span>
            </div>
          </foreignObject>
        </g>
      </svg>
    `

    promoteSvgHtmlLabels(root)

    const sections = root.querySelectorAll(`section`)
    expect(sections).toHaveLength(2)
    expect(sections[0].textContent).toContain(`决策`)
    expect(sections[1].textContent).toContain(`用户`)
    expect(root.querySelector(`foreignObject section`)).not.toBeNull()
  })
})

describe(`juice + sanitize flowchart pipeline`, () => {
  it(`keeps node colors and unfilled edges after juice inlines mermaid CSS`, async () => {
    const { default: juice } = await import(`juice`)
    const { sanitizeSvgsForWeChat } = await import(`./wechat-svg`)

    const root = document.createElement(`div`)
    root.innerHTML = `
      <div class="mermaid-diagram">
        <svg id="mermaid-svg-td" viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
          <style>
            #mermaid-svg-td .node rect,#mermaid-svg-td .node polygon{fill:#ECECFF;stroke:#9370DB;}
            #mermaid-svg-td .flowchart-link{fill:none;stroke:#333333;stroke-width:1.5px;}
          </style>
          <g class="node">
            <polygon points="40,10 70,40 40,70 10,40"></polygon>
          </g>
          <g class="node">
            <rect x="120" y="20" width="80" height="40"></rect>
          </g>
          <path class="flowchart-link" fill="none" d="M70 40h50"></path>
        </svg>
      </div>
    `

    stripInvalidCssForJuice(root)
    root.innerHTML = juice(root.innerHTML, {
      inlinePseudoElements: true,
      preserveImportant: true,
      resolveCSSVariables: false,
    })
    document.body.appendChild(root)
    sanitizeSvgsForWeChat(root)

    const polygon = root.querySelector(`polygon`)!
    const rect = root.querySelector(`rect`)!
    const path = root.querySelector(`path`)!
    expect(polygon.getAttribute(`fill`)?.toLowerCase()).toMatch(/#ececff|rgb\(236,\s*236,\s*255\)/)
    expect(rect.getAttribute(`fill`)?.toLowerCase()).toMatch(/#ececff|rgb\(236,\s*236,\s*255\)/)
    expect(path.getAttribute(`fill`)).toBe(`none`)
    expect(path.getAttribute(`stroke`)).toBe(`currentColor`)
    expect(root.querySelector(`svg style`)).toBeNull()
    expect(root.querySelector(`svg[class], svg [class]`)).toBeNull()

    root.remove()
  })
})
