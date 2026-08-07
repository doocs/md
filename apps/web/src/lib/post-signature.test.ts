import type { Post } from '@/types/post'
import { describe, expect, it } from 'vitest'
import { postSignature } from '@/lib/post-signature'

function makePost(overrides: Partial<Post> & Pick<Post, 'id'>): Post {
  return {
    title: `Post ${overrides.id}`,
    content: `content-${overrides.id}`,
    history: [],
    createDatetime: new Date(`2024-01-01T00:00:00.000Z`),
    updateDatetime: new Date(`2024-01-02T00:00:00.000Z`),
    parentId: null,
    collapsed: false,
    ...overrides,
  }
}

describe(`postSignature`, () => {
  it(`is stable for identical posts`, () => {
    expect(postSignature(makePost({ id: `1` }))).toBe(postSignature(makePost({ id: `1` })))
  })

  // Regression: Date stringification has only second precision; two updates
  // within the same second produced identical signatures and the change was
  // never persisted.
  it(`distinguishes sub-second updateDatetime differences`, () => {
    const a = makePost({ id: `1`, updateDatetime: new Date(`2024-01-02T00:00:00.100Z`) })
    const b = makePost({ id: `1`, updateDatetime: new Date(`2024-01-02T00:00:00.900Z`) })
    expect(postSignature(a)).not.toBe(postSignature(b))
  })

  it.each<[string, Partial<Post>]>([
    [`title`, { title: `renamed` }],
    [`content length`, { content: `longer content body` }],
    [`parentId`, { parentId: `parent-1` }],
    [`collapsed`, { collapsed: true }],
    [`history length`, { history: [{ datetime: `2024-01-01`, content: `old` }] }],
  ])(`changes when %s changes`, (_label, overrides) => {
    expect(postSignature(makePost({ id: `1`, ...overrides })))
      .not
      .toBe(postSignature(makePost({ id: `1` })))
  })

  it(`does not change for same-length content at the same timestamp`, () => {
    // Documents the intended contract: content edits must bump updateDatetime
    // (the store always does), so the signature only tracks content length.
    const a = makePost({ id: `1`, content: `aaaa` })
    const b = makePost({ id: `1`, content: `bbbb` })
    expect(postSignature(a)).toBe(postSignature(b))
  })
})
