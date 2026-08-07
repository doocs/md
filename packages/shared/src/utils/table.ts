/**
 * Markdown table parsing and generation helpers for the visual table editor.
 * Cells are stored unescaped in MarkdownTableData; `buildMarkdownTable`
 * re-escapes pipes and newlines so parse/build round-trips stay stable.
 */

export type TableCellAlignment = `left` | `center` | `right`

export interface MarkdownTableData {
  header: string[]
  aligns: (TableCellAlignment | null)[]
  rows: string[][]
}

export interface MarkdownTableRange {
  /** Char offset of the first table line. */
  from: number
  /** Char offset right after the last table line. */
  to: number
  /** Raw markdown source of the table block. */
  text: string
}

/** Split a table row line into trimmed cells, honoring `\|` escapes. */
export function splitTableRow(line: string): string[] {
  const cells: string[] = []
  let current = ``
  let escaped = false
  for (const char of line.trim()) {
    if (escaped) {
      // Only `\|` is unescaped; other backslash sequences pass through as-is.
      current += char === `|` ? `|` : `\\${char}`
      escaped = false
      continue
    }
    if (char === `\\`) {
      escaped = true
      continue
    }
    if (char === `|`) {
      cells.push(current)
      current = ``
      continue
    }
    current += char
  }
  if (escaped)
    current += `\\`
  cells.push(current)

  const trimmed = cells.map(cell => cell.trim())
  // Drop the empty artifacts produced by leading/trailing pipes.
  if (trimmed.length > 0 && trimmed[0] === ``)
    trimmed.shift()
  if (trimmed.length > 0 && trimmed[trimmed.length - 1] === ``)
    trimmed.pop()

  return trimmed
}

export function isTableDelimiterLine(line: string): boolean {
  // marked requires the delimiter row to contain at least one pipe — a bare
  // `---` line is a setext heading, not a table delimiter.
  if (!line.includes(`|`) || !line.includes(`-`))
    return false
  const cells = splitTableRow(line)
  return cells.length > 0 && cells.every(cell => /^:?-+:?$/.test(cell))
}

/**
 * Approximates marked's rule for lines that continue a table body: any line
 * that does not start another block-level structure (blank, heading, hr,
 * blockquote, fence, list, indented code, html block).
 */
function isTableBodyContinuationLine(line: string): boolean {
  if (/^(?: {4}|\t)/.test(line))
    return false
  const trimmed = line.trim()
  if (trimmed === `` || trimmed.startsWith(`>`))
    return false
  if (/^#{1,6}(?:\s|$)/.test(trimmed))
    return false
  // hr: three or more `-`, `_` or `*` with optional spaces between them
  const compact = trimmed.replace(/ /g, ``)
  if (/^-{3,}$/.test(compact) || /^_{3,}$/.test(compact) || /^\*{3,}$/.test(compact))
    return false
  if (/^(?:`{3,}|~{3,})/.test(trimmed))
    return false
  if (/^(?:[*+-]|\d{1,9}[.)])(?:\s|$)/.test(trimmed))
    return false
  if (/^<[a-z!/]/i.test(trimmed))
    return false
  return true
}

/** A header candidate is a pipe-containing text line that starts no other block. */
function isTableHeaderCandidateLine(line: string): boolean {
  return line.includes(`|`) && isTableBodyContinuationLine(line)
}

/**
 * Scan a document for GFM table blocks, mirroring marked's recognition rules:
 * header and delimiter rows must have equal cell counts, blocks inside fenced
 * code are ignored, and `>`-prefixed (blockquote) lines are excluded — the
 * visual editor cannot round-trip blockquote prefixes, so both the preview
 * click mapping and this scanner skip them consistently.
 */
export function findAllMarkdownTables(docText: string): MarkdownTableRange[] {
  const lines = docText.split(`\n`)
  const lineStarts: number[] = []
  let offset = 0
  for (const line of lines) {
    lineStarts.push(offset)
    offset += line.length + 1
  }

  const ranges: MarkdownTableRange[] = []
  let fenceChar = ``
  let fenceLen = 0
  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1]
      if (!fenceChar) {
        fenceChar = marker[0]
        fenceLen = marker.length
      }
      else if (marker[0] === fenceChar && marker.length >= fenceLen && /^ {0,3}(?:`{3,}|~{3,})\s*$/.test(line)) {
        fenceChar = ``
        fenceLen = 0
      }
      i++
      continue
    }
    if (fenceChar) {
      i++
      continue
    }

    if (
      i + 1 < lines.length
      && isTableHeaderCandidateLine(line)
      && !isTableDelimiterLine(line)
      && isTableDelimiterLine(lines[i + 1])
      && splitTableRow(line).length === splitTableRow(lines[i + 1]).length
    ) {
      let end = i + 2
      while (end < lines.length && isTableBodyContinuationLine(lines[end]))
        end++
      ranges.push({
        from: lineStarts[i],
        to: end < lines.length ? lineStarts[end] - 1 : docText.length,
        text: lines.slice(i, end).join(`\n`),
      })
      i = end
      continue
    }
    i++
  }
  return ranges
}

