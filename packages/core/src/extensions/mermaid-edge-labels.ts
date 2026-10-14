/**
 * Add horizontal breathing room to Mermaid flowchart edge labels
 * without changing their horizontal center.
 */
export function normalizeMermaidEdgeLabels(svg: string): string {
  if (typeof document === `undefined`)
    return svg

  const template = document.createElement(`template`)
  template.innerHTML = svg

  const svgElement = template.content.querySelector(`svg`)
  if (!svgElement)
    return svg

  const padding = 8

  svgElement.querySelectorAll(`g.edgeLabels g.edgeLabel`).forEach((edgeLabel) => {
    const label = edgeLabel.querySelector(`g.label`)
    const foreign = label?.querySelector(`foreignObject`)
    const background = foreign?.querySelector(`.labelBkg`)

    if (!label || !foreign)
      return

    const width = Number.parseFloat(foreign.getAttribute(`width`) ?? ``)
    const transform = label.getAttribute(`transform`) ?? ``
    const match = transform.match(
      /^translate\(\s*([-\d.eE]+)[,\s]+([-\d.eE]+)\s*\)$/,
    )

    if (!Number.isFinite(width) || !match)
      return

    const x = Number.parseFloat(match[1])
    const y = Number.parseFloat(match[2])

    if (!Number.isFinite(x) || !Number.isFinite(y))
      return

    foreign.setAttribute(`width`, String(width + padding * 2))
    label.setAttribute(`transform`, `translate(${x - padding}, ${y})`)

    if (background) {
      const style = background.getAttribute(`style`) ?? ``
      background.setAttribute(
        `style`,
        `${style}; box-sizing: border-box; width: 100%; padding: 0 ${padding}px;`,
      )
    }
  })

  return svgElement.outerHTML
}
