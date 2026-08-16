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
    ?? `currentColor`
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

function findSvgElementById(svg: SVGSVGElement, id: string): Element | null {
  const byApi = typeof svg.getElementById === `function` ? svg.getElementById(id) : null
  if (byApi)
    return byApi
  try {
    return svg.querySelector(`#${CSS.escape(id)}`)
  }
  catch {
    return null
  }
}

function stopColorOf(stop: Element): string | null {
  return stop.getAttribute(`stop-color`)
    || stop.getAttribute(`style`)?.match(/stop-color:\s*([^;]+)/i)?.[1]?.trim()
    || null
}

function mixCssColors(a: string, b: string): string | null {
  const pa = parseCssColor(a)
  const pb = parseCssColor(b)
  if (!pa)
    return pb ? b : null
  if (!pb)
    return a
  return `rgb(${Math.round((pa[0] + pb[0]) / 2)}, ${Math.round((pa[1] + pb[1]) / 2)}, ${Math.round((pa[2] + pb[2]) / 2)})`
}

/** WeChat strips defs/id, so url(#gradient) paints vanish. Bake a solid stand-in. */
function solidColorFromPaintServer(svg: SVGSVGElement, paint: string): string | null {
  const id = parseMarkerRef(paint)
  if (!id)
    return null
  const ref = findSvgElementById(svg, id)
  if (!ref)
    return null
  if (ref.localName !== `linearGradient` && ref.localName !== `radialGradient`)
    return null
  const colors = Array.from(ref.querySelectorAll(`stop`))
    .map(stopColorOf)
    .filter((color): color is string => !!color)
  if (colors.length === 0)
    return null
  if (colors.length === 1)
    return colors[0]
  return mixCssColors(colors[0], colors[colors.length - 1]) ?? colors[0]
}

function resolveUrlPaints(svg: SVGSVGElement) {
  const apply = (el: Element, attr: `fill` | `stroke`) => {
    const value = el.getAttribute(attr)
    if (!value?.includes(`url(`))
      return
    const solid = solidColorFromPaintServer(svg, value)
    if (solid)
      el.setAttribute(attr, solid)
  }

  svg.querySelectorAll(`*`).forEach((el) => {
    apply(el, `fill`)
    apply(el, `stroke`)

    const style = el.getAttribute(`style`)
    if (!style?.includes(`url(`))
      return
    const next = style.replace(/(fill|stroke)\s*:\s*([^;]+)/gi, (full, prop: string, value: string) => {
      if (!value.includes(`url(`))
        return full
      const solid = solidColorFromPaintServer(svg, value.trim())
      return solid ? `${prop}: ${solid}` : full
    })
    if (next !== style)
      el.setAttribute(`style`, next)
  })
}

/** Architecture / Iconify icons often land as <use href="#id"> into defs. */
function expandUseElements(svg: SVGSVGElement) {
  Array.from(svg.querySelectorAll(`use`)).forEach((useEl) => {
    const href = useEl.getAttribute(`href`) || useEl.getAttribute(`xlink:href`)
    const id = parseMarkerRef(href)
    if (!id) {
      useEl.remove()
      return
    }

    const ref = findSvgElementById(svg, id)
    if (!ref) {
      useEl.remove()
      return
    }

    const group = document.createElementNS(SVG_NS, `g`)
    const x = Number.parseFloat(useEl.getAttribute(`x`) ?? `0`) || 0
    const y = Number.parseFloat(useEl.getAttribute(`y`) ?? `0`) || 0
    const transforms: string[] = []
    if (x || y)
      transforms.push(`translate(${x}, ${y})`)
    const existing = useEl.getAttribute(`transform`)
    if (existing)
      transforms.push(existing)
    if (transforms.length)
      group.setAttribute(`transform`, transforms.join(` `))

    const takeChildren = ref.localName === `symbol` || ref.localName === `svg` || ref.localName === `g`
    if (takeChildren) {
      Array.from(ref.childNodes).forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE && (child as Element).localName === `defs`)
          return
        group.appendChild(child.cloneNode(true))
      })
    }
    else {
      const clone = ref.cloneNode(true) as Element
      clone.removeAttribute(`id`)
      group.appendChild(clone)
    }

    for (const attr of [`fill`, `stroke`, `stroke-width`, `opacity`]) {
      const value = useEl.getAttribute(attr)
      if (value)
        group.setAttribute(attr, value)
    }

    useEl.parentNode?.replaceChild(group, useEl)
  })
}

