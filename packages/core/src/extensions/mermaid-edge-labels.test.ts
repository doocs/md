import { describe, expect, it } from 'vitest'
import { normalizeMermaidEdgeLabels } from './mermaid-edge-labels'

function parseSvg(svg: string): SVGSVGElement {
  const template = document.createElement(`template`)
  template.innerHTML = svg
  return template.content.querySelector(`svg`) as SVGSVGElement
}

describe(`normalizeMermaidEdgeLabels`, () => {
  it(`adds 16px width while preserving the label center`, () => {
    const input = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <g class="edgeLabels">
          <g class="edgeLabel">
            <g class="label" transform="translate(-80, -24)">
              <foreignObject width="160" height="48">
                <div class="labelBkg" style="background-color:#eee">
                  Words or message
                </div>
              </foreignObject>
            </g>
          </g>
        </g>
      </svg>
    `

    const output = parseSvg(normalizeMermaidEdgeLabels(input))
    const label = output.querySelector(`g.edgeLabel g.label`)
    const foreign = label?.querySelector(`foreignObject`)
    const background = foreign?.querySelector(`.labelBkg`)

    expect(foreign?.getAttribute(`width`)).toBe(`176`)
    expect(label?.getAttribute(`transform`)).toBe(`translate(-88, -24)`)
    expect(background?.getAttribute(`style`)).toContain(`padding: 0 8px`)
    expect(background?.getAttribute(`style`)).toContain(`box-sizing: border-box`)
  })

  it(`does not change ordinary node labels`, () => {
    const input = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <g class="node">
          <g class="label" transform="translate(-40, -12)">
            <foreignObject width="80" height="24">
              <div class="labelBkg">Node A</div>
            </foreignObject>
          </g>
        </g>
      </svg>
    `

    const output = parseSvg(normalizeMermaidEdgeLabels(input))
    const label = output.querySelector(`g.node g.label`)

    expect(label?.getAttribute(`transform`)).toBe(`translate(-40, -12)`)
    expect(label?.querySelector(`foreignObject`)?.getAttribute(`width`)).toBe(`80`)
  })

  it(`handles edge labels without a background element`, () => {
    const input = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <g class="edgeLabels">
          <g class="edgeLabel">
            <g class="label" transform="translate(-40, -12)">
              <foreignObject width="80" height="24">
                <div>Conversation or topic</div>
              </foreignObject>
            </g>
          </g>
        </g>
      </svg>
    `

    const output = parseSvg(normalizeMermaidEdgeLabels(input))
    const label = output.querySelector(`g.edgeLabel g.label`)

    expect(label?.getAttribute(`transform`)).toBe(`translate(-48, -12)`)
    expect(label?.querySelector(`foreignObject`)?.getAttribute(`width`)).toBe(`96`)
  })

  it(`skips labels with unsupported transforms`, () => {
    const input = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <g class="edgeLabels">
          <g class="edgeLabel">
            <g class="label" transform="rotate(30)">
              <foreignObject width="80" height="24">
                <div class="labelBkg">Example</div>
              </foreignObject>
            </g>
          </g>
        </g>
      </svg>
    `

    const output = parseSvg(normalizeMermaidEdgeLabels(input))
    const label = output.querySelector(`g.edgeLabel g.label`)

    expect(label?.getAttribute(`transform`)).toBe(`rotate(30)`)
    expect(label?.querySelector(`foreignObject`)?.getAttribute(`width`)).toBe(`80`)
  })
})
