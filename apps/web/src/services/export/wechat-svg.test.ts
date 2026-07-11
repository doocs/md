// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
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
    expect(text.getAttribute(`fill`)).toBe(`currentColor`)
    expect(path.getAttribute(`stroke`)).toBe(`currentColor`)
    expect(path.getAttribute(`fill`)).toBe(`#ECECFF`)
  })
})
