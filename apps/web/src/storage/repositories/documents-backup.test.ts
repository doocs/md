// @vitest-environment jsdom
import type { Post } from '@/types/post'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearDocumentsPagehideBackup,
  DOCUMENTS_PAGEHIDE_BACKUP_KEY,
  mergeDocumentsWithBackup,
  parseDocumentsBackup,
  peekDocumentsPagehideBackup,
  serializeDocumentsBackup,
  writeDocumentsPagehideBackup,
} from './documents-backup'

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: `post-1`,
    title: `Draft`,
    content: `# hello`,
    history: [],
    createDatetime: new Date(`2026-01-01T00:00:00.000Z`),
    updateDatetime: new Date(`2026-01-02T00:00:00.000Z`),
    parentId: null,
    collapsed: false,
    ...overrides,
  }
}

describe(`documents pagehide backup`, () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it(`round-trips posts through serialize/parse`, () => {
    const posts = [makePost({ content: `keep me` })]
    const restored = parseDocumentsBackup(serializeDocumentsBackup(posts))
    expect(restored?.posts).toHaveLength(1)
    expect(restored?.token).toBeNull()
    expect(restored?.posts[0].id).toBe(`post-1`)
    expect(restored?.posts[0].content).toBe(`keep me`)
    expect(restored?.posts[0].updateDatetime.toISOString()).toBe(`2026-01-02T00:00:00.000Z`)
  })

  it(`omits history from the localStorage payload`, () => {
    writeDocumentsPagehideBackup([makePost({
      history: [{ datetime: 1, content: `secret-history` }],
    })])
    expect(localStorage.getItem(DOCUMENTS_PAGEHIDE_BACKUP_KEY)).not.toContain(`secret-history`)
  })

  it(`returns null for empty or invalid payloads`, () => {
    expect(parseDocumentsBackup(null)).toBeNull()
    expect(parseDocumentsBackup(`[]`)).toBeNull()
    expect(parseDocumentsBackup(`{`)).toBeNull()
  })

  it(`writes and peeks a localStorage snapshot`, () => {
    writeDocumentsPagehideBackup([makePost({ title: `Saved` })])
    expect(localStorage.getItem(DOCUMENTS_PAGEHIDE_BACKUP_KEY)).toBeTruthy()
    expect(peekDocumentsPagehideBackup()?.posts[0].title).toBe(`Saved`)
  })

  it(`does not clear a newer backup when an older generation finishes`, () => {
    const first = writeDocumentsPagehideBackup([makePost({ content: `old` })])
    writeDocumentsPagehideBackup([makePost({ content: `new` })])
    clearDocumentsPagehideBackup(first)
    expect(peekDocumentsPagehideBackup()?.posts[0].content).toBe(`new`)
  })

  it(`does not clear a backup written under a different token`, () => {
    const token = writeDocumentsPagehideBackup([makePost({ content: `ours` })])
    const stored = JSON.parse(localStorage.getItem(DOCUMENTS_PAGEHIDE_BACKUP_KEY)!) as {
      token: string
      posts: Array<{ content: string }>
    }
    stored.token = `other-tab`
    stored.posts[0].content = `theirs`
    localStorage.setItem(DOCUMENTS_PAGEHIDE_BACKUP_KEY, JSON.stringify(stored))
    clearDocumentsPagehideBackup(token)
    expect(peekDocumentsPagehideBackup()?.posts[0].content).toBe(`theirs`)
  })

  it(`clears the matching generation`, () => {
    const generation = writeDocumentsPagehideBackup([makePost()])
    clearDocumentsPagehideBackup(generation)
    expect(peekDocumentsPagehideBackup()).toBeNull()
  })

  it(`keeps only the newest post when the full snapshot exceeds quota`, () => {
    const original = Storage.prototype.setItem
    let calls = 0
    vi.spyOn(Storage.prototype, `setItem`).mockImplementation(function (this: Storage, key: string, value: string) {
      calls += 1
      if (calls === 1)
        throw new Error(`quota`)
      return original.call(this, key, value)
    })

    writeDocumentsPagehideBackup([
      makePost({ id: `old`, content: `stale`, updateDatetime: new Date(`2026-01-01T00:00:00.000Z`) }),
      makePost({ id: `new`, content: `latest`, updateDatetime: new Date(`2026-01-03T00:00:00.000Z`) }),
    ])

    const peeked = peekDocumentsPagehideBackup()
    expect(peeked?.posts).toHaveLength(1)
    expect(peeked?.posts[0].id).toBe(`new`)
    expect(peeked?.posts[0].content).toBe(`latest`)
    vi.restoreAllMocks()
  })
})

describe(`mergeDocumentsWithBackup`, () => {
  it(`keeps newer stored posts and posts the backup does not mention`, () => {
    const merged = mergeDocumentsWithBackup(
      [
        makePost({
          id: `a`,
          content: `disk`,
          history: [{ datetime: 1, content: `rev` }],
          updateDatetime: new Date(`2026-01-03T00:00:00.000Z`),
        }),
        makePost({ id: `b`, content: `only-disk` }),
      ],
      [
        makePost({
          id: `a`,
          content: `stale`,
          updateDatetime: new Date(`2026-01-01T00:00:00.000Z`),
        }),
        makePost({
          id: `c`,
          content: `only-backup`,
          updateDatetime: new Date(`2026-01-04T00:00:00.000Z`),
        }),
      ],
    )

    expect(merged.map(post => post.id)).toEqual([`a`, `b`, `c`])
    expect(merged[0].content).toBe(`disk`)
    expect(merged[0].history).toEqual([{ datetime: 1, content: `rev` }])
    expect(merged[1].content).toBe(`only-disk`)
    expect(merged[2].content).toBe(`only-backup`)
    expect(merged[2].history).toEqual([{
      datetime: new Date(`2026-01-04T00:00:00.000Z`).getTime(),
      content: `only-backup`,
    }])
  })

  it(`applies a newer backup without dropping stored history`, () => {
    const merged = mergeDocumentsWithBackup(
      [makePost({
        content: `old`,
        history: [{ datetime: 1, content: `rev` }],
        updateDatetime: new Date(`2026-01-01T00:00:00.000Z`),
      })],
      [makePost({
        content: `new`,
        updateDatetime: new Date(`2026-01-05T00:00:00.000Z`),
      })],
    )

    expect(merged).toHaveLength(1)
    expect(merged[0].content).toBe(`new`)
    expect(merged[0].title).toBe(`Draft`)
    expect(merged[0].history).toEqual([{ datetime: 1, content: `rev` }])
  })
})
