import type { MaybeRefOrGetter } from 'vue'
import { EditorView } from '@codemirror/view'

export function useCursorSync(
  codeMirrorViewRef: MaybeRefOrGetter<EditorView | null>,
  previewContainerRef: MaybeRefOrGetter<HTMLElement | null>,
) {
  const cursorSyncTimer = ref<ReturnType<typeof setTimeout>>()
  const skipCursorDrivenPreviewSync = ref(false)

  const getEditorView = () => toValue(codeMirrorViewRef)
  const getPreviewContainer = () => toValue(previewContainerRef)

  function normalizeText(text: string) {
    return text
      .replace(/\s+/g, ` `)
      .trim()
  }

  function parseMarkdownHeadingLine(line: string): { level: number, title: string } | null {
    if (!line.startsWith(`#`)) {
      return null
    }

    let level = 0
    while (level < line.length && line[level] === `#` && level < 6) {
      level++
    }

    if (level === 0 || line[level] !== ` `) {
      return null
    }

    const title = normalizeText(line.slice(level + 1).replace(/#+\s*$/, ``))
    if (!title) {
      return null
    }

    return { level, title }
  }

  function scrollPreviewToElement(el: HTMLElement, behavior: ScrollBehavior = `auto`) {
    const container = getPreviewContainer()
    if (!container)
      return

    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    const inView = eRect.top >= cRect.top + 32 && eRect.bottom <= cRect.bottom - 32

    if (!inView) {
      el.scrollIntoView({ behavior, block: `center` })
    }
  }

  function findHeadingElementInPreview(title: string, level?: number) {
    const headings = document.querySelectorAll<HTMLElement>(`#output [data-heading]`)
    const normalizedTitle = normalizeText(title)

    for (const heading of headings) {
      if (level && Number(heading.tagName.slice(1)) !== level)
        continue
      if (normalizeText(heading.textContent || ``) === normalizedTitle) {
        return heading
      }
    }

    for (const heading of headings) {
      if (level && Number(heading.tagName.slice(1)) !== level)
        continue
      if (normalizeText(heading.textContent || ``).includes(normalizedTitle)) {
        return heading
      }
    }
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
      if (pos !== -1) {
        return pos
      }
    }

    return null
  }

  function focusEditorAtPos(pos: number) {
    const view = getEditorView()
    if (!view)
      return

    skipCursorDrivenPreviewSync.value = true
    view.dispatch({
      selection: { anchor: pos },
      effects: EditorView.scrollIntoView(pos, { y: `center` }),
    })
    view.focus()

    setTimeout(() => {
      skipCursorDrivenPreviewSync.value = false
    }, 180)
  }

  function syncPreviewToEditorCursor() {
    if (skipCursorDrivenPreviewSync.value)
      return

    const view = getEditorView()
    if (!view)
      return

    const cursorPos = view.state.selection.main.head
    const doc = view.state.doc
    const cursorLineNo = doc.lineAt(cursorPos).number

    // 优先按"最近标题"进行语义定位，避免图片/代码块造成的高度失真。
    for (let lineNo = cursorLineNo; lineNo >= 1; lineNo--) {
      const text = doc.line(lineNo).text
      const parsed = parseMarkdownHeadingLine(text)
      if (!parsed)
        continue

      const headingEl = findHeadingElementInPreview(parsed.title, parsed.level)
      if (headingEl) {
        scrollPreviewToElement(headingEl)
        return
      }
    }

    // 无可用语义锚点时，退化为轻量比例定位。
    const container = getPreviewContainer()
    if (!container)
      return
    const maxScrollTop = container.scrollHeight - container.offsetHeight
    const ratio = doc.length > 0 ? cursorPos / doc.length : 0
    container.scrollTo({ top: Math.max(0, maxScrollTop * ratio), behavior: `auto` })
  }

  function scheduleSyncPreviewToEditorCursor() {
    clearTimeout(cursorSyncTimer.value)
    cursorSyncTimer.value = setTimeout(() => {
      syncPreviewToEditorCursor()
    }, 100)
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
      focusEditorAtPos(pos)
    }
  }

  function handlePreviewContentClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null
    if (!target)
      return

    const block = target.closest(`h1,h2,h3,h4,h5,h6,p,li,blockquote,pre,td,th,img`) as HTMLElement | null
    if (!block)
      return

    syncEditorToPreviewElement(block)
  }

  function cleanup() {
    clearTimeout(cursorSyncTimer.value)
  }

  return {
    skipCursorDrivenPreviewSync,
    scheduleSyncPreviewToEditorCursor,
    handlePreviewContentClick,
    cleanup,
  }
}
