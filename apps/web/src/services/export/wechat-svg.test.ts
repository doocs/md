// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
  prepareDiagramSvgsForWeChat,
  prepareMathFormulasForWeChat,
  remapDiagramInkToCurrentColor,
  sanitizeSvgForWeChat,
  sanitizeSvgsForWeChat,
} from './wechat-svg'

function buildSampleDiagramSvg(): SVGSVGElement {
  const wrapper = document.createElement(`div`)
  wrapper.innerHTML = `
    <div class="mermaid-diagram">
      <svg id="diagram-svg-test" width="100%" style="max-width: 960px" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
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

describe(`sanitizeSvgForWeChat`, () => {
  it(`expands marker-end into inline graphics and removes defs`, () => {
    const svg = buildSampleDiagramSvg()
    document.body.appendChild(svg)

    sanitizeSvgForWeChat(svg)

    expect(svg.querySelector(`defs`)).toBeNull()
    expect(svg.querySelector(`marker`)).toBeNull()
    expect(svg.querySelector(`line`)?.getAttribute(`marker-end`)).toBeNull()
    expect(svg.querySelector(`path, polygon`)).not.toBeNull()
    expect(svg.querySelector(`#arrow`)).toBeNull()
    expect(svg.querySelector(`line`)?.getAttribute(`stroke`)).toBe(`currentColor`)

    svg.remove()
  })

  it(`sets explicit pixel dimensions capped for WeChat`, () => {
    const svg = buildSampleDiagramSvg()
    document.body.appendChild(svg)

    sanitizeSvgForWeChat(svg)

    expect(svg.getAttribute(`width`)).toBe(`200`)
    expect(svg.getAttribute(`height`)).toBe(`100`)
    expect(svg.getAttribute(`width`)).not.toContain(`%`)

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

    sanitizeSvgForWeChat(svg)

    expect(Number(svg.getAttribute(`width`))).toBeLessThanOrEqual(677)
    expect(Number(svg.getAttribute(`height`))).toBeLessThanOrEqual(677)

    svg.remove()
  })

  it(`bakes sankey gradient strokes into a solid color before stripping ids`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.innerHTML = `
      <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
        <g class="links" fill="none" stroke-opacity="0.5">
          <g class="link">
            <linearGradient id="linearGradient-flow" gradientUnits="userSpaceOnUse" x1="20" x2="180">
              <stop offset="0%" stop-color="#4e79a7"></stop>
              <stop offset="100%" stop-color="#f28e2c"></stop>
            </linearGradient>
            <path d="M20 20C80 20 80 60 180 60" stroke="url(#linearGradient-flow)" stroke-width="12"></path>
          </g>
        </g>
        <g class="nodes">
          <rect x="10" y="10" width="10" height="20" fill="#4e79a7"></rect>
        </g>
      </svg>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(svg)

    sanitizeSvgForWeChat(svg)

    const path = svg.querySelector(`path`)!
    const stroke = path.getAttribute(`stroke`) ?? ``
    expect(stroke.startsWith(`url(`)).toBe(false)
    expect(stroke).toMatch(/#|rgb/i)
    expect(svg.querySelector(`linearGradient`)).toBeNull()
    expect(svg.querySelector(`rect`)?.getAttribute(`fill`)).toBe(`#4e79a7`)

    svg.remove()
  })

  it(`keeps flowchart edge fill=none so links are not painted as blobs`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.innerHTML = `
      <svg id="mermaid-svg-flow" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
        <style>#mermaid-svg-flow .node rect{fill:#ECECFF;stroke:#9370DB;}</style>
        <g class="node"><rect width="80" height="40" style="fill:#ECECFF;stroke:#9370DB"></rect></g>
        <g class="edgePath"><path fill="none" stroke="#333333" d="M0 40h80"></path></g>
      </svg>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(svg)

    sanitizeSvgForWeChat(svg)

    expect(svg.querySelector(`path`)?.getAttribute(`fill`)).toBe(`none`)
    expect(svg.querySelector(`path`)?.getAttribute(`stroke`)).toBe(`currentColor`)
    expect(svg.querySelector(`rect`)?.getAttribute(`fill`)?.toLowerCase()).toMatch(/#ececff|rgb\(236,\s*236,\s*255\)/)
    expect(svg.querySelector(`rect`)?.getAttribute(`stroke`)?.toLowerCase()).toMatch(/#9370db|rgb\(147,\s*112,\s*219\)/)

    svg.remove()
  })

  it(`persists CSS-only fill:none before classes and style tags are stripped`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.innerHTML = `
      <svg id="mermaid-svg-css-none" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
        <style>#mermaid-svg-css-none .flowchart-link{fill:none;stroke:#333333;}</style>
        <path class="flowchart-link" style="fill:none;stroke:#333333" d="M0 40h80"></path>
      </svg>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(svg)

    sanitizeSvgForWeChat(svg)

    expect(svg.querySelector(`path`)?.getAttribute(`fill`)).toBe(`none`)
    expect(svg.querySelector(`path`)?.getAttribute(`stroke`)).toBe(`currentColor`)

    svg.remove()
  })

  it(`does not let juice-inlined style fill override an explicit fill=none`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.innerHTML = `
      <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
        <g class="edgePath" style="fill: rgb(51, 51, 51)">
          <path fill="none" stroke="#333333" style="fill: rgb(51, 51, 51)" d="M0 40h80"></path>
        </g>
      </svg>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(svg)

    sanitizeSvgForWeChat(svg)

    const path = svg.querySelector(`path`)!
    expect(path.getAttribute(`fill`)).toBe(`none`)
    expect(path.getAttribute(`style`) ?? ``).not.toMatch(/fill\s*:/)
    expect(svg.querySelector(`g`)?.getAttribute(`fill`)).toBeNull()
    expect(svg.querySelector(`g`)?.getAttribute(`style`) ?? ``).not.toMatch(/fill\s*:/)

    svg.remove()
  })

  it(`converts mermaid html labels to SVG text without extra dy offset`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.className = `mermaid-diagram`
    wrapper.innerHTML = `
      <svg viewBox="0 0 1000 200" width="100%" xmlns="http://www.w3.org/2000/svg">
        <text font-size="16px" x="10" y="20">决策</text>
        <g>
          <foreignObject width="80" height="40">
            <section style="font-size: 16px; display: table;">
              <span class="nodeLabel">排除问题</span>
            </section>
          </foreignObject>
        </g>
      </svg>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(wrapper)

    sanitizeSvgForWeChat(svg)

    const labels = Array.from(svg.querySelectorAll(`text`)).map(el => el.textContent)
    expect(labels).toContain(`决策`)
    expect(labels).toContain(`排除问题`)
    expect(svg.querySelector(`foreignObject`)).toBeNull()
    expect(svg.querySelector(`text`)?.getAttribute(`dy`)).toBeNull()

    wrapper.remove()
  })

  it(`flattens mermaid labels even after the svg is detached for getComputedStyle`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.className = `mermaid-diagram`
    wrapper.innerHTML = `
      <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
        <foreignObject x="8" y="40" width="160" height="24">
          <div style="color:#333333;font-size:16px">Risk: Medium</div>
        </foreignObject>
      </svg>
    `
    document.body.appendChild(wrapper)

    sanitizeSvgsForWeChat(wrapper)

    expect(wrapper.querySelector(`foreignObject`)).toBeNull()
    expect(wrapper.querySelector(`text`)?.textContent).toBe(`Risk: Medium`)
    expect(Number(wrapper.querySelector(`svg`)?.getAttribute(`width`))).toBe(240)

    wrapper.remove()
  })

  it(`converts mermaid foreignObject labels to SVG text for WeChat`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.className = `mermaid-diagram`
    wrapper.innerHTML = `
      <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
        <g class="name">
          <foreignObject x="8" y="10" width="120" height="24">
            <div xmlns="http://www.w3.org/1999/xhtml" style="color:#333333;font-size:16px">量表</div>
          </foreignObject>
        </g>
        <g class="req">
          <foreignObject x="8" y="40" width="160" height="24">
            <div style="color:#333333;font-size:16px">Risk: Medium</div>
          </foreignObject>
        </g>
      </svg>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(wrapper)

    sanitizeSvgForWeChat(svg)

    expect(svg.querySelector(`foreignObject`)).toBeNull()
    const labels = Array.from(svg.querySelectorAll(`text`)).map(el => el.textContent)
    expect(labels).toContain(`量表`)
    expect(labels).toContain(`Risk: Medium`)
    const risk = Array.from(svg.querySelectorAll(`text`)).find(el => el.textContent === `Risk: Medium`)
    expect(risk?.getAttribute(`fill`)?.toLowerCase()).toMatch(/#333|rgb\(51,\s*51,\s*51\)/)
    expect(risk?.getAttribute(`dy`)).toBeNull()
    expect(Number.parseFloat(risk?.getAttribute(`y`) ?? `0`)).toBeGreaterThan(40)

    wrapper.remove()
  })

  it(`separates overlapping bidirectional state edge labels`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.className = `mermaid-diagram`
    wrapper.innerHTML = `
      <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg">
        <g class="edgeLabel" transform="translate(120, 100)">
          <g class="label" transform="translate(-24, -12)">
            <foreignObject width="48" height="24">
              <div style="color:#333333;font-size:16px;background-color:#e8e8e8;text-align:center">条件 2</div>
            </foreignObject>
          </g>
        </g>
        <g class="edgeLabel" transform="translate(120, 100)">
          <g class="label" transform="translate(-16, -12)">
            <foreignObject width="32" height="24">
              <div style="color:#333333;font-size:16px;background-color:#e8e8e8;text-align:center">返回</div>
            </foreignObject>
          </g>
        </g>
        <g class="edgeLabel" transform="translate(40, 40)">
          <g class="label" transform="translate(-24, -12)">
            <foreignObject width="48" height="24">
              <div style="color:#333333;font-size:16px;text-align:center">条件 1</div>
            </foreignObject>
          </g>
        </g>
      </svg>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(wrapper)

    sanitizeSvgForWeChat(svg)

    const texts = Array.from(svg.querySelectorAll(`text`))
    const cond2 = texts.find(el => el.textContent === `条件 2`)
    const back = texts.find(el => el.textContent === `返回`)
    const cond1 = texts.find(el => el.textContent === `条件 1`)
    expect(cond2).toBeTruthy()
    expect(back).toBeTruthy()
    expect(cond1).toBeTruthy()

    const outerTranslate = (el: Element) => {
      let found = { x: 0, y: 0 }
      let node: Element | null = el
      while (node && node.localName !== `svg`) {
        const match = node.getAttribute(`transform`)?.match(/translate\(\s*([-\d.]+)[\s,]+([-\d.]+)\s*\)/)
        if (match)
          found = { x: Number.parseFloat(match[1]), y: Number.parseFloat(match[2]) }
        node = node.parentElement
      }
      return found
    }

    const a = outerTranslate(cond2!)
    const b = outerTranslate(back!)
    const c = outerTranslate(cond1!)
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(40)
    expect(c.x).toBe(40)
    expect(c.y).toBe(40)
    expect(svg.querySelector(`rect`)?.getAttribute(`fill`)).toMatch(/#e8e8e8|rgb\(232,\s*232,\s*232\)/i)

    wrapper.remove()
  })

  it(`does not paint ER/class labels with the entity box fill`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.className = `mermaid-diagram`
    wrapper.innerHTML = `
      <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
        <g class="node" style="fill:#ECECFF;stroke:#9370DB">
          <path fill="#ECECFF" stroke="#9370DB" d="M0 0h200v80H0z"></path>
          <text x="10" y="24" style="color:#333333">用户</text>
        </g>
      </svg>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(wrapper)

    sanitizeSvgForWeChat(svg)

    const fill = (svg.querySelector(`text`)?.getAttribute(`fill`) ?? ``).toLowerCase()
    expect(fill).not.toMatch(/#ececff|rgb\(236,\s*236,\s*255\)/)
    expect(fill).toMatch(/#333|rgb\(51,\s*51,\s*51\)/)

    wrapper.remove()
  })

  it(`keeps C4-style light label fills instead of forcing currentColor`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.innerHTML = `
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="60" fill="#1168BD"></rect>
        <text fill="#FFFFFF"><tspan fill="#FFFFFF">Person</tspan></text>
      </svg>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(svg)

    sanitizeSvgForWeChat(svg)

    expect(svg.querySelector(`rect`)?.getAttribute(`fill`)).toBe(`#1168BD`)
    expect(svg.querySelector(`text`)?.getAttribute(`fill`)).toBe(`#FFFFFF`)
    expect(svg.querySelector(`tspan`)?.getAttribute(`fill`)).toBe(`#FFFFFF`)

    svg.remove()
  })

  it(`inlines architecture icon <use> references before stripping defs`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.innerHTML = `
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <g id="icon-cloud">
            <path d="M10 40h60" fill="#333333"></path>
          </g>
        </defs>
        <g class="architecture-service">
          <use href="#icon-cloud" x="8" y="8"></use>
        </g>
      </svg>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(svg)

    sanitizeSvgForWeChat(svg)

    expect(svg.querySelector(`use`)).toBeNull()
    expect(svg.querySelector(`defs`)).toBeNull()
    expect(svg.querySelector(`path`)).not.toBeNull()
    expect(svg.querySelector(`path`)?.getAttribute(`d`)).toBe(`M10 40h60`)

    svg.remove()
  })

  it(`strips id, class and internal style tags`, () => {
    const svg = buildSampleDiagramSvg()
    document.body.appendChild(svg)

    sanitizeSvgForWeChat(svg)

    expect(svg.getAttribute(`id`)).toBeNull()
    expect(svg.querySelector(`style`)).toBeNull()
    expect(svg.querySelector(`[class]`)).toBeNull()

    svg.remove()
  })

  it(`keeps plantuml natural width and prevents horizontal squash`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.innerHTML = `
      <div class="plantuml-diagram">
        <svg preserveAspectRatio="none" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="400" height="200" fill="#fff"></rect>
        </svg>
      </div>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(wrapper)

    sanitizeSvgForWeChat(svg)

    expect(svg.getAttribute(`width`)).toBe(`400`)
    expect(svg.getAttribute(`height`)).toBe(`200`)
    expect(svg.getAttribute(`preserveAspectRatio`)).toBe(`xMidYMid meet`)
    expect(svg.getAttribute(`style`)).toContain(`display: block`)
    expect(svg.getAttribute(`style`)).toContain(`max-width: 400px`)
    expect(svg.getAttribute(`style`)).toContain(`height: auto`)

    wrapper.remove()
  })

  it(`sets plantuml dimensions without inline styles when wider than article column`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.innerHTML = `
      <div class="plantuml-diagram">
        <svg preserveAspectRatio="none" viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="1200" height="400" fill="#fff"></rect>
        </svg>
      </div>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(wrapper)

    sanitizeSvgForWeChat(svg)

    expect(svg.getAttribute(`width`)).toBe(`1200`)
    expect(svg.getAttribute(`height`)).toBe(`400`)
    expect(svg.getAttribute(`preserveAspectRatio`)).toBe(`xMidYMid meet`)
    expect(svg.getAttribute(`style`)).toBeNull()

    wrapper.remove()
  })

  it(`detects plantuml svg via data-diagram-type`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.innerHTML = `
      <svg data-diagram-type="SEQUENCE" preserveAspectRatio="none" viewBox="0 0 900 300" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="900" height="300" fill="#fff"></rect>
      </svg>
    `
    const svg = wrapper.querySelector(`svg`) as SVGSVGElement
    document.body.appendChild(wrapper)

    sanitizeSvgForWeChat(svg)

    expect(svg.getAttribute(`width`)).toBe(`900`)
    expect(svg.getAttribute(`preserveAspectRatio`)).toBe(`xMidYMid meet`)

    wrapper.remove()
  })

  it(`wraps wide plantuml in a WeChat slider-style scroll container`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.innerHTML = `
      <div class="plantuml-diagram">
        <svg preserveAspectRatio="none" viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="1200" height="400" fill="#fff"></rect>
        </svg>
      </div>
    `
    document.body.appendChild(wrapper)

    sanitizeSvgsForWeChat(wrapper)

    const plantumlContainer = wrapper.querySelector(`.plantuml-diagram`) as HTMLElement
    const scrollWrapper = plantumlContainer.querySelector(`section > section`)
    const innerWrapper = scrollWrapper?.querySelector(`section`)
    const hint = plantumlContainer.querySelector(`p`)

    expect(scrollWrapper?.getAttribute(`style`)).toContain(`overflow-x: scroll`)
    expect(scrollWrapper?.getAttribute(`style`)).toContain(`overflow-y: hidden`)
    expect(scrollWrapper?.getAttribute(`style`)).toContain(`height: 400px`)
    expect(scrollWrapper?.getAttribute(`style`)).toContain(`white-space: nowrap`)
    expect(innerWrapper?.getAttribute(`style`)).toContain(`display: inline-block`)
    expect(innerWrapper?.getAttribute(`style`)).toContain(`width: 1200px`)
    expect(innerWrapper?.getAttribute(`style`)).toContain(`height: 400px`)
    expect(innerWrapper?.querySelector(`svg`)?.getAttribute(`width`)).toBe(`1200`)
    expect(innerWrapper?.querySelector(`svg`)?.getAttribute(`style`)).toContain(`height: 400px`)
    expect(hint?.textContent).toContain(`左右滑动看更多`)

    wrapper.remove()
  })

  it(`does not wrap narrow plantuml in a scroll container`, () => {
    const wrapper = document.createElement(`div`)
    wrapper.innerHTML = `
      <div class="plantuml-diagram">
        <svg preserveAspectRatio="none" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="400" height="200" fill="#fff"></rect>
        </svg>
      </div>
    `
    document.body.appendChild(wrapper)

    sanitizeSvgsForWeChat(wrapper)

    const plantumlContainer = wrapper.querySelector(`.plantuml-diagram`) as HTMLElement
    expect(plantumlContainer.getAttribute(`style`)).toContain(`margin: 0`)
    expect(plantumlContainer.querySelector(`section`)).toBeNull()
    expect(plantumlContainer.querySelector(`svg`)?.getAttribute(`width`)).toBe(`400`)

    wrapper.remove()
  })
})

describe(`prepareDiagramSvgsForWeChat`, () => {
  it(`resolves gradient paints before innerHTML/juice can drop defs`, () => {
    const root = document.createElement(`div`)
    root.innerHTML = `
      <div class="mermaid-diagram">
        <svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
          <linearGradient id="g1">
            <stop offset="0%" stop-color="#4e79a7"></stop>
            <stop offset="100%" stop-color="#f28e2c"></stop>
          </linearGradient>
          <path stroke="url(#g1)" fill="none" d="M0 20h100"></path>
        </svg>
      </div>
    `

    prepareDiagramSvgsForWeChat(root)

    const stroke = root.querySelector(`path`)?.getAttribute(`stroke`) ?? ``
    expect(stroke.startsWith(`url(`)).toBe(false)
    expect(stroke).toMatch(/#|rgb/i)
    expect(root.querySelector(`path`)?.getAttribute(`fill`)).toBe(`none`)
  })
})

describe(`sanitizeSvgsForWeChat`, () => {
  it(`processes all svg elements under root`, () => {
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
      <div class="plantuml-diagram">
        <svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
          <line x1="5" y1="20" x2="75" y2="20" stroke="#000"></line>
        </svg>
      </div>
    `
    document.body.appendChild(root)

    sanitizeSvgsForWeChat(root)

    const svgs = root.querySelectorAll(`svg`)
    expect(svgs).toHaveLength(2)
    expect(Number(root.querySelector(`.mermaid-diagram svg`)?.getAttribute(`width`))).toBeLessThanOrEqual(677)
    expect(Number(root.querySelector(`.plantuml-diagram svg`)?.getAttribute(`width`))).toBe(80)

    const mermaidContainer = root.querySelector(`.mermaid-diagram`) as HTMLElement
    const plantumlContainer = root.querySelector(`.plantuml-diagram`) as HTMLElement
    expect(mermaidContainer.getAttribute(`style`)).toBeNull()
    expect(plantumlContainer.getAttribute(`style`)).toContain(`margin: 0`)
    expect(root.querySelector(`defs`)).toBeNull()
    expect(plantumlContainer.querySelector(`svg`)?.getAttribute(`width`)).toBe(`80`)

    root.remove()
  })

  it(`does not restyle containers for small inline icons`, () => {
    const root = document.createElement(`div`)
    root.innerHTML = `
      <p class="alert-note">
        <svg width="16" height="16" viewBox="0 0 16 16" class="octicon">
          <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Z"></path>
        </svg>
        Note text
      </p>
    `
    document.body.appendChild(root)

    sanitizeSvgsForWeChat(root)

    const alert = root.querySelector(`.alert-note`) as HTMLElement
    expect(alert.getAttribute(`style`)).toBeNull()
    expect(alert.querySelector(`svg`)?.getAttribute(`width`)).toBe(`16`)
    expect(alert.innerHTML.trimStart().startsWith(`<svg`)).toBe(true)

    root.remove()
  })

  it(`keeps alert icon before title text`, () => {
    const root = document.createElement(`div`)
    root.innerHTML = `
      <blockquote class="markdown-alert markdown-alert-note">
        <p class="markdown-alert-title alert-title-note">
          <svg class="alert-icon-note octicon" style="margin-right: 0.25em;" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Z"></path>
          </svg>
          Note
        </p>
        <p>提醒读者即使在快速浏览时也应留意的信息。</p>
      </blockquote>
    `
    document.body.appendChild(root)

    sanitizeSvgsForWeChat(root)

    const title = root.querySelector(`.markdown-alert-title`) as HTMLElement
    expect(title.innerHTML.trimStart().startsWith(`<svg`)).toBe(true)
    expect(title.textContent?.trim()).toBe(`Note`)

    root.remove()
  })

  it(`skips MathJax formula SVGs (preserves ids and defs)`, () => {
    const root = document.createElement(`div`)
    root.innerHTML = `
      <section class="katex-block" data-math-display="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="10ex" height="2.5ex" role="img" aria-label="E=mc^2">
          <defs>
            <path id="MJX-TEST" d="M0 0h10v10H0z"></path>
          </defs>
          <g fill="currentColor" stroke="currentColor">
            <use href="#MJX-TEST" x="0" y="0"></use>
          </g>
        </svg>
      </section>
    `
    document.body.appendChild(root)

    const svg = root.querySelector(`svg`) as SVGSVGElement
    const originalWidth = svg.getAttribute(`width`)

    sanitizeSvgsForWeChat(root)

    expect(root.querySelector(`defs`)).not.toBeNull()
    expect(root.querySelector(`#MJX-TEST`)).not.toBeNull()
    expect(svg.getAttribute(`width`)).toBe(originalWidth)
    expect(svg.getAttribute(`id`)).toBeNull()

    root.remove()
  })
})