const PAINTED_SHAPES = `path, line, polyline, polygon, rect, circle, ellipse, text, tspan`

function isNonePaint(value: string | null | undefined): boolean {
  return !!value && value.trim().toLowerCase() === `none`
}

function isUsablePaint(value: string | null | undefined): value is string {
  if (!value)
    return false
  const normalized = value.trim().toLowerCase()
  return normalized !== `` && normalized !== `none` && !normalized.includes(`url(`)
}

function removeStyleProperties(el: Element, keys: string[]) {
  const style = el.getAttribute(`style`)
  if (!style)
    return

  const drop = new Set(keys.map(key => key.toLowerCase()))
  const next = style
    .split(`;`)
    .map(part => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const key = part.split(`:`)[0]?.trim().toLowerCase()
      return !!key && !drop.has(key)
    })
    .join(`; `)

  if (next)
    el.setAttribute(`style`, next)
  else
    el.removeAttribute(`style`)
}

function paintFromStyle(node: Element, attr: string): string | null {
  const style = node.getAttribute(`style`)
  if (!style)
    return null
  const match = style.match(new RegExp(`(?:^|;)\\s*${attr}\\s*:\\s*([^;]+)`, `i`))
  return match?.[1]?.trim() || null
}

function bakePaint(node: Element, attr: `fill` | `stroke`, computedValue: string) {
  const explicit = node.getAttribute(attr)
  const fromStyle = paintFromStyle(node, attr)

  // Explicit / inlined `none` wins over juice painting edge paths as solid blobs.
  if (isNonePaint(explicit) || isNonePaint(fromStyle)) {
    node.setAttribute(attr, `none`)
    removeStyleProperties(node, [attr])
    return
  }

  if (isUsablePaint(explicit)) {
    removeStyleProperties(node, [attr])
    return
  }

  if (isUsablePaint(fromStyle)) {
    node.setAttribute(attr, fromStyle)
    removeStyleProperties(node, [attr])
    return
  }

  if (isNonePaint(computedValue)) {
    node.setAttribute(attr, `none`)
    return
  }

  if (isUsablePaint(computedValue))
    node.setAttribute(attr, computedValue)
}

function paintFromColorStyle(node: Element): string | null {
  const style = node.getAttribute(`style`)
  if (!style)
    return null
  const match = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)
  return match?.[1]?.trim() || null
}

/** Text must not inherit the entity/node box fill, or ER/class titles vanish. */
function bakeTextPaint(node: Element) {
  const explicit = node.getAttribute(`fill`)
  const fromStyle = paintFromStyle(node, `fill`)
  const fromColor = paintFromColorStyle(node)

  if (isNonePaint(explicit) || isNonePaint(fromStyle)) {
    node.setAttribute(`fill`, `none`)
    removeStyleProperties(node, [`fill`])
    return
  }
  if (isUsablePaint(explicit)) {
    removeStyleProperties(node, [`fill`])
    return
  }
  if (isUsablePaint(fromStyle)) {
    node.setAttribute(`fill`, fromStyle)
    removeStyleProperties(node, [`fill`])
    return
  }
  if (isUsablePaint(fromColor)) {
    node.setAttribute(`fill`, fromColor)
    return
  }

  const computedColor = window.getComputedStyle(node).color
  if (isUsablePaint(computedColor))
    node.setAttribute(`fill`, computedColor)
}

function bakeHtmlLabelColors(svg: SVGSVGElement) {
  svg.querySelectorAll(`foreignObject section, foreignObject span, foreignObject div, foreignObject p`).forEach((el) => {
    const style = el.getAttribute(`style`) ?? ``
    if (/(?:^|;)\s*color\s*:/i.test(style))
      return
    const color = window.getComputedStyle(el).color
    if (!isUsablePaint(color))
      return
    el.setAttribute(`style`, `${style}${style ? `; ` : ``}color: ${color}`)
  })
}

