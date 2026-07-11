import type { MaybeRefOrGetter } from 'vue'
import { EditorView } from '@codemirror/view'
import { useUIStore } from '@/stores/ui'

/** Click preview element to jump to the matching editor position. */
export function useCursorSync(
  codeMirrorViewRef: MaybeRefOrGetter<EditorView | null>,
) {
  const getEditorView = () => toValue(codeMirrorViewRef)
  const uiStore = useUIStore()

  function normalizeText(text: string) {
    return text
      .replace(/\s+/g, ` `)
      .trim()
  }

  function parseMarkdownHeadingLine(line: string): { level: number, title: string } | null {
    if (!line.startsWith(`#`))
      return null

    let level = 0
    while (level < line.length && line[level] === `#` && level < 6)
      level++

    if (level === 0 || line[level] !== ` `)
      return null

    const title = normalizeText(line.slice(level + 1).replace(/#+\s*$/, ``))
    if (!title)
      return null

    return { level, title }
  }

  function findHeadingPosInEditor(title: string, level?: number) {
    const view = getEditorView()
    if (!view)
      return null

    const doc = view.state.doc
    const normalizedTitle = normalizeText(title)

    for (let lineNo = 1; lineNo <= doc.lines; lineNo++) {
      const line = doc.line(lineNo)
      const parsed = parseMarkdownHeadingLine(line.text)
      if (!parsed)
        continue

      if (level && parsed.level !== level)
        continue

      const headingTitle = parsed.title
      if (headingTitle === normalizedTitle || headingTitle.includes(normalizedTitle) || normalizedTitle.includes(headingTitle)) {
        return line.from
      }
    }

    return null
  }

  function findTextPosInEditor(text: string) {
    const view = getEditorView()
    if (!view)
      return null

    const docText = view.state.doc.toString()
    const normalized = normalizeText(text)
    if (!normalized)
      return null

    const candidates = [
      normalized,
      normalized.slice(0, 80),
      normalized.slice(0, 40),
      normalized.slice(0, 20),
    ].filter(item => item.length >= 6)

    for (const candidate of candidates) {
      const pos = docText.indexOf(candidate)
      if (pos !== -1)
        return pos
    }

    return null
  }

  function syncEditorToPreviewElement(el: HTMLElement) {
    const tag = el.tagName.toLowerCase()
    let pos: number | null = null

    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag.slice(1))
      const title = normalizeText(el.textContent || ``)
      pos = findHeadingPosInEditor(title, level)
    }
    else if (tag === `img`) {
      const img = el as HTMLImageElement
      const alt = normalizeText(img.alt || ``)
      pos = alt ? findTextPosInEditor(alt) : null
      if (pos == null && img.src) {
        pos = findTextPosInEditor(img.src)
      }
    }
    else {
      const text = normalizeText(el.textContent || ``)
      pos = findTextPosInEditor(text)
    }

    if (pos != null) {
      const view = getEditorView()
      if (!view)
        return

      view.dispatch({
        selection: { anchor: pos },
        effects: EditorView.scrollIntoView(pos, { y: `center` }),
      })
      view.focus()
    }
  }

  function handlePreviewContentClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null
    if (!target)
      return

    // Intercept footnote/anchor links in preview for smooth scroll
    const linkEl = target.closest(`a`) as HTMLAnchorElement | null
    if (linkEl) {
      const href = linkEl.getAttribute(`href`)
      if (href && href.startsWith(`#`)) {
        let targetId = ``
        try {
          targetId = decodeURIComponent(href.slice(1))
        }
        catch {}
        if (targetId) {
          const targetEl = document.getElementById(targetId)
          if (targetEl) {
            const container = target.closest(`.preview-wrapper`) || document.getElementById(`preview`)
            if (container && container.contains(targetEl)) {
              event.preventDefault()
              event.stopPropagation()
              const containerRect = container.getBoundingClientRect()
              const elementRect = targetEl.getBoundingClientRect()
              const targetScrollTop = elementRect.top - containerRect.top + container.scrollTop
              container.scrollTo({
                top: targetScrollTop,
                behavior: `smooth`,
              })
              return
            }
          }
        }
      }
    }

    const formulaEl = target.closest(`[data-math-raw]`) as HTMLElement | null
    if (formulaEl) {
      const raw = formulaEl.getAttribute(`data-math-raw`) ?? ``
      const display = formulaEl.getAttribute(`data-math-display`) === `true`
      uiStore.openFormulaEditor({ value: raw, displayMode: display, sourceRaw: raw })
      return
    }

    const block = target.closest(`h1,h2,h3,h4,h5,h6,p,li,blockquote,pre,td,th,img`) as HTMLElement | null
    if (!block)
      return

    syncEditorToPreviewElement(block)
  }

  return {
    handlePreviewContentClick,
  }
}
