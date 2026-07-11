import { describe, expect, it } from 'vitest'
import {
  buildPostTree,
  filterFlatPosts,
  flattenPostTree,
} from '@/composables/usePostTree'

describe(`buildPostTree / flattenPostTree`, () => {
  it(`nests children under parents and sorts by update time`, () => {
    const posts = [
      { id: `root`, title: `Root`, updateDatetime: new Date(`2024-01-01`), parentId: null },
      { id: `child-b`, title: `B`, updateDatetime: new Date(`2024-03-01`), parentId: `root` },
      { id: `child-a`, title: `A`, updateDatetime: new Date(`2024-02-01`), parentId: `root` },
      { id: `orphan`, title: `Orphan`, updateDatetime: new Date(`2024-04-01`), parentId: `missing` },
    ]

    const flat = flattenPostTree(buildPostTree(posts))
    expect(flat.map(p => p.id)).toEqual([`orphan`, `root`, `child-b`, `child-a`])
    expect(flat.find(p => p.id === `child-b`)?.depth).toBe(1)
  })
})

describe(`filterFlatPosts`, () => {
  const posts = [
    { id: `1`, title: `Hello World`, updateDatetime: new Date(), depth: 0 },
    { id: `2`, title: `Another`, updateDatetime: new Date(), depth: 0 },
  ]

  it(`returns all posts for empty query`, () => {
    expect(filterFlatPosts(posts, `  `)).toHaveLength(2)
  })

  it(`filters by title case-insensitively`, () => {
    expect(filterFlatPosts(posts, `hello`).map(p => p.id)).toEqual([`1`])
  })
})
