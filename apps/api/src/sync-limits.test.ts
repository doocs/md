import { describe, expect, it } from 'vitest'
import {
  countNewActiveDocuments,
  countNewDocumentIds,
  exceedsStoredDocumentQuota,
  exceedsStoredRowQuota,
  normalizePushDocuments,
  SYNC_PUSH_LIMITS,
  SYNC_STORED_DOCUMENT_LIMIT,
  SYNC_STORED_ROW_LIMIT,
  utf8Bytes,
  validatePushPayload,
} from './sync-limits'

function doc(overrides: Record<string, unknown> = {}) {
  return {
    id: `doc-1`,
    title: `Hello`,
    content: `# hi`,
    parentId: null,
    history: [],
    createDatetime: 1,
    updateDatetime: 2,
    deleted: false,
    ...overrides,
  }
}

function setting(overrides: Record<string, unknown> = {}) {
  return {
    key: `theme`,
    value: `default`,
    updatedAt: 1,
    ...overrides,
  }
}

describe(`validatePushPayload`, () => {
  it(`accepts a well-formed empty push`, () => {
    expect(validatePushPayload([], [])).toBeNull()
  })

  it(`accepts valid documents and settings`, () => {
    expect(validatePushPayload([doc()], [setting()])).toBeNull()
  })

  it(`rejects oversized document batches`, () => {
    const documents = Array.from({ length: SYNC_PUSH_LIMITS.maxDocumentsPerPush + 1 }, (_, i) => doc({ id: `d-${i}` }))
    const result = validatePushPayload(documents, [])
    expect(result?.error).toBe(`too_many_documents`)
    expect(result?.status).toBe(413)
    expect(result?.max).toBe(SYNC_PUSH_LIMITS.maxDocumentsPerPush)
  })

  it(`rejects oversized setting batches`, () => {
    const settings = Array.from({ length: SYNC_PUSH_LIMITS.maxSettingsPerPush + 1 }, (_, i) => setting({ key: `k-${i}` }))
    const result = validatePushPayload([], settings)
    expect(result?.error).toBe(`too_many_settings`)
    expect(result?.status).toBe(413)
  })

  it(`rejects oversize content`, () => {
    const content = `x`.repeat(SYNC_PUSH_LIMITS.maxContentBytes + 1)
    const result = validatePushPayload([doc({ content })], [])
    expect(result?.error).toBe(`content_too_large`)
    expect(result?.status).toBe(413)
    expect(utf8Bytes(content)).toBeGreaterThan(SYNC_PUSH_LIMITS.maxContentBytes)
  })

  it(`rejects documents whose stored row would exceed the D1 cap`, () => {
    const block = `x`.repeat(SYNC_PUSH_LIMITS.maxHistoryContentBytes)
    const history = Array.from({ length: 4 }, (_, i) => ({ datetime: i, content: block }))
    const result = validatePushPayload([doc({ content: block, history })], [])
    expect(result?.error).toBe(`document_too_large`)
    expect(result?.status).toBe(413)
    expect(result?.max).toBe(SYNC_PUSH_LIMITS.maxDocumentRowBytes)
  })

  it(`rejects oversize titles by utf-8 bytes`, () => {
    const title = `你`.repeat(SYNC_PUSH_LIMITS.maxTitleChars)
    const result = validatePushPayload([doc({ title })], [])
    expect(result?.error).toBe(`title_too_large`)
    expect(utf8Bytes(title)).toBeGreaterThan(SYNC_PUSH_LIMITS.maxTitleChars)
  })

  it(`rejects malformed documents`, () => {
    expect(validatePushPayload([{ id: `x` }], [])?.error).toBe(`invalid_document`)
    expect(validatePushPayload([doc({ id: `` })], [])?.error).toBe(`invalid_document_id`)
    expect(validatePushPayload([doc({ deleted: `no` as never })], [])?.error).toBe(`invalid_document`)
    expect(validatePushPayload([doc({ history: `oops` as never })], [])?.error).toBe(`invalid_history`)
    expect(validatePushPayload([doc({ parentId: `x`.repeat(SYNC_PUSH_LIMITS.maxIdChars + 1) })], [])?.error).toBe(`invalid_document_parent_id`)
    expect(validatePushPayload([doc({ parentId: `` })], [])?.error).toBe(`invalid_document_parent_id`)
  })

  it(`rejects overlong history and history content`, () => {
    const history = Array.from({ length: SYNC_PUSH_LIMITS.maxHistoryItems + 1 }, (_, i) => ({
      datetime: i,
      content: `n${i}`,
    }))
    expect(validatePushPayload([doc({ history })], [])?.error).toBe(`history_too_long`)

    const huge = { datetime: 1, content: `y`.repeat(SYNC_PUSH_LIMITS.maxHistoryContentBytes + 1) }
    expect(validatePushPayload([doc({ history: [huge] })], [])?.error).toBe(`history_content_too_large`)
  })

  it(`rejects invalid settings`, () => {
    expect(validatePushPayload([], [setting({ key: `` })])?.error).toBe(`invalid_setting_key`)
    expect(validatePushPayload([], [setting({ value: 1 })])?.error).toBe(`invalid_setting`)
    const value = `z`.repeat(SYNC_PUSH_LIMITS.maxSettingValueBytes + 1)
    expect(validatePushPayload([], [setting({ value })])?.error).toBe(`setting_value_too_large`)
  })
})