describe(`prepareMathFormulasForWeChat`, () => {
  it(`keeps currentColor so formulas follow WeChat text color in dark mode`, () => {
    const root = document.createElement(`div`)
    root.innerHTML = `
      <span class="katex-inline" style="color: #ffffff;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path fill="currentColor" d="M0 0h10v10H0z"></path>
          <path fill="#333333" d="M10 0h10v10H10z"></path>
        </svg>
      </span>
    `
    prepareMathFormulasForWeChat(root)

    const wrapper = root.querySelector(`.katex-inline`) as HTMLElement
    const paths = root.querySelectorAll(`path`)
    expect(wrapper.style.color).toBe(``)
    expect(paths[0].getAttribute(`fill`)).toBe(`currentColor`)
    expect(paths[1].getAttribute(`fill`)).toBe(`currentColor`)
  })
})

describe(`remapDiagramInkToCurrentColor`, () => {
  it(`converts dark grayscale stroke/fill to currentColor and keeps chromatic borders`, () => {
    const svg = document.createElementNS(`http://www.w3.org/2000/svg`, `svg`)
    svg.innerHTML = `
      <rect fill="#ffffff" stroke="#333333" width="100" height="40"></rect>
      <rect fill="#ECECFF" stroke="#9370DB" width="80" height="30"></rect>
      <text fill="#262626">Label</text>
      <path stroke="rgb(51, 51, 51)" fill="#ECECFF" d="M0 0h10v10H0z"></path>
    `
    remapDiagramInkToCurrentColor(svg)

    const rects = svg.querySelectorAll(`rect`)
    const text = svg.querySelector(`text`)!
    const path = svg.querySelector(`path`)!
    expect(rects[0].getAttribute(`fill`)).toBe(`#ffffff`)
    expect(rects[0].getAttribute(`stroke`)).toBe(`currentColor`)
    expect(rects[1].getAttribute(`fill`)).toBe(`#ECECFF`)
    expect(rects[1].getAttribute(`stroke`)).toBe(`#9370DB`)
    expect(text.getAttribute(`fill`)).toBe(`#262626`)
    expect(path.getAttribute(`stroke`)).toBe(`currentColor`)
    expect(path.getAttribute(`fill`)).toBe(`#ECECFF`)
  })
})