/** Parse a GFM table block. Returns null when the text is not a valid table. */
export function parseMarkdownTable(text: string): MarkdownTableData | null {
  const lines = text.trim().split(`\n`)
  if (lines.length < 2)
    return null
  if (isTableDelimiterLine(lines[0]) || !isTableDelimiterLine(lines[1]))
    return null

  const header = splitTableRow(lines[0])
  const delimiter = splitTableRow(lines[1])
  // marked only renders a table when header and delimiter cell counts match.
  if (header.length === 0 || header.length !== delimiter.length)
    return null

  const aligns = delimiter.map((cell): TableCellAlignment | null => {
    const value = cell.trim()
    const left = value.startsWith(`:`)
    const right = value.endsWith(`:`)
    if (left && right)
      return `center`
    if (right)
      return `right`
    if (left)
      return `left`
    return null
  })

  const rows = lines.slice(2).filter(line => line.trim() !== ``).map(splitTableRow)

  return { header, aligns, rows }
}

function escapeCell(cell: string): string {
  const escaped = cell.replace(/\|/g, `\\|`).replace(/\n/g, `<br>`).trim()
  return escaped === `` ? ` ` : escaped
}

function delimiterCell(align: TableCellAlignment | null): string {
  switch (align) {
    case `left`:
      return `:---`
    case `center`:
      return `:---:`
    case `right`:
      return `---:`
    default:
      return `---`
  }
}

/** Column count of a table, derived from its widest part. */
export function tableColumnCount(data: MarkdownTableData): number {
  return Math.max(
    data.header.length,
    data.aligns.length,
    ...data.rows.map(row => row.length),
    1,
  )
}

/** Serialize table data back to a GFM table block, normalizing ragged rows. */
export function buildMarkdownTable(data: MarkdownTableData): string {
  const cols = tableColumnCount(data)
  const padCells = (cells: string[]) =>
    Array.from({ length: cols }, (_, i) => escapeCell(cells[i] ?? ``))

  const lines = [
    `| ${padCells(data.header).join(` | `)} |`,
    `| ${Array.from({ length: cols }, (_, i) => delimiterCell(data.aligns[i] ?? null)).join(` | `)} |`,
    ...data.rows.map(row => `| ${padCells(row).join(` | `)} |`),
  ]
  return lines.join(`\n`)
}

/**
 * Locate the GFM table block containing the given document position.
 * Returns null when the position is not inside a valid table.
 */
export function findMarkdownTableAt(docText: string, pos: number): MarkdownTableRange | null {
  const clamped = Math.max(0, Math.min(pos, docText.length))
  return findAllMarkdownTables(docText).find(range => clamped >= range.from && clamped <= range.to) ?? null
}

/**
 * Re-validate a previously captured table range against the current document.
 * Returns the stored range unchanged when it is still exact; otherwise tries to
 * find the same table (by identical source text) at its shifted position —
 * e.g. after a cloud sync inserted content above it. Picks the match nearest
 * the original offset when identical tables exist. Returns null when the table
 * itself was edited or removed, so callers can abort instead of corrupting
 * unrelated content with stale offsets.
 */
export function relocateMarkdownTable(docText: string, stored: MarkdownTableRange): MarkdownTableRange | null {
  if (stored.from >= 0 && stored.to <= docText.length && docText.slice(stored.from, stored.to) === stored.text)
    return stored
  const matches = findAllMarkdownTables(docText).filter(range => range.text === stored.text)
  if (matches.length === 0)
    return null
  return matches.reduce((best, range) =>
    Math.abs(range.from - stored.from) < Math.abs(best.from - stored.from) ? range : best)
}

/** Create an empty table with the given body row / column counts. */
export function createTableData(rows: number, cols: number): MarkdownTableData {
  return {
    header: Array.from<string>({ length: cols }).fill(``),
    aligns: Array.from<TableCellAlignment | null>({ length: cols }).fill(null),
    rows: Array.from({ length: rows }, () => Array.from<string>({ length: cols }).fill(``)),
  }
}
