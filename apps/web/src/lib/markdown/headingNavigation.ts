import type { MarkdownHeading } from './headings'
import { EditorView } from '@codemirror/view'
import { extractMarkdownHeadings } from './headings'

export type HeadingDirection = 'prev' | 'next'
export type OutlineMoveKey = 'ArrowUp' | 'ArrowDown' | 'Home' | 'End'

export function clampGoToLineValue(raw: string, totalLines: number): number {
  const parsed = Number.parseInt(raw, 10)
  const line = Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  return Math.max(1, Math.min(line, Math.max(totalLines, 1)))
}

export function findAdjacentHeadingLine(
  headings: MarkdownHeading[],
  currentLine: number,
  direction: HeadingDirection,
): number | null {
  if (headings.length === 0)
    return null

  if (direction === `prev`) {
    let candidate: number | null = null
    for (const heading of headings) {
      if (heading.line < currentLine)
        candidate = heading.line
      else
        break
    }
    return candidate
  }

  for (const heading of headings) {
    if (heading.line > currentLine)
      return heading.line
  }
  return null
}

export function findOutlineFocusIndex(headings: MarkdownHeading[], activeLine: number): number {
  if (headings.length === 0)
    return -1

  let index = 0
  for (let i = 0; i < headings.length; i++) {
    if (headings[i].line <= activeLine)
      index = i
    else
      break
  }
  return index
}

export function moveOutlineFocusIndex(
  headings: MarkdownHeading[],
  currentIndex: number,
  key: OutlineMoveKey,
): number {
  if (headings.length === 0)
    return -1

  const lastIndex = headings.length - 1
  const safeIndex = currentIndex < 0 ? 0 : Math.min(currentIndex, lastIndex)

  switch (key) {
    case `ArrowUp`:
      return Math.max(0, safeIndex - 1)
    case `ArrowDown`:
      return Math.min(lastIndex, safeIndex + 1)
    case `Home`:
      return 0
    case `End`:
      return lastIndex
    default:
      return safeIndex
  }
}

export function jumpToLine(view: EditorView, lineNumber: number, snapPoint: 'start' | 'end' = 'start'): boolean {
  const target = clampGoToLineValue(String(lineNumber), view.state.doc.lines)
  const line = view.state.doc.line(target)
  view.dispatch({
    selection: { anchor: line.from },
    effects: EditorView.scrollIntoView(line.from, { y: snapPoint }),
  })
  view.focus()
  return true
}

export function jumpToAdjacentHeading(view: EditorView, direction: HeadingDirection): boolean {
  const headings = extractMarkdownHeadings(view.state.doc)
  const currentLine = view.state.doc.lineAt(view.state.selection.main.head).number
  const targetLine = findAdjacentHeadingLine(headings, currentLine, direction)
  if (targetLine == null)
    return false

  return jumpToLine(view, targetLine)
}
