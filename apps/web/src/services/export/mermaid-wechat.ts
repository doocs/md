/** WeChat article content column width (px). */
export const WECHAT_MAX_WIDTH_PX = 677
export const WECHAT_SVG_MAX_WIDTH = `${WECHAT_MAX_WIDTH_PX}px`

const SVG_NS = `http://www.w3.org/2000/svg`

interface MarkerSpec {
  paths: Element[]
  refX: number
  refY: number
  orient: string
  markerUnits: string
  markerWidth: number
  markerHeight: number
}

interface Point { x: number, y: number }

function parseMarkerRef(value: string | null): string | null {
  if (!value)
    return null
  const match = value.match(/#([^)'"]+)/)
  return match?.[1] ?? null
}

function collectMarkers(defs: Element): Map<string, MarkerSpec> {
  const markers = new Map<string, MarkerSpec>()

  Array.from(defs.querySelectorAll(`*`)).forEach((markerEl) => {
    if (markerEl.localName !== `marker`)
      return

    const id = markerEl.getAttribute(`id`)
    if (!id)
      return

    const paths = Array.from(markerEl.querySelectorAll(`*`))
      .filter(node => [`path`, `polygon`, `polyline`, `line`].includes(node.localName))

    if (paths.length === 0)
      return

    markers.set(id, {
      paths,
      refX: Number.parseFloat(markerEl.getAttribute(`refX`) ?? `0`),
      refY: Number.parseFloat(markerEl.getAttribute(`refY`) ?? `0`),
      orient: markerEl.getAttribute(`orient`) ?? `auto`,
      markerUnits: markerEl.getAttribute(`markerUnits`) ?? `strokeWidth`,
      markerWidth: Number.parseFloat(markerEl.getAttribute(`markerWidth`) ?? `3`),
      markerHeight: Number.parseFloat(markerEl.getAttribute(`markerHeight`) ?? `3`),
    })
  })

  return markers
}

function cloneMarkerGraphics(spec: MarkerSpec): Element[] {
  return spec.paths.map(path => path.cloneNode(true) as Element)
}

function resolveOrientAngle(orient: string, pathAngleRad: number): number {
  if (orient === `auto` || orient === `auto-start-reverse`)
    return orient === `auto-start-reverse` ? pathAngleRad + Math.PI : pathAngleRad
  const parsed = Number.parseFloat(orient)
  return Number.isFinite(parsed) ? (parsed * Math.PI) / 180 : pathAngleRad
}

function getStrokeWidth(el: Element): number {
  const attr = el.getAttribute(`stroke-width`)
  if (attr)
    return Number.parseFloat(attr) || 1.5
  const style = el.getAttribute(`style`) ?? ``
  const match = style.match(/stroke-width:\s*([\d.]+)/)
  return match ? Number.parseFloat(match[1]) : 1.5
}

function getStrokeColor(el: Element): string {
  return el.getAttribute(`stroke`)
    ?? el.getAttribute(`fill`)
    ?? `#333333`
}

function appendFallbackArrow(
  host: Element,
  point: Point,
  angleRad: number,
  stroke: string,
  strokeWidth: number,
) {
  const size = Math.max(6, strokeWidth * 4)
  const tipX = point.x
  const tipY = point.y
  const leftX = tipX - size * Math.cos(angleRad - Math.PI / 6)
  const leftY = tipY - size * Math.sin(angleRad - Math.PI / 6)
  const rightX = tipX - size * Math.cos(angleRad + Math.PI / 6)
  const rightY = tipY - size * Math.sin(angleRad + Math.PI / 6)

  const polygon = document.createElementNS(SVG_NS, `polygon`)
  polygon.setAttribute(`points`, `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`)
  polygon.setAttribute(`fill`, stroke)
  polygon.setAttribute(`stroke`, `none`)
  host.parentElement?.insertBefore(polygon, host.nextSibling)
}

function appendMarkerAtPoint(
  svg: SVGSVGElement,
  spec: MarkerSpec,
  point: Point,
  angleRad: number,
  strokeWidth: number,
  stroke: string,
) {
  const orientAngle = resolveOrientAngle(spec.orient, angleRad)
  const scale = spec.markerUnits === `userSpaceOnUse`
    ? 1
    : Math.max(strokeWidth, 1)

  const group = document.createElementNS(SVG_NS, `g`)
  group.setAttribute(
    `transform`,
    `translate(${point.x}, ${point.y}) rotate(${(orientAngle * 180) / Math.PI}) scale(${scale}) translate(${-spec.refX}, ${-spec.refY})`,
  )

  const clones = cloneMarkerGraphics(spec)
  if (clones.length === 0) {
    appendFallbackArrow(svg as unknown as SVGGraphicsElement, point, angleRad, stroke, strokeWidth)
    return
  }

  clones.forEach((clone) => {
    if (!clone.getAttribute(`fill`) || clone.getAttribute(`fill`) === `context-fill`)
      clone.setAttribute(`fill`, stroke)
    if (!clone.getAttribute(`stroke`) || clone.getAttribute(`stroke`) === `context-stroke`)
      clone.setAttribute(`stroke`, stroke)
    group.appendChild(clone)
  })

  svg.appendChild(group)
}

function getLineAngleFromAttributes(el: Element, atStart: boolean): { point: Point, angle: number } | null {
  const x1 = el.getAttribute(`x1`)
  const y1 = el.getAttribute(`y1`)
  const x2 = el.getAttribute(`x2`)
  const y2 = el.getAttribute(`y2`)
  if (x1 == null || y1 == null || x2 == null || y2 == null)
    return null

  const startX = Number.parseFloat(x1)
  const startY = Number.parseFloat(y1)
  const endX = Number.parseFloat(x2)
  const endY = Number.parseFloat(y2)
  const point = { x: atStart ? startX : endX, y: atStart ? startY : endY }
  const angle = Math.atan2(endY - startY, endX - startX)
  return { point, angle: atStart ? angle + Math.PI : angle }
}

function getPathAngleFromElement(el: Element, atStart: boolean): { point: Point, angle: number } | null {
  const path = el as SVGPathElement
  if (typeof path.getTotalLength !== `function`)
    return null

  const length = path.getTotalLength()
  if (length <= 0)
    return null

  const epsilon = Math.min(5, length / 2)
  const rawPoint = atStart ? path.getPointAtLength(0) : path.getPointAtLength(length)
  const neighbor = atStart
    ? path.getPointAtLength(Math.min(length, epsilon))
    : path.getPointAtLength(Math.max(0, length - epsilon))
  const point = { x: rawPoint.x, y: rawPoint.y }
  const angle = Math.atan2(point.y - neighbor.y, point.x - neighbor.x)
  return { point, angle: atStart ? angle + Math.PI : angle }
}

function getMarkerGeometry(el: Element, atStart: boolean): { point: Point, angle: number } | null {
  if (el.localName === `path`)
    return getPathAngleFromElement(el, atStart)
  if (el.localName === `line`)
    return getLineAngleFromAttributes(el, atStart)
  return null
}

function expandMarkersOnElement(
  svg: SVGSVGElement,
  el: Element,
  markers: Map<string, MarkerSpec>,
) {
  const markerEndId = parseMarkerRef(el.getAttribute(`marker-end`) ?? el.getAttribute(`markerEnd`))
  const markerStartId = parseMarkerRef(el.getAttribute(`marker-start`) ?? el.getAttribute(`markerStart`))
  if (!markerEndId && !markerStartId)
    return

  const strokeWidth = getStrokeWidth(el)
  const stroke = getStrokeColor(el)

  const applyMarker = (markerId: string | null, atStart: boolean) => {
    if (!markerId)
      return

    const geometry = getMarkerGeometry(el, atStart)
    if (!geometry)
      return

    const spec = markers.get(markerId)
    if (spec) {
      appendMarkerAtPoint(svg, spec, geometry.point, geometry.angle, strokeWidth, stroke)
      return
    }

    appendFallbackArrow(el, geometry.point, geometry.angle, stroke, strokeWidth)
  }

  applyMarker(markerStartId, true)
  applyMarker(markerEndId, false)

  el.removeAttribute(`marker-end`)
  el.removeAttribute(`marker-start`)
  el.removeAttribute(`markerEnd`)
  el.removeAttribute(`markerStart`)
  el.removeAttribute(`marker-mid`)
  el.removeAttribute(`markerMid`)
}

function expandMarkers(svg: SVGSVGElement) {
  const defs = svg.querySelector(`defs`)
  const markers = defs ? collectMarkers(defs) : new Map<string, MarkerSpec>()

  svg.querySelectorAll(`path, line, polyline`).forEach((el) => {
    expandMarkersOnElement(svg, el, markers)
  })
}

function inlinePresentationAttributes(svg: SVGSVGElement) {
  svg.querySelectorAll(`*[class], path, line, polyline, polygon, rect, circle, ellipse, text`).forEach((node) => {
    if (!(node instanceof SVGElement))
      return

    const computed = window.getComputedStyle(node)
    if (computed.fill && computed.fill !== `none` && !node.hasAttribute(`fill`))
      node.setAttribute(`fill`, computed.fill)
    if (computed.stroke && computed.stroke !== `none` && !node.hasAttribute(`stroke`))
      node.setAttribute(`stroke`, computed.stroke)
    if (computed.strokeWidth && !node.hasAttribute(`stroke-width`))
      node.setAttribute(`stroke-width`, computed.strokeWidth)
    if (computed.opacity && computed.opacity !== `1` && !node.hasAttribute(`opacity`))
      node.setAttribute(`opacity`, computed.opacity)
  })
}

function parseViewBox(viewBox: string | null): { x: number, y: number, width: number, height: number } | null {
  if (!viewBox)
    return null
  const parts = viewBox.trim().split(/[\s,]+/).map(Number)
  if (parts.length !== 4 || parts.some(n => !Number.isFinite(n)))
    return null
  return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] }
}

