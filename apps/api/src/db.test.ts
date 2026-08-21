import { describe, expect, it } from 'vitest'
import { chunkDocumentIds, D1_IN_ID_CHUNK } from './db'

describe(`chunkDocumentIds`, () => {
  it(`keeps each IN chunk within D1's bound-parameter budget`, () => {
    const ids = Array.from({ length: 250 }, (_, i) => `id-${i}`)
    const chunks = chunkDocumentIds(ids)
    expect(D1_IN_ID_CHUNK).toBe(99)
    expect(chunks.every(chunk => chunk.length <= D1_IN_ID_CHUNK)).toBe(true)
    expect(chunks[0]?.length).toBe(99)
    expect(chunks.flat()).toHaveLength(250)
  })

  it(`dedupes ids before chunking`, () => {
    expect(chunkDocumentIds([`a`, `a`, `b`])).toEqual([[`a`, `b`]])
  })
})
