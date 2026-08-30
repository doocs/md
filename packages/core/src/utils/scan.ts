/**
 * Fast source scanning helpers for marked extension `start()` hooks.
 *
 * marked calls `start()` for every registered extension at every block boundary,
 * always passing the *remaining* source. A `/^.../m` regex — or a bare `indexOf`
 * that finds nothing — therefore rescans the whole tail on every call, and a
 * dozen extensions turn a long document into quadratic work.
 *
 * Two things keep that linear here: the search is bounded to the current block
 * (see {@link blockScanLimit}), and the bounded search never allocates.
 */

const LF = 10
const CR = 13
const SPACE = 32
const TAB = 9

function isLineTerminator(code: number): boolean {
  return code === LF || code === CR
}

/** True when `index` sits at the beginning of a line. */
export function isAtLineStart(src: string, index: number): boolean {
  return index === 0 || isLineTerminator(src.charCodeAt(index - 1))
}

/**
 * How far a block-level `start()` needs to look.
 *
 * marked uses the returned index only to decide where the current paragraph is
 * cut short. A paragraph always ends at a blank line, so anything past the first
 * blank line belongs to a later block that marked tokenizes on its own pass.
 */
export function blockScanLimit(src: string): number {
  let from = 0
  for (;;) {
    const newline = src.indexOf(`\n`, from)
    if (newline === -1)
      return src.length

    let i = newline + 1
    while (i < src.length) {
      const code = src.charCodeAt(i)
      if (code === LF)
        return newline
      if (code === SPACE || code === TAB || code === CR) {
        i++
        continue
      }
      break
    }

    if (i >= src.length)
      return src.length

    from = newline + 1
  }
}

/**
 * `indexOf` restricted to starts within `limit`.
 *
 * The native `indexOf` cannot be bounded, so it would scan the whole tail before
 * the caller could reject an out-of-range hit. It stays faster on unbounded
 * searches, so it is still used when the limit covers the entire source.
 */
function boundedIndexOf(src: string, needle: string, from: number, limit: number): number {
  const maxStart = Math.min(limit, src.length - needle.length)
  if (maxStart < from)
    return -1

  if (maxStart >= src.length - needle.length) {
    const index = src.indexOf(needle, from)
    return index > maxStart ? -1 : index
  }

  const firstCode = needle.charCodeAt(0)
  const needleLength = needle.length

  for (let i = from; i <= maxStart; i++) {
    if (src.charCodeAt(i) !== firstCode)
      continue
    let j = 1
    while (j < needleLength && src.charCodeAt(i + j) === needle.charCodeAt(j))
      j++
    if (j === needleLength)
      return i
  }

  return -1
}

/** Index of the first `needle` occurrence that begins a line, if any. */
export function findAtLineStart(src: string, needle: string, limit: number = src.length): number | undefined {
  let from = 0
  for (;;) {
    const index = boundedIndexOf(src, needle, from, limit)
    if (index === -1)
      return undefined
    if (isAtLineStart(src, index))
      return index
    from = index + 1
  }
}

/**
 * Index of the line start for the first `needle` preceded on its own line by at
 * most `maxIndent` spaces/tabs. Mirrors `/^ {0,maxIndent}needle/m`, returning the
 * line start (what `String.search` reports for that pattern) rather than the
 * needle position.
 */
export function findIndentedLineStart(src: string, needle: string, maxIndent: number, limit: number = src.length): number | undefined {
  let from = 0
  for (;;) {
    const index = boundedIndexOf(src, needle, from, limit)
    if (index === -1)
      return undefined

    let lineStart = index
    let indent = 0
    while (lineStart > 0 && indent <= maxIndent) {
      const code = src.charCodeAt(lineStart - 1)
      if (code === SPACE || code === TAB) {
        lineStart--
        indent++
        continue
      }
      break
    }

    if (indent <= maxIndent && isAtLineStart(src, lineStart))
      return lineStart

    from = index + 1
  }
}

/** End index (exclusive) of the line containing `index`. */
export function lineEndFrom(src: string, index: number): number {
  const next = src.indexOf(`\n`, index)
  return next === -1 ? src.length : next
}

/** True when `[from, to)` contains only spaces and tabs. */
export function isBlankRange(src: string, from: number, to: number): boolean {
  for (let i = from; i < to; i++) {
    const code = src.charCodeAt(i)
    if (code !== SPACE && code !== TAB && code !== CR)
      return false
  }
  return true
}

/**
 * Index of the line start for the first line whose only content is `needle`
 * (surrounding spaces/tabs allowed). Mirrors `/^\s*needle\s*$/m`.
 */
export function findLineEquals(src: string, needle: string, limit: number = src.length): number | undefined {
  let from = 0
  for (;;) {
    const index = boundedIndexOf(src, needle, from, limit)
    if (index === -1)
      return undefined

    let lineStart = index
    while (lineStart > 0 && !isLineTerminator(src.charCodeAt(lineStart - 1)))
      lineStart--

    const lineEnd = lineEndFrom(src, index)
    if (isBlankRange(src, lineStart, index) && isBlankRange(src, index + needle.length, lineEnd))
      return lineStart

    from = index + 1
  }
}

/** `indexOf` restricted to matches starting at or before `limit`. Returns -1 when absent. */
export function indexOfWithin(src: string, needle: string, from: number, limit: number): number {
  return boundedIndexOf(src, needle, from, limit)
}
