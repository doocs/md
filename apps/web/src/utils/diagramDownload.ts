/**
 * Diagram download utilities
 * Supports downloading SVG diagrams (Mermaid, PlantUML, etc.) as .svg or .png
 */

const DOWNLOAD_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`

const DIAGRAM_SELECTORS = `.mermaid-diagram, .plantuml-diagram`

// ─── Download helpers ────────────────────────────────────────────────────────

function triggerDownload(url: string, filename: string): void {
  const a = document.createElement(`a`)
  a.href = url
  a.download = filename
  a.style.display = `none`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function cloneSvg(svgEl: SVGSVGElement): SVGSVGElement {
  const clone = svgEl.cloneNode(true) as SVGSVGElement
  if (!clone.hasAttribute(`xmlns`))
    clone.setAttribute(`xmlns`, `http://www.w3.org/2000/svg`)
  return clone
}

export function downloadDiagramSvg(svgEl: SVGSVGElement, filename = `diagram`): void {
  const svgStr = new XMLSerializer().serializeToString(cloneSvg(svgEl))
  const blob = new Blob([svgStr], { type: `image/svg+xml;charset=utf-8` })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, `${filename}.svg`)
  URL.revokeObjectURL(url)
}

export function downloadDiagramPng(svgEl: SVGSVGElement, filename = `diagram`): Promise<void> {
  const rect = svgEl.getBoundingClientRect()
  const width = rect.width || svgEl.viewBox?.baseVal?.width || 800
  const height = rect.height || svgEl.viewBox?.baseVal?.height || 600
  const scale = Math.max(2, window.devicePixelRatio)

  const clone = cloneSvg(svgEl)
  clone.setAttribute(`width`, String(width))
  clone.setAttribute(`height`, String(height))

  const svgStr = new XMLSerializer().serializeToString(clone)
  // Use a percent-encoded data URL instead of a blob URL: drawing a blob-URL
  // image onto canvas triggers a SecurityError ("tainted canvas") in Chromium.
  // Data URLs are treated as same-origin and avoid this restriction.
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement(`canvas`)
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)
      const ctx = canvas.getContext(`2d`)
      if (!ctx) {
        reject(new Error(`No 2D canvas context`))
        return
      }
      ctx.fillStyle = `#ffffff`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error(`PNG blob generation failed`))
          return
        }
        const url = URL.createObjectURL(blob)
        triggerDownload(url, `${filename}.png`)
        URL.revokeObjectURL(url)
        resolve()
      }, `image/png`)
    }
    img.onerror = () => reject(new Error(`Failed to load SVG as image`))
    img.src = dataUrl
  })
}

// ─── Download bar DOM injection ───────────────────────────────────────────────

function makeButton(label: string, title: string): HTMLButtonElement {
  const btn = document.createElement(`button`)
  btn.className = `diagram-download-btn`
  btn.type = `button`
  btn.title = title
  btn.innerHTML = `${DOWNLOAD_ICON}<span>${label}</span>`
  return btn
}

function createDownloadBar(container: HTMLElement, idx: number): HTMLDivElement {
  const bar = document.createElement(`div`)
  bar.className = `diagram-download-bar`

  const svgBtn = makeButton(`SVG`, `下载为 SVG`)
  svgBtn.addEventListener(`click`, (e) => {
    e.preventDefault()
    e.stopPropagation()
    const svg = container.querySelector<SVGSVGElement>(`svg`)
    if (svg)
      downloadDiagramSvg(svg, `diagram-${idx}`)
  })

  const pngBtn = makeButton(`PNG`, `下载为 PNG`)
  pngBtn.addEventListener(`click`, async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const svg = container.querySelector<SVGSVGElement>(`svg`)
    if (!svg)
      return
    pngBtn.disabled = true
    const saved = pngBtn.innerHTML
    pngBtn.innerHTML = `<span class="diagram-btn-loading">•••</span>`
    try {
      await downloadDiagramPng(svg, `diagram-${idx}`)
    }
    finally {
      pngBtn.disabled = false
      pngBtn.innerHTML = saved
    }
  })

  bar.append(svgBtn, pngBtn)
  return bar
}

function injectBar(container: HTMLElement, idx: number): void {
  if (getComputedStyle(container).position === `static`)
    container.style.position = `relative`
  container.querySelector(`.diagram-download-bar`)?.remove()
  container.appendChild(createDownloadBar(container, idx))
}

// ─── Overlay lifecycle ────────────────────────────────────────────────────────

export interface DiagramDownloadOverlay {
  /** Permanently disconnect the observer — call on component unmount. */
  cleanup: () => void
  /** Remove all bars and stop injection. Call before copying / exporting. */
  pause: () => void
  /** Re-inject bars and resume injection. Call after copying / exporting. */
  resume: () => void
}

/**
 * Watches `outputEl` for diagram containers gaining SVG content and injects
 * a SVG / PNG download bar into each one.
 */
export function setupDiagramDownloadOverlay(outputEl: HTMLElement): DiagramDownloadOverlay {
  let paused = false
  let counter = 0

  function inject(el: HTMLElement) {
    if (!paused && el.querySelector(`svg`) && !el.querySelector(`.diagram-download-bar`))
      injectBar(el, ++counter)
  }

  function scan() {
    outputEl.querySelectorAll<HTMLElement>(DIAGRAM_SELECTORS).forEach(inject)
  }

  scan()

  const observer = new MutationObserver((mutations) => {
    if (paused)
      return

    const candidates = new Set<HTMLElement>()

    for (const { target, addedNodes } of mutations) {
      const t = target as HTMLElement
      if (t.matches(DIAGRAM_SELECTORS))
        candidates.add(t)

      for (const node of addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE)
          continue
        const el = node as HTMLElement
        if (el.matches(DIAGRAM_SELECTORS))
          candidates.add(el)
        el.querySelectorAll<HTMLElement>(DIAGRAM_SELECTORS).forEach(c => candidates.add(c))
      }
    }

    candidates.forEach(inject)
  })

  observer.observe(outputEl, { childList: true, subtree: true })

  return {
    cleanup: () => observer.disconnect(),
    pause: () => {
      paused = true
      outputEl.querySelectorAll(`.diagram-download-bar`).forEach(el => el.remove())
    },
    resume: () => {
      paused = false
      scan()
    },
  }
}