function parsePixelAttribute(value: string | null): number | null {
  if (!value || value.endsWith(`%`))
    return null
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function resolveSvgPixelSize(svg: SVGSVGElement): { width: number, height: number } {
  const rect = svg.getBoundingClientRect()
  const viewBox = parseViewBox(svg.getAttribute(`viewBox`))
  const attrWidth = parsePixelAttribute(svg.getAttribute(`width`))
  const attrHeight = parsePixelAttribute(svg.getAttribute(`height`))

  let width = rect.width > 0 ? rect.width : (attrWidth ?? viewBox?.width ?? WECHAT_MAX_WIDTH_PX)
  let height = rect.height > 0 ? rect.height : (attrHeight ?? viewBox?.height ?? width * 0.75)

  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    const aspect = viewBox.height / viewBox.width
    if (rect.width <= 0 && !attrWidth) {
      width = viewBox.width
      height = viewBox.height
    }
    else if (Math.abs((height / width) - aspect) > 0.01) {
      height = width * aspect
    }
  }

  if (width > WECHAT_MAX_WIDTH_PX) {
    height = height * (WECHAT_MAX_WIDTH_PX / width)
    width = WECHAT_MAX_WIDTH_PX
  }

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  }
}

function fixSvgDimensions(svg: SVGSVGElement) {
  const { width, height } = resolveSvgPixelSize(svg)

  if (!svg.hasAttribute(`xmlns`))
    svg.setAttribute(`xmlns`, SVG_NS)

  svg.setAttribute(`width`, String(width))
  svg.setAttribute(`height`, String(height))
  svg.setAttribute(
    `style`,
    `display:block;width:${width}px;max-width:100%;height:auto;margin:0 auto;`,
  )
}

