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

function isPlantUmlDiagramSvg(svg: SVGSVGElement): boolean {
  if (svg.closest(`.plantuml-diagram`) != null)
    return true
  // PlantUML server embeds diagram type on the root <svg>.
  return svg.hasAttribute(`data-diagram-type`)
}

/** MathJax / formula SVGs rely on ids and defs; never run diagram sanitization on them. */
function isMathFormulaSvg(svg: SVGSVGElement): boolean {
  return svg.closest(`.katex-inline, .katex-block, mjx-container`) != null
}

const WECHAT_MATH_FILL = `#333333`

/** Keep MathJax SVG intact but force readable colors for WeChat paste. */
export function prepareMathFormulasForWeChat(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(`.katex-inline, .katex-block`).forEach((wrapper) => {
    wrapper.style.color = WECHAT_MATH_FILL
  })

  root.querySelectorAll<SVGSVGElement>(`.katex-inline svg, .katex-block svg, mjx-container svg`).forEach((svg) => {
    svg.style.color = WECHAT_MATH_FILL
    if (!svg.getAttribute(`fill`) || svg.getAttribute(`fill`) === `currentColor`)
      svg.setAttribute(`fill`, WECHAT_MATH_FILL)

    svg.querySelectorAll<SVGElement>(`path, rect, use, g`).forEach((node) => {
      const fill = node.getAttribute(`fill`)
      if (fill === `currentColor` || fill === `#fff` || fill === `#ffffff` || fill === `white`)
        node.setAttribute(`fill`, WECHAT_MATH_FILL)
      const stroke = node.getAttribute(`stroke`)
      if (stroke === `currentColor` || stroke === `#fff` || stroke === `#ffffff` || stroke === `white`)
        node.setAttribute(`stroke`, WECHAT_MATH_FILL)
    })
  })
}

function isHiddenPlantUmlHelper(el: Element): boolean {
  const fillOpacity = el.getAttribute(`fill-opacity`)
  if (fillOpacity !== null && Number.parseFloat(fillOpacity) === 0)
    return true
  const opacity = el.getAttribute(`opacity`)
  if (opacity !== null && Number.parseFloat(opacity) === 0)
    return true
  return false
}

/** Trim PlantUML viewBox padding using real geometry (browser only). */
function tightenPlantUmlViewBox(svg: SVGSVGElement): boolean {
  if (typeof SVGGraphicsElement === `undefined`)
    return false

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let hasContent = false

  svg.querySelectorAll(`path, line, rect, circle, ellipse, polygon, polyline, text, image, use`).forEach((el) => {
    if (!(el instanceof SVGGraphicsElement) || isHiddenPlantUmlHelper(el))
      return

    try {
      const box = el.getBBox()
      if (box.width <= 0 && box.height <= 0)
        return
      hasContent = true
      minX = Math.min(minX, box.x)
      minY = Math.min(minY, box.y)
      maxX = Math.max(maxX, box.x + box.width)
      maxY = Math.max(maxY, box.y + box.height)
    }
    catch {}
  })

  if (!hasContent) {
    try {
      const rootBox = svg.getBBox()
      if (rootBox.width > 0 && rootBox.height > 0) {
        minX = rootBox.x
        minY = rootBox.y
        maxX = rootBox.x + rootBox.width
        maxY = rootBox.y + rootBox.height
        hasContent = true
      }
    }
    catch {}
  }

  if (!hasContent)
    return false

  const pad = 2
  minX -= pad
  minY -= pad
  const width = Math.max(1, maxX + pad - minX)
  const height = Math.max(1, maxY + pad - minY)

  svg.setAttribute(`viewBox`, `${minX} ${minY} ${width} ${height}`)
  return true
}

function mergeSvgStyle(svg: SVGSVGElement, declarations: string[]) {
  const keys = new Set(declarations.map(d => d.split(`:`)[0]?.trim()).filter(Boolean))
  const kept = (svg.getAttribute(`style`) ?? ``)
    .split(`;`)
    .map(part => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const key = part.split(`:`)[0]?.trim()
      return key && !keys.has(key)
    })

  svg.setAttribute(`style`, `${[...kept, ...declarations].join(`; `)};`)
}

function applyPlantUmlSvgDisplay(
  svg: SVGSVGElement,
  width: number,
  height: number,
  mode: `inline` | `scroll` = `inline`,
) {
  if (mode === `scroll`) {
    mergeSvgStyle(svg, [
      `display: block`,
      `vertical-align: top`,
      `width: 100%`,
      `height: ${height}px`,
      `max-width: none`,
    ])
    return
  }

  mergeSvgStyle(svg, [
    `display: block`,
    `vertical-align: top`,
    `width: 100%`,
    `max-width: ${width}px`,
    `height: auto`,
  ])
}

