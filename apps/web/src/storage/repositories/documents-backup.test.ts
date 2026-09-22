// @vitest-environment jsdom
import type { Post } from '@/types/post'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearDocumentsPagehideBackup,
  DOCUMENTS_PAGEHIDE_BACKUP_KEY,
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
    expect(restored).toHaveLength(1)
    expect(restored?.[0].id).toBe(`post-1`)
    expect(restored?.[0].content).toBe(`keep me`)
    expect(restored?.[0].updateDatetime.toISOString()).toBe(`2026-01-02T00:00:00.000Z`)
  })

  it(`returns null for empty or invalid payloads`, () => {
    expect(parseDocumentsBackup(null)).toBeNull()
    expect(parseDocumentsBackup(`[]`)).toBeNull()
    expect(parseDocumentsBackup(`{`)).toBeNull()
  })

  it(`writes and peeks a localStorage snapshot`, () => {
    writeDocumentsPagehideBackup([makePost({ title: `Saved` })])
    expect(localStorage.getItem(DOCUMENTS_PAGEHIDE_BACKUP_KEY)).toBeTruthy()
    expect(peekDocumentsPagehideBackup()?.[0].title).toBe(`Saved`)
  })

  it(`does not clear a newer backup when an older generation finishes`, () => {
    const first = writeDocumentsPagehideBackup([makePost({ content: `old` })])
    writeDocumentsPagehideBackup([makePost({ content: `new` })])
    clearDocumentsPagehideBackup(first)
    expect(peekDocumentsPagehideBackup()?.[0].content).toBe(`new`)
  })

  it(`clears the matching generation`, () => {
    const generation = writeDocumentsPagehideBackup([makePost()])
    clearDocumentsPagehideBackup(generation)
    expect(peekDocumentsPagehideBackup()).toBeNull()
  })
})
