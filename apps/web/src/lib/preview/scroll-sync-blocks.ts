export interface SourceBlock {
  startLine: number
  endLine: number
}

/** Minimal doc interface so tests can avoid CodeMirror Text */
export interface LineDoc {
  lines: number
  line: (n: number) => { text: string }
}

/**
 * Split a source document into logical blocks separated by blank lines.
 */
export function parseSourceBlocks(doc: LineDoc): SourceBlock[] {
  const blocks: SourceBlock[] = []
  let blockStart = -1

  for (let i = 1; i <= doc.lines; i++) {
    const isEmpty = doc.line(i).text.trim() === ``
    if (!isEmpty && blockStart === -1) {
      blockStart = i
    }
    else if (isEmpty && blockStart !== -1) {
      blocks.push({ startLine: blockStart, endLine: i - 1 })
      blockStart = -1
    }
  }
  if (blockStart !== -1)
    blocks.push({ startLine: blockStart, endLine: doc.lines })

  return blocks
}

export function sourceBlockIndexForLine(
  sourceBlocks: SourceBlock[],
  lineNo: number,
): number {
  for (let i = sourceBlocks.length - 1; i >= 0; i--) {
    if (sourceBlocks[i].startLine <= lineNo)
      return i
  }
  return 0
}

export function sourceLineForBlockIndex(
  sourceBlocks: SourceBlock[],
  blockIndex: number,
): number {
  if (sourceBlocks.length === 0)
    return 1
  const idx = Math.min(blockIndex, sourceBlocks.length - 1)
  return sourceBlocks[idx].startLine
}

/**
 * Map a source block index onto a preview block index by ratio.
 */
export function mapBlockIndex(
  index: number,
  sourceTotal: number,
  targetTotal: number,
): number {
  if (sourceTotal <= 1 || targetTotal <= 1)
    return Math.round((index / Math.max(sourceTotal - 1, 1)) * Math.max(targetTotal - 1, 1))
  return Math.round((index / (sourceTotal - 1)) * (targetTotal - 1))
}