describe(`stored document quota`, () => {
  it(`allows updates when already at the cap`, () => {
    expect(exceedsStoredDocumentQuota(`free`, SYNC_STORED_DOCUMENT_LIMIT.free, 0)).toBe(false)
    expect(countNewActiveDocuments([
      { ...doc({ id: `existing` }), deleted: false } as never,
    ], new Map([[`existing`, false]]))).toBe(0)
  })

  it(`blocks new active documents past the plan cap`, () => {
    expect(exceedsStoredDocumentQuota(`free`, SYNC_STORED_DOCUMENT_LIMIT.free, 1)).toBe(true)
    expect(exceedsStoredDocumentQuota(`pro`, SYNC_STORED_DOCUMENT_LIMIT.pro - 1, 1)).toBe(false)
    expect(countNewActiveDocuments([
      doc({ id: `new-1` }) as never,
      doc({ id: `new-2`, deleted: true }) as never,
    ], new Map())).toBe(1)
  })

  it(`counts resurrected tombstones as new active documents`, () => {
    expect(countNewActiveDocuments([
      doc({ id: `was-deleted`, deleted: false }) as never,
    ], new Map([[`was-deleted`, true]]))).toBe(1)
    expect(countNewActiveDocuments([
      doc({ id: `was-deleted`, deleted: false }) as never,
      doc({ id: `was-deleted`, deleted: false }) as never,
    ], new Map([[`was-deleted`, true]]))).toBe(1)
  })

  it(`counts unknown tombstones toward the row cap`, () => {
    expect(exceedsStoredRowQuota(`free`, SYNC_STORED_ROW_LIMIT.free, 0)).toBe(false)
    expect(exceedsStoredRowQuota(`free`, SYNC_STORED_ROW_LIMIT.free, 1)).toBe(true)
    expect(countNewDocumentIds([
      doc({ id: `existing` }) as never,
      doc({ id: `tomb`, deleted: true }) as never,
    ], new Map([[`existing`, false]]))).toBe(1)
  })
})

describe(`normalizePushDocuments`, () => {
  it(`strips title, content and history from tombstones`, () => {
    const [tomb, live] = normalizePushDocuments([
      doc({ id: `gone`, deleted: true, title: `x`, content: `huge`, history: [{ datetime: 1, content: `h` }] }) as never,
      doc({ id: `live`, content: `keep` }) as never,
    ])
    expect(tomb).toMatchObject({ id: `gone`, deleted: true, title: ``, content: ``, history: [] })
    expect(live.content).toBe(`keep`)
  })
})
