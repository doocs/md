import { describe, expect, it } from 'vitest'
import { buildPushBatches, chunkArray, utf8JsonBytes } from './push-batch'

describe(`chunkArray`, () => {
  it(`splits items into fixed-size groups`, () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  it(`returns an empty list for empty input`, () => {
    expect(chunkArray([], 10)).toEqual([])
  })
})

describe(`buildPushBatches`, () => {
  it(`returns no batches when both sides are empty`, () => {
    expect(buildPushBatches([], [])).toEqual([])
  })

  it(`packs leftover settings with the first document chunk`, () => {
    const batches = buildPushBatches([`d1`, `d2`, `d3`], [`s1`], 2, 80)
    expect(batches).toEqual([
      { documents: [`d1`, `d2`], settings: [`s1`] },
      { documents: [`d3`], settings: [] },
    ])
  })

  it(`sends settings-only pushes in one batch when under the cap`, () => {
    expect(buildPushBatches([], [`a`, `b`], 100, 80)).toEqual([
      { documents: [], settings: [`a`, `b`] },
    ])
  })

  it(`splits when the JSON body would exceed the request budget`, () => {
    const doc = { content: `x`.repeat(1000) }
    const one = utf8JsonBytes({ documents: [doc], settings: [] })
    const two = utf8JsonBytes({ documents: [doc, doc], settings: [] })
    expect(two).toBeGreaterThan(one)

    const batches = buildPushBatches([doc, doc], [], 100, 80, one + 8)
    expect(batches).toHaveLength(2)
    expect(batches.every(batch => batch.documents.length === 1)).toBe(true)
    expect(batches.every(batch => utf8JsonBytes(batch) <= one + 8)).toBe(true)
  })
})