function fixMermaidDiagramContainer(container: HTMLElement) {
  container.setAttribute(
    `style`,
    `text-align:center;line-height:0;width:100%;max-width:${WECHAT_MAX_WIDTH_PX}px;margin:0 auto;overflow:hidden;`,
  )
}

function stripUnsupportedAttributes(svg: SVGSVGElement) {
  svg.querySelectorAll(`[clip-path], [clipPath]`).forEach((el) => {
    el.removeAttribute(`clip-path`)
    el.removeAttribute(`clipPath`)
  })

  svg.querySelectorAll(`style`).forEach(styleEl => styleEl.remove())
  svg.querySelectorAll(`defs`).forEach(defsEl => defsEl.remove())

  svg.querySelectorAll(`*`).forEach((el) => {
    el.removeAttribute(`id`)
    el.removeAttribute(`class`)
  })
  svg.removeAttribute(`id`)
  svg.removeAttribute(`class`)
}

/**
 * Adapt a Mermaid SVG for WeChat: inline markers, responsive sizing, strip defs/id/class.
 */
export function sanitizeMermaidSvgForWeChat(svg: SVGSVGElement) {
  expandMarkers(svg)
  inlinePresentationAttributes(svg)
  fixSvgDimensions(svg)
  stripUnsupportedAttributes(svg)
}

/**
 * Process all Mermaid diagrams under `root` (attaches temporarily for getComputedStyle).
 */
export function sanitizeMermaidDiagramsForWeChat(root: ParentNode) {
  const svgs = Array.from(root.querySelectorAll<SVGSVGElement>(`.mermaid-diagram svg`))
  if (svgs.length === 0)
    return

  const host = document.createElement(`div`)
  host.style.cssText = `position:fixed;left:-99999px;top:0;visibility:hidden;pointer-events:none;width:677px;`
  document.body.appendChild(host)

  try {
    for (const node of svgs) {
      const svg = node
      const parent = svg.parentElement
      host.appendChild(svg)
      sanitizeMermaidSvgForWeChat(svg)
      if (parent instanceof HTMLElement)
        fixMermaidDiagramContainer(parent)
      parent?.appendChild(svg)
    }
  }
  finally {
    host.remove()
  }
}
