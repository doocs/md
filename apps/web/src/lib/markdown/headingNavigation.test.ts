import type { MarkdownHeading } from './headings'
import { describe, expect, it } from 'vitest'
import {
  clampGoToLineValue,
  findAdjacentHeadingLine,
  findOutlineFocusIndex,
  moveOutlineFocusIndex,
} from './headingNavigation'

const headings: MarkdownHeading[] = [
  { title: `Intro`, level: 1, line: 1 },
  { title: `Setup`, level: 2, line: 5 },
  { title: `Usage`, level: 2, line: 12 },
  { title: `Tips`, level: 3, line: 20 },
]

describe(`clampGoToLineValue`, () => {
  it(`clamps invalid and out-of-range values`, () => {
    expect(clampGoToLineValue(``, 10)).toBe(1)
    expect(clampGoToLineValue(`0`, 10)).toBe(1)
    expect(clampGoToLineValue(`99`, 10)).toBe(10)
    expect(clampGoToLineValue(`4`, 10)).toBe(4)
  })
})

describe(`findAdjacentHeadingLine`, () => {
  it(`finds previous heading`, () => {
    expect(findAdjacentHeadingLine(headings, 15, `prev`)).toBe(12)
    expect(findAdjacentHeadingLine(headings, 5, `prev`)).toBe(1)
    expect(findAdjacentHeadingLine(headings, 1, `prev`)).toBeNull()
  })

  it(`finds next heading`, () => {
    expect(findAdjacentHeadingLine(headings, 1, `next`)).toBe(5)
    expect(findAdjacentHeadingLine(headings, 12, `next`)).toBe(20)
    expect(findAdjacentHeadingLine(headings, 20, `next`)).toBeNull()
  })
})

describe(`outline focus helpers`, () => {
  it(`resolves active outline index`, () => {
    expect(findOutlineFocusIndex(headings, 1)).toBe(0)
    expect(findOutlineFocusIndex(headings, 15)).toBe(2)
    expect(findOutlineFocusIndex(headings, 20)).toBe(3)
  })

  it(`moves outline focus with keyboard keys`, () => {
    expect(moveOutlineFocusIndex(headings, 2, `ArrowUp`)).toBe(1)
    expect(moveOutlineFocusIndex(headings, 2, `ArrowDown`)).toBe(3)
    expect(moveOutlineFocusIndex(headings, 2, `Home`)).toBe(0)
    expect(moveOutlineFocusIndex(headings, 2, `End`)).toBe(3)
  })
})
