import type { BlockBounds } from './png-segments'
import { describe, expect, it } from 'vitest'
import { planSegments } from './png-segments'

/** Build bounds for consecutive blocks of the given heights, separated by `gap`. */
function stack(heights: number[], gap = 0): BlockBounds[] {
  let top = 0
  return heights.map((height) => {
    const bounds = { top, bottom: top + height }
    top = bounds.bottom + gap
    return bounds
  })
}

describe(`planSegments`, () => {
  it(`returns nothing for an empty document`, () => {
    expect(planSegments([], 1000)).toEqual([])
  })

  it(`keeps everything in one segment when it fits`, () => {
    expect(planSegments(stack([100, 200, 300]), 1000)).toEqual([[0, 1, 2]])
  })

  it(`splits on a block boundary once the ceiling is passed`, () => {
    expect(planSegments(stack([400, 400, 400, 400]), 1000)).toEqual([[0, 1], [2, 3]])
  })

  it(`measures from the segment top so earlier segments do not shrink later ones`, () => {
    // Without re-basing on each segment's own top, the second segment would be
    // measured from the document top and get split far too eagerly.
    expect(planSegments(stack([600, 600, 600, 600]), 1000)).toEqual([[0], [1], [2], [3]])
  })

  it(`counts the gaps between blocks toward the segment height`, () => {
    const noGap = planSegments(stack([300, 300, 300]), 1000)
    const withGap = planSegments(stack([300, 300, 300], 100), 1000)

    expect(noGap).toEqual([[0, 1, 2]])
    expect(withGap).toEqual([[0, 1], [2]])
  })

  it(`never splits a block that is taller than the ceiling`, () => {
    expect(planSegments(stack([5000]), 1000)).toEqual([[0]])
  })

  it(`gives an oversized block its own segment without swallowing neighbours`, () => {
    expect(planSegments(stack([200, 5000, 200]), 1000)).toEqual([[0], [1], [2]])
  })

  it(`covers every block exactly once and preserves order`, () => {
    const bounds = stack([120, 480, 90, 2200, 300, 640, 150], 24)
    const segments = planSegments(bounds, 1000)

    expect(segments.flat()).toEqual(bounds.map((_, index) => index))
  })
})
