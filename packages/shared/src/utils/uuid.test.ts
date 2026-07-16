import { afterEach, describe, expect, it, vi } from 'vitest'
import { uuidv4 } from './uuid'

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe(`uuidv4`, () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it(`returns a RFC 4122 version-4 UUID`, () => {
    expect(uuidv4()).toMatch(UUID_V4_RE)
  })

  it(`returns unique values across calls`, () => {
    const ids = new Set(Array.from({ length: 50 }, () => uuidv4()))
    expect(ids.size).toBe(50)
  })

  it(`still works when crypto.randomUUID is unavailable (insecure HTTP)`, () => {
    const getRandomValues = crypto.getRandomValues.bind(crypto)
    vi.stubGlobal(`crypto`, {
      getRandomValues,
      // Mimic non-secure context: crypto exists but randomUUID does not
    })

    expect(typeof crypto.randomUUID).toBe(`undefined`)
    expect(uuidv4()).toMatch(UUID_V4_RE)
  })

  it(`does not throw when crypto.randomUUID is not a function`, () => {
    const getRandomValues = crypto.getRandomValues.bind(crypto)
    vi.stubGlobal(`crypto`, {
      getRandomValues,
      randomUUID: undefined,
    })

    expect(() => uuidv4()).not.toThrow()
    expect(uuidv4()).toMatch(UUID_V4_RE)
  })
})
