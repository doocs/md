import type { EditorState } from '@codemirror/state'

// Lowercasing can expand a character (İ becomes i + a combining dot).
// Map each resulting UTF-16 unit back to its column in the editor.
function sourceColumns(line: string) {
  const columns: number[] = []
  for (let column = 0; column < line.length; column++) {
    const width = line[column].toLowerCase().length
    for (let i = 0; i < width; i++)
      columns.push(column)
  }
  return columns
}

export function findLiteralMatches(state: EditorState, query: string, from: number, to: number, caseSensitive: boolean) {
  const matches: { line: number, ch: number }[][] = []
  if (!query)
    return matches

  const firstLine = state.doc.lineAt(from)
  const term = caseSensitive ? query : query.toLowerCase()
  state.sliceDoc(from, to).split(`\n`).forEach((line, lineIndex) => {
    const text = caseSensitive ? line : line.toLowerCase()
    const columns = text.length === line.length ? undefined : sourceColumns(line)
    const lineNumber = firstLine.number - 1 + lineIndex
    const columnOffset = lineIndex === 0 ? from - firstLine.from : 0
    let index = text.indexOf(term)
    while (index !== -1) {
      const last = index + term.length - 1
      matches.push([
        { line: lineNumber, ch: columnOffset + (columns?.[index] ?? index) },
        { line: lineNumber, ch: columnOffset + (columns?.[last] ?? last) + 1 },
      ])
      index = text.indexOf(term, last + 1)
    }
  })
  return matches
}