/** PlantUML strips root width/height; viewBox units match pixel dimensions. */
function resolvePlantUmlPixelSize(svg: SVGSVGElement): { width: number, height: number } {
  const viewBox = parseViewBox(svg.getAttribute(`viewBox`))
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    return {
      width: Math.max(1, Math.round(viewBox.width)),
      height: Math.max(1, Math.round(viewBox.height)),
    }
  }

  const attrWidth = parsePixelAttribute(svg.getAttribute(`width`))
  const attrHeight = parsePixelAttribute(svg.getAttribute(`height`))
  if (attrWidth && attrHeight)
    return { width: attrWidth, height: attrHeight }

  const rect = svg.getBoundingClientRect()
  const width = attrWidth ?? viewBox?.width ?? (rect.width > 0 ? rect.width : WECHAT_MAX_WIDTH_PX)
  let height = attrHeight ?? viewBox?.height ?? (rect.height > 0 ? rect.height : width * 0.75)

  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    const aspect = viewBox.height / viewBox.width
    if (Math.abs((height / width) - aspect) > 0.01)
      height = width * aspect
  }

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  }
}

function fixPlantUmlDimensions(svg: SVGSVGElement): { width: number, height: number } {
  const { width, height } = resolvePlantUmlPixelSize(svg)

  if (!svg.hasAttribute(`xmlns`))
    svg.setAttribute(`xmlns`, SVG_NS)

  svg.setAttribute(`width`, String(width))
  svg.setAttribute(`height`, String(height))
  svg.setAttribute(`preserveAspectRatio`, `xMidYMid meet`)
  return { width, height }
}

function normalizePlantUmlContainer(container: HTMLElement) {
  container.setAttribute(
    `style`,
    `box-sizing: border-box; width: 100%; margin: 0; padding: 0; line-height: 0; font-size: 0;`,
  )
}

/**
 * WeChat horizontal scroll — same nested <section> pattern as markedSlider().
 * @see packages/core/src/extensions/slider.ts
 */
function wrapWidePlantUmlSvg(svg: SVGSVGElement) {
  const width = Number.parseFloat(svg.getAttribute(`width`) ?? `0`)
  const height = Number.parseFloat(svg.getAttribute(`height`) ?? `0`)
  if (width <= WECHAT_MAX_WIDTH_PX)
    return

  const parent = svg.parentNode
  if (!parent)
    return

  const outer = document.createElement(`section`)
  outer.setAttribute(
    `style`,
    `box-sizing: border-box; width: 100%; margin: 0; padding: 0; line-height: 0; font-size: 0;`,
  )

  const scroll = document.createElement(`section`)
  scroll.setAttribute(
    `style`,
    `overflow-x: scroll; overflow-y: hidden; -webkit-overflow-scrolling: touch; white-space: nowrap; width: 100%; font-size: 0; line-height: 0;${height > 0 ? ` height: ${height}px;` : ``}`,
  )

  const inner = document.createElement(`section`)
  inner.setAttribute(
    `style`,
    `display: inline-block; width: ${width}px;${height > 0 ? ` height: ${height}px;` : ``} vertical-align: top; line-height: 0; font-size: 0;`,
  )

  const hint = document.createElement(`p`)
  hint.setAttribute(
    `style`,
    `font-size: 14px; color: #999; text-align: center; margin-top: 5px; margin-bottom: 0; white-space: normal;`,
  )
  hint.textContent = `<<< 左右滑动看更多 >>>`

  applyPlantUmlSvgDisplay(svg, width, height, `scroll`)

  parent.insertBefore(outer, svg)
  inner.appendChild(svg)
  scroll.appendChild(inner)
  outer.appendChild(scroll)
  outer.appendChild(hint)
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

export interface SanitizeSvgOptions {
  /** Keep natural width and wrap with horizontal scroll when wider than the article column. */
  plantuml?: boolean
}

/**
 * Adapt an SVG for WeChat: inline markers, explicit pixel sizing, strip defs/id/class.
 */
export function sanitizeSvgForWeChat(svg: SVGSVGElement, options?: SanitizeSvgOptions) {
  const isPlantuml = options?.plantuml ?? isPlantUmlDiagramSvg(svg)

  expandMarkers(svg)
  inlinePresentationAttributes(svg)

  if (isPlantuml) {
    tightenPlantUmlViewBox(svg)
    const size = fixPlantUmlDimensions(svg)
    if (size.width <= WECHAT_MAX_WIDTH_PX)
      applyPlantUmlSvgDisplay(svg, size.width, size.height)
  }
  else {
    fixSvgDimensions(svg)
  }

  stripUnsupportedAttributes(svg)
}

/**
 * Process all SVG elements under `root` (attaches temporarily for getComputedStyle).
 */
export function sanitizeSvgsForWeChat(root: ParentNode) {
  const svgs = Array.from(root.querySelectorAll<SVGSVGElement>(`svg`))
  if (svgs.length === 0)
    return

  const host = document.createElement(`div`)
  host.style.cssText = `position:fixed;left:-99999px;top:0;visibility:hidden;pointer-events:none;width:677px;`
  document.body.appendChild(host)

  try {
    for (const node of svgs) {
      const svg = node
      if (isMathFormulaSvg(svg))
        continue

      const parent = svg.parentElement
      const nextSibling = svg.nextSibling
      const isPlantuml = isPlantUmlDiagramSvg(svg)
      host.appendChild(svg)
      sanitizeSvgForWeChat(svg, { plantuml: isPlantuml })
      if (parent)
        parent.insertBefore(svg, nextSibling)
      if (isPlantuml) {
        const container = svg.closest(`.plantuml-diagram`) as HTMLElement | null
        if (container)
          normalizePlantUmlContainer(container)
        wrapWidePlantUmlSvg(svg)
      }
    }
  }
  finally {
    host.remove()
  }
}