function inlinePresentationAttributes(svg: SVGSVGElement) {
  svg.querySelectorAll(PAINTED_SHAPES).forEach((node) => {
    if (!(node instanceof SVGElement))
      return

    const computed = window.getComputedStyle(node)
    const isText = node.localName === `text` || node.localName === `tspan`
    if (isText)
      bakeTextPaint(node)
    else
      bakePaint(node, `fill`, computed.fill)

    if (isText) {
      if (!node.getAttribute(`stroke`) && !paintFromStyle(node, `stroke`))
        node.setAttribute(`stroke`, `none`)
    }
    else {
      bakePaint(node, `stroke`, computed.stroke)
    }

    if (computed.strokeWidth && !node.hasAttribute(`stroke-width`))
      node.setAttribute(`stroke-width`, computed.strokeWidth)

    if (computed.fontSize && isText && !node.hasAttribute(`font-size`))
      node.setAttribute(`font-size`, computed.fontSize)

    if (computed.opacity && computed.opacity !== `1` && !node.hasAttribute(`opacity`))
      node.setAttribute(`opacity`, computed.opacity)

    const strokeOpacity = computed.getPropertyValue(`stroke-opacity`) || computed.strokeOpacity
    const effectiveStroke = node.getAttribute(`stroke`)
    if (
      strokeOpacity
      && strokeOpacity !== `1`
      && !node.hasAttribute(`stroke-opacity`)
      && effectiveStroke
      && effectiveStroke !== `none`
    ) {
      node.setAttribute(`stroke-opacity`, strokeOpacity)
    }
  })

  // Juice often inlines fills onto <g>; after leaves have explicit paints, drop group
  // fills so WeChat inheritance cannot re-color edge paths.
  svg.querySelectorAll(`g`).forEach((group) => {
    removeStyleProperties(group, [`fill`, `stroke`])
    group.removeAttribute(`fill`)
    group.removeAttribute(`stroke`)
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

/**
 * Parse #rgb / #rrggbb / rgb() / rgba() / named black|white into [r,g,b].
 * Returns null for currentColor, none, url(...), or unparseable values.
 */
function parseCssColor(value: string): [number, number, number] | null {
  const raw = value.trim().toLowerCase()
  if (!raw || raw === `none` || raw === `currentcolor` || raw === `transparent` || raw.startsWith(`url(`))
    return null
  if (raw === `black`)
    return [0, 0, 0]
  if (raw === `white`)
    return [255, 255, 255]

  const hex = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const h = hex[1]
    if (h.length === 3) {
      return [
        Number.parseInt(h[0] + h[0], 16),
        Number.parseInt(h[1] + h[1], 16),
        Number.parseInt(h[2] + h[2], 16),
      ]
    }
    return [
      Number.parseInt(h.slice(0, 2), 16),
      Number.parseInt(h.slice(2, 4), 16),
      Number.parseInt(h.slice(4, 6), 16),
    ]
  }

  const rgb = raw.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/)
  if (rgb) {
    return [
      Math.min(255, Number.parseFloat(rgb[1])),
      Math.min(255, Number.parseFloat(rgb[2])),
      Math.min(255, Number.parseFloat(rgb[3])),
    ]
  }

  return null
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/** True for near-gray colors (text/line ink), false for chromatic borders/fills. */
function isNearGrayscale([r, g, b]: [number, number, number]): boolean {
  return Math.max(r, g, b) - Math.min(r, g, b) <= 24
}

/**
 * Dark grayscale ink (text / default edges) that becomes unreadable on WeChat
 * dark-mode page background. Chromatic colors (e.g. Mermaid node borders) are kept.
 */
function isDarkInkColor(value: string): boolean {
  const rgb = parseCssColor(value)
  if (!rgb || !isNearGrayscale(rgb))
    return false
  return relativeLuminance(rgb) < 0.35
}

function remapPresentationColor(value: string | null): string | null {
  if (!value)
    return null
  if (value.trim().toLowerCase() === `currentcolor` || isDarkInkColor(value))
    return `currentColor`
  return null
}

function remapSvgNodeInkToCurrentColor(node: Element) {
  for (const attr of [`fill`, `stroke`] as const) {
    const remapped = remapPresentationColor(node.getAttribute(attr))
    if (remapped)
      node.setAttribute(attr, remapped)
  }

  const style = node.getAttribute(`style`)
  if (!style)
    return

  let changed = false
  const next = style
    .split(`;`)
    .map(part => part.trim())
    .filter(Boolean)
    .map((part) => {
      const colon = part.indexOf(`:`)
      if (colon === -1)
        return part
      const key = part.slice(0, colon).trim().toLowerCase()
      if (key !== `fill` && key !== `stroke`)
        return part
      const val = part.slice(colon + 1).trim()
      const remapped = remapPresentationColor(val)
      if (!remapped)
        return part
      changed = true
      return `${key}: ${remapped}`
    })
    .join(`; `)

  if (changed)
    node.setAttribute(`style`, `${next};`)
}

/**
 * Keep MathJax SVG intact; use currentColor so glyphs follow WeChat text color
 * (including reader dark mode). Do not bake in #333333.
 */
export function prepareMathFormulasForWeChat(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(`.katex-inline, .katex-block`).forEach((wrapper) => {
    wrapper.style.removeProperty(`color`)
  })

  root.querySelectorAll<SVGSVGElement>(`.katex-inline svg, .katex-block svg, mjx-container svg`).forEach((svg) => {
    svg.style.removeProperty(`color`)
    const fill = svg.getAttribute(`fill`)
    if (!fill || fill === `currentColor` || isDarkInkColor(fill))
      svg.setAttribute(`fill`, `currentColor`)

    svg.querySelectorAll(`path, rect, use, g`).forEach(remapSvgNodeInkToCurrentColor)
  })
}

/**
 * Remap dark fill/stroke on diagram SVGs to currentColor so Mermaid / PlantUML /
 * infographic ink stays readable when WeChat reader is in dark mode.
 */
function isDiagramTextNode(node: Element): boolean {
  return node.localName === `text`
    || node.localName === `tspan`
    || node.closest(`foreignObject`) != null
}

export function remapDiagramInkToCurrentColor(svg: SVGSVGElement) {
  if (!isDiagramTextNode(svg))
    remapSvgNodeInkToCurrentColor(svg)
  svg.querySelectorAll(`*`).forEach((node) => {
    if (!isDiagramTextNode(node))
      remapSvgNodeInkToCurrentColor(node)
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

function parseStyleMaxWidthPx(svg: SVGSVGElement): number | null {
  const match = (svg.getAttribute(`style`) ?? ``).match(/max-width:\s*([\d.]+)px/i)
  if (!match)
    return null
  const width = Number.parseFloat(match[1])
  return Number.isFinite(width) && width > 0 ? width : null
}

/** Keep Mermaid’s layout size so WeChat cannot scale boxes without the labels. */
function resolveMermaidPixelSize(svg: SVGSVGElement): { width: number, height: number } {
  const viewBox = parseViewBox(svg.getAttribute(`viewBox`))
  const maxWidth = parseStyleMaxWidthPx(svg)
  const attrWidth = parsePixelAttribute(svg.getAttribute(`width`))
  let width = maxWidth ?? viewBox?.width ?? attrWidth ?? WECHAT_MAX_WIDTH_PX
  let height = viewBox && viewBox.width > 0
    ? width * (viewBox.height / viewBox.width)
    : (parsePixelAttribute(svg.getAttribute(`height`)) ?? width * 0.75)

  if (width > WECHAT_MAX_WIDTH_PX) {
    height = height * (WECHAT_MAX_WIDTH_PX / width)
    width = WECHAT_MAX_WIDTH_PX
  }

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  }
}

function fixMermaidDimensions(svg: SVGSVGElement): { width: number, height: number } {
  const size = resolveMermaidPixelSize(svg)
  if (!svg.hasAttribute(`xmlns`))
    svg.setAttribute(`xmlns`, SVG_NS)
  svg.setAttribute(`width`, String(size.width))
  svg.setAttribute(`height`, String(size.height))
  svg.setAttribute(`preserveAspectRatio`, `xMidYMid meet`)
  return size
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

const MIN_DIAGRAM_FONT_PX = 9

const DOMINANT_BASELINE_DY: Record<string, string> = {
  'alphabetic': ``,
  'central': `0.35em`,
  'middle': `0.35em`,
  'hanging': `-0.55em`,
  'ideographic': `0.18em`,
  'text-before-edge': `-0.85em`,
  'text-after-edge': `0.15em`,
}

function convertDominantBaselineToDy(svg: SVGSVGElement) {
  svg.querySelectorAll(`text, tspan`).forEach((el) => {
    const baseline = el.getAttribute(`dominant-baseline`)
    if (!baseline)
      return
    el.removeAttribute(`dominant-baseline`)
    const em = DOMINANT_BASELINE_DY[baseline]
    if (!em || el.getAttribute(`dy`))
      return
    const fontSize = parseCssNumber(el.getAttribute(`font-size`) || window.getComputedStyle(el).fontSize || `16`)?.n ?? 16
    const factor = Number.parseFloat(em)
    if (Number.isFinite(factor))
      el.setAttribute(`dy`, String(Math.round(fontSize * factor * 10) / 10))
  })
}

function isMermaidDiagramSvg(svg: SVGSVGElement, mermaid = false): boolean {
  return mermaid || svg.closest(`.mermaid-diagram`) != null
}

function parseCssNumber(value: string): { n: number, unit: string } | null {
  const match = value.trim().match(/^(-?[\d.]+)(px|pt|em|rem|%)?$/i)
  if (!match)
    return null
  const n = Number.parseFloat(match[1])
  if (!Number.isFinite(n) || n <= 0)
    return null
  return { n, unit: (match[2] || ``).toLowerCase() }
}

function scaleFontSizeValue(value: string, viewScale: number, labelScale: number): string | null {
  const parsed = parseCssNumber(value)
  if (!parsed || parsed.unit === `%` || parsed.unit === `em` || parsed.unit === `rem`)
    return null
  const scale = parsed.unit === `em` || parsed.unit === `rem`
    ? labelScale
    : viewScale * labelScale
  const next = Math.max(MIN_DIAGRAM_FONT_PX, Math.round(parsed.n * scale * 10) / 10)
  return parsed.unit ? `${next}${parsed.unit}` : String(next)
}

function scaleFontSizeInStyle(style: string, viewScale: number, labelScale: number): string {
  return style.replace(/(^|;)\s*font-size\s*:\s*([^;]*)/gi, (full, prefix: string, value: string) => {
    const scaled = scaleFontSizeValue(value, viewScale, labelScale)
    return scaled ? `${prefix} font-size: ${scaled}` : full
  })
}

function collectForeignObjectLines(fo: Element): string[] {
  const html = fo.innerHTML
  if (/<br\s*\/?>/i.test(html)) {
    return html
      .split(/<br\s*\/?>/i)
      .map(part => part.replace(/<[^>]+>/g, ``).replace(/&nbsp;/gi, ` `).trim())
      .filter(Boolean)
  }

  const text = (fo.textContent || ``).replace(/\u00A0/g, ` `)
  const lines = text.split(/\n/).map(part => part.trim()).filter(Boolean)
  if (lines.length)
    return lines
  const compact = text.replace(/\s+/g, ` `).trim()
  return compact ? [compact] : []
}

function parseTranslate(transform: string | null): { x: number, y: number } | null {
  if (!transform)
    return { x: 0, y: 0 }
  const match = transform.match(/translate\(\s*([-\d.eE]+)(?:[\s,]+([-\d.eE]+))?\s*\)/)
  if (!match)
    return null
  return {
    x: Number.parseFloat(match[1]) || 0,
    y: Number.parseFloat(match[2] || `0`) || 0,
  }
}

function estimateLabelWidth(text: string, fontSize: number): number {
  let width = 0
  for (const ch of text) {
    width += /[\u1100-\uD7FF\uF900-\uFAFF]/.test(ch) ? fontSize : fontSize * 0.55
  }
  return width
}

function isTransparentPaint(value: string | null | undefined): boolean {
  if (!value)
    return true
  const normalized = value.trim().toLowerCase()
  return normalized === `` || normalized === `transparent` || normalized === `none`
    || /^rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)$/.test(normalized)
}

function edgeLabelBackground(styled: Element): string {
  const fromStyle = (styled.getAttribute(`style`) ?? ``).match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i)?.[1]?.trim()
  if (fromStyle && !isTransparentPaint(fromStyle) && isUsablePaint(fromStyle))
    return fromStyle
  try {
    const computed = window.getComputedStyle(styled).backgroundColor
    if (computed && !isTransparentPaint(computed) && isUsablePaint(computed))
      return computed
  }
  catch {}
  return `#e8e8e8`
}

/**
 * Bidirectional state/flowchart edges share a path midpoint, so "条件 2" / "返回"
 * land on the same point after FO flatten. Nudge overlapping edgeLabels apart.
 */
function separateOverlappingMermaidEdgeLabels(svg: SVGSVGElement) {
  const labels = Array.from(svg.querySelectorAll(`g.edgeLabel`))
  if (labels.length < 2)
    return

  const items = labels.map((el) => {
    const pos = parseTranslate(el.getAttribute(`transform`)) ?? { x: 0, y: 0 }
    const text = el.querySelector(`text`)
    const fontSize = parseCssNumber(text?.getAttribute(`font-size`) || `16`)?.n ?? 16
    const rect = el.querySelector(`rect`)
    const rectWidth = Number.parseFloat(rect?.getAttribute(`width`) ?? `0`) || 0
    const content = (text?.textContent ?? ``).replace(/\s+/g, ` `).trim()
    const width = rectWidth > 0 ? rectWidth : Math.max(16, estimateLabelWidth(content, fontSize))
    return { el, x: pos.x, y: pos.y, halfW: width / 2 }
  })

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]
      const b = items[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.hypot(dx, dy)
      const need = a.halfW + b.halfW + 8
      if (dist >= need)
        continue

      let dirX = 1
      let dirY = 0
      if (dist >= 1) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          dirX = dx / dist
          dirY = 0
        }
        else {
          dirX = 0
          dirY = dy / dist
        }
      }

      const extra = (need - dist) / 2
      nudgeEdgeLabel(a, -dirX * extra, -dirY * extra)
      nudgeEdgeLabel(b, dirX * extra, dirY * extra)
    }
  }
}

