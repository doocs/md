// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
  sanitizeMermaidDiagramsForWeChat,
  sanitizeMermaidSvgForWeChat,
} from './mermaid-wechat'

function buildSampleMermaidSvg(): SVGSVGElement {
  const wrapper = document.createElement(`div`)
  wrapper.innerHTML = `
    <div class="mermaid-diagram">
      <svg id="mermaid-svg-test" width="100%" style="max-width: 960px" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <style>.edge{stroke:#333;}</style>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#333333"></path>
          </marker>
        </defs>
        <g class="root">
          <line class="edge" x1="20" y1="50" x2="170" y2="50" stroke="#333333" stroke-width="2" marker-end="url(#arrow)"></line>
        </g>
      </svg>
    </div>
  `
  return wrapper.querySelector(`svg`) as SVGSVGElement
}

describe(`sanitizeMermaidSvgForWeChat`, () => {
  it(`expands marker-end into inline graphics and removes defs`, () => {
    const svg = buildSampleMermaidSvg()
    document.body.appendChild(svg)

    sanitizeMermaidSvgForWeChat(svg)

    expect(svg.querySelector(`defs`)).toBeNull()
    expect(svg.querySelector(`marker`)).toBeNull()
    expect(svg.querySelector(`line`)?.getAttribute(`marker-end`)).toBeNull()
    expect(svg.querySelector(`path, polygon`)).not.toBeNull()
    expect(svg.querySelector(`#arrow`)).toBeNull()

    svg.remove()
  })

  it(`sets explicit pixel dimensions capped for WeChat`, () => {
    const svg = buildSampleMermaidSvg()
    document.body.appendChild(svg)

    sanitizeMermaidSvgForWeChat(svg)

    expect(svg.getAttribute(`width`)).toBe(`200`)
    expect(svg.getAttribute(`height`)).toBe(`100`)
    expect(svg.getAttribute(`style`)).toContain(`width:200px`)
    expect(svg.getAttribute(`style`)).not.toContain(`width: 100%`)

    svg.remove()
  })

  it(`scales oversized viewBox down to article width`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.innerHTML = `
      <svg viewBox="0 0 1200 800" width="100%" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="1200" height="800" fill="#fff"></rect>
      </svg>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(svg)

    sanitizeMermaidSvgForWeChat(svg)

    expect(Number(svg.getAttribute(`width`))).toBeLessThanOrEqual(677)
    expect(Number(svg.getAttribute(`height`))).toBeLessThanOrEqual(677)

    svg.remove()
  })

  it(`strips id, class and internal style tags`, () => {
    const svg = buildSampleMermaidSvg()
    document.body.appendChild(svg)

    sanitizeMermaidSvgForWeChat(svg)

    expect(svg.getAttribute(`id`)).toBeNull()
    expect(svg.querySelector(`style`)).toBeNull()
    expect(svg.querySelector(`[class]`)).toBeNull()

    svg.remove()
  })
})

describe(`sanitizeMermaidDiagramsForWeChat`, () => {
  it(`processes all mermaid diagrams under root`, () => {
    const root = document.createElement(`div`)
    root.innerHTML = `
      <div class="mermaid-diagram">
        <svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="m1" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#000"></path>
            </marker>
          </defs>
          <line x1="10" y1="25" x2="90" y2="25" stroke="#000" marker-end="url(#m1)"></line>
        </svg>
      </div>
    `
    document.body.appendChild(root)

    sanitizeMermaidDiagramsForWeChat(root)

    const svg = root.querySelector(`svg`) as SVGSVGElement
    const container = root.querySelector(`.mermaid-diagram`) as HTMLElement
    expect(svg.querySelector(`defs`)).toBeNull()
    expect(Number(svg.getAttribute(`width`))).toBeLessThanOrEqual(677)
    expect(container.getAttribute(`style`)).toContain(`max-width:677px`)

    root.remove()
  })
})
