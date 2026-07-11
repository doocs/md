import type { SyncDocument } from './types'
import type { Post } from '@/types/post'
import { beforeAll, describe, expect, it } from 'vitest'
import { setAppI18n, setupI18n } from '@/i18n'
import { mergeRemoteIntoLocal, postToDoc, toMs } from './merge'

beforeAll(() => {
  setAppI18n(setupI18n(`en-US`))
})

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

function makeDoc(overrides: Partial<SyncDocument> & Pick<SyncDocument, 'id'>): SyncDocument {
  return {
    title: `Doc ${overrides.id}`,
    content: `content-${overrides.id}`,
    history: [],
    createDatetime: Date.parse(`2024-01-01T00:00:00.000Z`),
    updateDatetime: Date.parse(`2024-01-02T00:00:00.000Z`),
    parentId: null,
    deleted: false,
    ...overrides,
  }
}

describe(`toMs`, () => {
  it(`parses Date, string and number`, () => {
    const iso = `2024-06-01T12:00:00.000Z`
    expect(toMs(new Date(iso))).toBe(Date.parse(iso))
    expect(toMs(iso)).toBe(Date.parse(iso))
    expect(toMs(Date.parse(iso))).toBe(Date.parse(iso))
  })

  it(`returns 0 for invalid values`, () => {
    expect(toMs(undefined)).toBe(0)
    expect(toMs(`not-a-date`)).toBe(0)
  })
})

describe(`postToDoc`, () => {
  it(`maps post fields to sync document`, () => {
    const post = makePost({
      id: `a`,
      title: `Hello`,
      content: `Body`,
      parentId: `folder-1`,
      updateDatetime: new Date(`2024-03-01T00:00:00.000Z`),
    })
    const doc = postToDoc(post)
    expect(doc).toMatchObject({
      id: `a`,
      title: `Hello`,
      content: `Body`,
      parentId: `folder-1`,
      deleted: false,
      updateDatetime: Date.parse(`2024-03-01T00:00:00.000Z`),
    })
  })
})

describe(`mergeRemoteIntoLocal`, () => {
  it(`adds remote-only documents`, () => {
    const remote = [makeDoc({ id: `remote-1`, content: `from-cloud` })]
    const { posts, changed } = mergeRemoteIntoLocal([], remote)

    expect(changed).toBe(true)
    expect(posts).toHaveLength(1)
    expect(posts[0].id).toBe(`remote-1`)
    expect(posts[0].content).toBe(`from-cloud`)
  })

  it(`ignores remote soft-deleted docs that do not exist locally`, () => {
    const remote = [makeDoc({ id: `gone`, deleted: true })]
    const { posts, changed } = mergeRemoteIntoLocal([], remote)

    expect(changed).toBe(false)
    expect(posts).toHaveLength(0)
  })

  it(`applies last-write-wins when remote is newer`, () => {
    const local = [makePost({
      id: `shared`,
      content: `local-old`,
      updateDatetime: new Date(`2024-01-01T00:00:00.000Z`),
    })]
    const remote = [makeDoc({
      id: `shared`,
      content: `remote-new`,
      updateDatetime: Date.parse(`2024-02-01T00:00:00.000Z`),
    })]

    const { posts, changed } = mergeRemoteIntoLocal(local, remote)
    expect(changed).toBe(true)
    expect(posts[0].content).toBe(`remote-new`)
    expect(posts[0].history.some(h => h.content === `local-old`)).toBe(true)
  })

  it(`removes local post when newer remote is soft-deleted`, () => {
    const local = [makePost({
      id: `shared`,
      updateDatetime: new Date(`2024-01-01T00:00:00.000Z`),
    })]
    const remote = [makeDoc({
      id: `shared`,
      deleted: true,
      updateDatetime: Date.parse(`2024-02-01T00:00:00.000Z`),
    })]

    const { posts, changed } = mergeRemoteIntoLocal(local, remote)
    expect(changed).toBe(true)
    expect(posts).toHaveLength(0)
  })

  it(`keeps local winner and merges remote content into history`, () => {
    const local = [makePost({
      id: `shared`,
      content: `local-new`,
      updateDatetime: new Date(`2024-03-01T00:00:00.000Z`),
    })]
    const remote = [makeDoc({
      id: `shared`,
      content: `remote-old`,
      updateDatetime: Date.parse(`2024-02-01T00:00:00.000Z`),
    })]

    const { posts, changed } = mergeRemoteIntoLocal(local, remote)
    expect(changed).toBe(true)
    expect(posts[0].content).toBe(`local-new`)
    expect(posts[0].history.some(h => h.content === `remote-old`)).toBe(true)
  })

  it(`does not duplicate identical history entries`, () => {
    const local = [makePost({
      id: `shared`,
      content: `same`,
      updateDatetime: new Date(`2024-03-01T00:00:00.000Z`),
      history: [{ datetime: `2024-01-01 00:00:00`, content: `remote-old` }],
    })]
    const remote = [makeDoc({
      id: `shared`,
      content: `remote-old`,
      updateDatetime: Date.parse(`2024-02-01T00:00:00.000Z`),
    })]

    const { posts, changed } = mergeRemoteIntoLocal(local, remote)
    expect(changed).toBe(false)
    expect(posts[0].history.filter(h => h.content === `remote-old`)).toHaveLength(1)
  })

  it(`preserves local collapsed state when remote wins`, () => {
    const local = [makePost({
      id: `shared`,
      collapsed: true,
      updateDatetime: new Date(`2024-01-01T00:00:00.000Z`),
    })]
    const remote = [makeDoc({
      id: `shared`,
      content: `remote`,
      updateDatetime: Date.parse(`2024-02-01T00:00:00.000Z`),
    })]

    const { posts } = mergeRemoteIntoLocal(local, remote)
    expect(posts[0].collapsed).toBe(true)
  })
})