function nudgeEdgeLabel(
  item: { el: Element, x: number, y: number },
  nx: number,
  ny: number,
) {
  item.x += nx
  item.y += ny
  const raw = item.el.getAttribute(`transform`) ?? ``
  if (/translate\(/.test(raw)) {
    item.el.setAttribute(
      `transform`,
      raw.replace(
        /translate\(\s*([-\d.eE]+)(?:[\s,]+([-\d.eE]+))?\s*\)/,
        `translate(${roundSvg(item.x)}, ${roundSvg(item.y)})`,
      ),
    )
    return
  }
  item.el.setAttribute(
    `transform`,
    `translate(${roundSvg(item.x)}, ${roundSvg(item.y)})${raw ? ` ${raw}` : ``}`,
  )
}

function roundSvg(n: number): number {
  return Math.round(n * 10) / 10
}

/**
 * WeChat drops / mis-paints HTML inside foreignObject (ER, requirement, flowchart).
 * Convert labels to real SVG text so fill and font-size survive paste.
 */
function flattenMermaidHtmlLabels(svg: SVGSVGElement, mermaid = false) {
  if (!isMermaidDiagramSvg(svg, mermaid))
    return

  svg.querySelectorAll(`foreignObject`).forEach((fo) => {
    const lines = collectForeignObjectLines(fo)
    if (lines.length === 0) {
      fo.remove()
      return
    }

    const x = Number.parseFloat(fo.getAttribute(`x`) ?? `0`) || 0
    const y = Number.parseFloat(fo.getAttribute(`y`) ?? `0`) || 0
    const width = Number.parseFloat(fo.getAttribute(`width`) ?? `0`) || 0
    const height = Number.parseFloat(fo.getAttribute(`height`) ?? `0`) || 0
    const styled = fo.querySelector(`[style], section, div, span, p`) ?? fo
    const color = paintFromColorStyle(styled)
      || paintFromStyle(styled, `fill`)
      || window.getComputedStyle(styled).color
      || `#333333`
    const fontSize = parseCssNumber(
      paintFromStyle(styled, `font-size`) || window.getComputedStyle(styled).fontSize || `16`,
    )?.n ?? 16
    const style = `${styled.getAttribute(`style`) ?? ``} ${window.getComputedStyle(styled).textAlign}`
    const centered = /center/i.test(style) && width > 0
    const inEdgeLabel = fo.closest(`.edgeLabel`) != null
    const foTransform = fo.getAttribute(`transform`)

    const text = document.createElementNS(SVG_NS, `text`)
    const textX = centered ? x + width / 2 : x
    // HTML in foreignObject is top-aligned; WeChat uses alphabetic baseline (no em dy).
    const textY = y + (height > 0 ? Math.min(fontSize, height * 0.8) : fontSize * 0.8)
    text.setAttribute(`x`, String(textX))
    text.setAttribute(`y`, String(textY))
    text.setAttribute(`fill`, isUsablePaint(color) ? color : `#333333`)
    text.setAttribute(`stroke`, `none`)
    text.setAttribute(`font-size`, String(fontSize))
    text.setAttribute(`text-anchor`, centered ? `middle` : `start`)

    if (lines.length === 1) {
      text.textContent = lines[0]
    }
    else {
      lines.forEach((line, index) => {
        const tspan = document.createElementNS(SVG_NS, `tspan`)
        tspan.setAttribute(`x`, String(textX))
        tspan.setAttribute(`dy`, index === 0 ? `0` : `1.2em`)
        tspan.setAttribute(`fill`, isUsablePaint(color) ? color : `#333333`)
        tspan.textContent = line
        text.appendChild(tspan)
      })
    }

    const parent = fo.parentNode
    if (!parent) {
      fo.remove()
      return
    }

    const needsBackdrop = inEdgeLabel && width > 0 && height > 0
    if (!foTransform && !needsBackdrop) {
      parent.replaceChild(text, fo)
      return
    }

    const replacement = document.createElementNS(SVG_NS, `g`)
    if (foTransform)
      replacement.setAttribute(`transform`, foTransform)

    if (needsBackdrop) {
      const rect = document.createElementNS(SVG_NS, `rect`)
      rect.setAttribute(`x`, String(x))
      rect.setAttribute(`y`, String(y))
      rect.setAttribute(`width`, String(width))
      rect.setAttribute(`height`, String(height))
      rect.setAttribute(`fill`, edgeLabelBackground(styled))
      rect.setAttribute(`stroke`, `none`)
      replacement.appendChild(rect)
    }
    replacement.appendChild(text)
    parent.replaceChild(replacement, fo)
  })

  separateOverlappingMermaidEdgeLabels(svg)
}

/** Keep baked label sizes readable after WeChat shrinks a wide viewBox. */
function clampMermaidFontSizes(svg: SVGSVGElement, mermaid = false) {
  if (!isMermaidDiagramSvg(svg, mermaid))
    return

  svg.querySelectorAll(`text, tspan`).forEach((el) => {
    const attr = el.getAttribute(`font-size`)
    if (attr) {
      const clamped = scaleFontSizeValue(attr, 1, 1)
      if (clamped)
        el.setAttribute(`font-size`, clamped)
      return
    }

    const style = el.getAttribute(`style`)
    if (style && /font-size/i.test(style))
      el.setAttribute(`style`, scaleFontSizeInStyle(style, 1, 1))
  })
}

function stripUnsupportedAttributes(svg: SVGSVGElement) {
  svg.querySelectorAll(`[clip-path], [clipPath]`).forEach((el) => {
    el.removeAttribute(`clip-path`)
    el.removeAttribute(`clipPath`)
  })

  svg.querySelectorAll(`style`).forEach(styleEl => styleEl.remove())
  svg.querySelectorAll(`defs`).forEach(defsEl => defsEl.remove())
  svg.querySelectorAll(`linearGradient, radialGradient, filter, clipPath, mask, pattern, symbol`).forEach(el => el.remove())

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
  /** Caller already knows this SVG came from `.mermaid-diagram` (may be detached). */
  mermaid?: boolean
}

/**
 * Attach SVGs to a hidden host so getComputedStyle works.
 * Capture mermaid/plantuml before detach — closest() is null on the host.
 */
function forEachClipboardSvg(
  root: ParentNode,
  fn: (svg: SVGSVGElement, ctx: { mermaid: boolean, plantuml: boolean }) => void,
) {
  const svgs = Array.from(root.querySelectorAll<SVGSVGElement>(`svg`))
  if (svgs.length === 0)
    return

  const host = document.createElement(`div`)
  host.style.cssText = `position:fixed;left:-99999px;top:0;visibility:hidden;pointer-events:none;width:${WECHAT_MAX_WIDTH_PX}px;`
  document.body.appendChild(host)

  try {
    for (const svg of svgs) {
      if (isMathFormulaSvg(svg))
        continue

      const parent = svg.parentElement
      const nextSibling = svg.nextSibling
      const mermaid = isMermaidDiagramSvg(svg)
      const plantuml = isPlantUmlDiagramSvg(svg)
      host.appendChild(svg)
      fn(svg, { mermaid, plantuml })
      if (parent)
        parent.insertBefore(svg, nextSibling)
    }
  }
  finally {
    host.remove()
  }
}

/**
 * Bake WeChat-unsafe paints (gradients, <use> icons) while the live SVG still has defs.
 * Call before any innerHTML serialization / juice pass.
 */
export function prepareDiagramSvgsForWeChat(root: ParentNode) {
  forEachClipboardSvg(root, (svg, { mermaid }) => {
    expandUseElements(svg)
    resolveUrlPaints(svg)
    bakeHtmlLabelColors(svg)
    flattenMermaidHtmlLabels(svg, mermaid)
    convertDominantBaselineToDy(svg)
  })
}

/**
 * Adapt an SVG for WeChat: inline markers, explicit pixel sizing, strip defs/id/class.
 */
export function sanitizeSvgForWeChat(svg: SVGSVGElement, options?: SanitizeSvgOptions) {
  const isPlantuml = options?.plantuml ?? isPlantUmlDiagramSvg(svg)
  const mermaid = options?.mermaid ?? isMermaidDiagramSvg(svg)

  expandMarkers(svg)
  expandUseElements(svg)
  resolveUrlPaints(svg)
  bakeHtmlLabelColors(svg)
  flattenMermaidHtmlLabels(svg, mermaid)
  inlinePresentationAttributes(svg)
  remapDiagramInkToCurrentColor(svg)
  convertDominantBaselineToDy(svg)
  svg.setAttribute(`overflow`, `visible`)
  svg.querySelectorAll(`[style]`).forEach((el) => {
    const style = el.getAttribute(`style`)
    if (style && /overflow\s*:\s*hidden/i.test(style))
      el.setAttribute(`style`, style.replace(/overflow\s*:\s*hidden/gi, `overflow: visible`))
  })

  if (isPlantuml) {
    tightenPlantUmlViewBox(svg)
    const size = fixPlantUmlDimensions(svg)
    if (size.width <= WECHAT_MAX_WIDTH_PX)
      applyPlantUmlSvgDisplay(svg, size.width, size.height)
  }
  else if (mermaid) {
    fixMermaidDimensions(svg)
    clampMermaidFontSizes(svg, true)
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
  const plantumlSvgs: SVGSVGElement[] = []
  forEachClipboardSvg(root, (svg, { mermaid, plantuml }) => {
    sanitizeSvgForWeChat(svg, { plantuml, mermaid })
    if (plantuml)
      plantumlSvgs.push(svg)
  })

  for (const svg of plantumlSvgs) {
    const container = svg.closest(`.plantuml-diagram`) as HTMLElement | null
    if (container)
      normalizePlantUmlContainer(container)
    wrapWidePlantUmlSvg(svg)
  }
}
