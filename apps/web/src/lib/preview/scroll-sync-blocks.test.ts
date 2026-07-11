import type { LineDoc } from './scroll-sync-blocks'
import { describe, expect, it } from 'vitest'
import {
  mapBlockIndex,
  parseSourceBlocks,
  sourceBlockIndexForLine,
  sourceLineForBlockIndex,
} from './scroll-sync-blocks'

function docFromLines(lines: string[]): LineDoc {
  return {
    lines: lines.length,
    line: (n: number) => ({ text: lines[n - 1] ?? `` }),
  }
}

describe(`parseSourceBlocks`, () => {
  it(`splits on blank lines`, () => {
    const blocks = parseSourceBlocks(docFromLines([
      `# Title`,
      ``,
      `para one`,
      `still one`,
      ``,
      `para two`,
    ]))
    expect(blocks).toEqual([
      { startLine: 1, endLine: 1 },
      { startLine: 3, endLine: 4 },
      { startLine: 6, endLine: 6 },
    ])
  })

  it(`returns empty for blank document`, () => {
    expect(parseSourceBlocks(docFromLines([``, ``]))).toEqual([])
  })

  it(`treats a single contiguous block as one`, () => {
    expect(parseSourceBlocks(docFromLines([`a`, `b`, `c`]))).toEqual([
      { startLine: 1, endLine: 3 },
    ])
  })
})

describe(`sourceBlockIndexForLine`, () => {
  const blocks = [
    { startLine: 1, endLine: 2 },
    { startLine: 4, endLine: 5 },
    { startLine: 7, endLine: 8 },
  ]

  it(`finds the last block whose startLine is <= line`, () => {
    expect(sourceBlockIndexForLine(blocks, 1)).toBe(0)
    expect(sourceBlockIndexForLine(blocks, 3)).toBe(0)
    expect(sourceBlockIndexForLine(blocks, 4)).toBe(1)
    expect(sourceBlockIndexForLine(blocks, 9)).toBe(2)
  })
})

describe(`sourceLineForBlockIndex`, () => {
  it(`returns 1 for empty blocks`, () => {
    expect(sourceLineForBlockIndex([], 0)).toBe(1)
  })

  it(`clamps to last block`, () => {
    const blocks = [
      { startLine: 1, endLine: 1 },
      { startLine: 3, endLine: 3 },
    ]
    expect(sourceLineForBlockIndex(blocks, 0)).toBe(1)
    expect(sourceLineForBlockIndex(blocks, 99)).toBe(3)
  })
})

describe(`mapBlockIndex`, () => {
  it(`maps proportionally across ranges`, () => {
    expect(mapBlockIndex(0, 5, 5)).toBe(0)
    expect(mapBlockIndex(4, 5, 5)).toBe(4)
    expect(mapBlockIndex(2, 5, 3)).toBe(1)
  })

  it(`handles single-block edge cases`, () => {
    expect(mapBlockIndex(0, 1, 1)).toBe(0)
    expect(mapBlockIndex(0, 1, 4)).toBe(0)
  })
})
