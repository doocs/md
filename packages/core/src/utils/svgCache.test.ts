import { describe, expect, it } from 'vitest'
import { createSVGCache, LRUMap } from './svgCache'

describe('lRUMap', () => {
  it('evicts oldest entry when over capacity', () => {
    const cache = new LRUMap<string>(2)
    cache.set(`a`, `1`)
    cache.set(`b`, `2`)
    cache.set(`c`, `3`)

    expect(cache.get(`a`)).toBeUndefined()
    expect(cache.get(`b`)).toBe(`2`)
    expect(cache.get(`c`)).toBe(`3`)
  })

  it('refreshes entry order on get', () => {
    const cache = new LRUMap<string>(2)
    cache.set(`a`, `1`)
    cache.set(`b`, `2`)
    cache.get(`a`)
    cache.set(`c`, `3`)

    expect(cache.get(`b`)).toBeUndefined()
    expect(cache.get(`a`)).toBe(`1`)
    expect(cache.get(`c`)).toBe(`3`)
  })
})

describe('createSVGCache', () => {
  it('creates cache with default max size', () => {
    const cache = createSVGCache()
    cache.set(`key`, `<svg></svg>`)
    expect(cache.get(`key`)).toBe(`<svg></svg>`)
  })
})
