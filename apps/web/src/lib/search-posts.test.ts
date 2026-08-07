import type { Post } from '@/types/post'
import { describe, expect, it } from 'vitest'
import { getContentSnippet, getSearchRegex, highlightParts, scanPosts } from '@/lib/search-posts'

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

describe(`getSearchRegex`, () => {
  it(`returns null for blank query`, () => {
    expect(getSearchRegex(``)).toBeNull()
    expect(getSearchRegex(`   `)).toBeNull()
  })

  it(`escapes special characters in plain mode`, () => {
    const regex = getSearchRegex(`a.b(c)`)
    expect(regex).not.toBeNull()
    expect(`a.b(c)`.match(regex!)).toHaveLength(1)
    expect(`axbcd`.match(regex!)).toBeNull()
  })

  it(`treats query as pattern in regex mode`, () => {
    const regex = getSearchRegex(`^#+`, { isRegex: true })
    expect(`## title`.match(regex!)).toHaveLength(1)
  })

  it(`returns null for invalid regex instead of throwing`, () => {
    expect(getSearchRegex(`(unclosed`, { isRegex: true })).toBeNull()
  })

  it(`is case-insensitive by default and honors isCaseSensitive`, () => {
    expect(`ABC`.match(getSearchRegex(`abc`)!)).toHaveLength(1)
    expect(`ABC`.match(getSearchRegex(`abc`, { isCaseSensitive: true })!)).toBeNull()
  })
})

describe(`highlightParts`, () => {
  it(`splits text into highlighted and plain segments`, () => {
    const parts = highlightParts(`foo bar foo`, `foo`)
    expect(parts).toEqual([
      { text: `foo`, highlight: true },
      { text: ` bar `, highlight: false },
      { text: `foo`, highlight: true },
    ])
  })

  it(`returns the whole text when there is no match`, () => {
    expect(highlightParts(`hello`, `xyz`)).toEqual([{ text: `hello`, highlight: false }])
  })

  it(`does not loop forever on zero-width regex matches`, () => {
    const parts = highlightParts(`bbb`, `a*`, { isRegex: true })
    expect(parts.map(p => p.text).join(``)).toBe(`bbb`)
  })
})

describe(`getContentSnippet`, () => {
  it(`extracts a window around the first match`, () => {
    const content = `${`x`.repeat(100)} needle ${`y`.repeat(100)}`
    const snippet = getContentSnippet(content, `needle`)
    expect(snippet).toContain(`needle`)
    expect(snippet.startsWith(`…`)).toBe(true)
    expect(snippet.endsWith(`…`)).toBe(true)
    expect(snippet.length).toBeLessThan(content.length)
  })

  it(`replaces newlines with spaces`, () => {
    const snippet = getContentSnippet(`line one\nline two needle`, `needle`)
    expect(snippet).not.toContain(`\n`)
  })

  it(`returns empty string when content has no match`, () => {
    expect(getContentSnippet(`nothing here`, `needle`)).toBe(``)
  })
})

describe(`scanPosts`, () => {
  it(`returns empty scan for blank query or invalid regex`, () => {
    const posts = [makePost({ id: `1` })]
    expect(scanPosts(posts, ``).totalMatches).toBe(0)
    expect(scanPosts(posts, `(unclosed`, { isRegex: true }).results).toEqual([])
  })

  // Regression: the previous implementation reused one global RegExp with
  // RegExp.test across posts; the stale lastIndex made every other matching
  // post invisible to the results list.
  it(`finds matches in every post, not just alternating ones`, () => {
    const posts = [
      makePost({ id: `1`, content: `alpha beta` }),
      makePost({ id: `2`, content: `alpha gamma` }),
      makePost({ id: `3`, content: `alpha delta` }),
    ]
    const scan = scanPosts(posts, `alpha`)
    expect(scan.results.map(r => r.id)).toEqual([`1`, `2`, `3`])
    expect(scan.totalMatches).toBe(3)
  })

  it(`counts title and content matches across all posts`, () => {
    const posts = [
      makePost({ id: `1`, title: `foo foo`, content: `foo` }),
      makePost({ id: `2`, title: `bar`, content: `foo foo foo` }),
      makePost({ id: `3`, title: `baz`, content: `qux` }),
    ]
    const scan = scanPosts(posts, `foo`)
    expect(scan.totalMatches).toBe(6)
    expect(scan.results.map(r => r.id)).toEqual([`1`, `2`])
  })

  it(`populates title and snippet parts only where matches exist`, () => {
    const posts = [makePost({ id: `1`, title: `has foo`, content: `no match in body` })]
    const [result] = scanPosts(posts, `foo`).results
    expect(result.titleParts.some(p => p.highlight)).toBe(true)
    expect(result.snippetParts).toEqual([])
  })

  it(`respects case sensitivity option`, () => {
    const posts = [makePost({ id: `1`, title: `FOO`, content: `foo` })]
    expect(scanPosts(posts, `foo`).totalMatches).toBe(2)
    expect(scanPosts(posts, `foo`, { isCaseSensitive: true }).totalMatches).toBe(1)
  })

  it(`supports regex queries`, () => {
    const posts = [makePost({ id: `1`, content: `a1 a2 a3` })]
    const scan = scanPosts(posts, `a\\d`, { isRegex: true })
    expect(scan.totalMatches).toBe(3)
  })
})
