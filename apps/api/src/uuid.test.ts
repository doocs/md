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

  it(`still works when crypto.randomUUID is unavailable`, () => {
    const getRandomValues = crypto.getRandomValues.bind(crypto)
    vi.stubGlobal(`crypto`, { getRandomValues })

    expect(typeof crypto.randomUUID).toBe(`undefined`)
    expect(uuidv4()).toMatch(UUID_V4_RE)
  })
})
