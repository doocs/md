import type { UserPlan } from './plan'
import type { SyncDocument } from './types'

export const SYNC_PUSH_LIMITS = {
  maxDocumentsPerPush: 100,
  maxSettingsPerPush: 80,
  maxIdChars: 128,
  maxTitleChars: 500,
  maxContentBytes: 512 * 1024,
  maxHistoryItems: 20,
  maxHistoryContentBytes: 512 * 1024,
  maxSettingKeyChars: 256,
  maxSettingValueBytes: 1024 * 1024,
  maxRequestBytes: 8 * 1024 * 1024,
  /** D1 row/string cap is 2MB; leave headroom for other columns and JSON escaping. */
  maxDocumentRowBytes: 1_800_000,
} as const

export const SYNC_STORED_DOCUMENT_LIMIT: Record<UserPlan, number> = {
  free: 200,
  pro: 2000,
}

/** Total D1 rows including tombstones; keeps delete+create from consuming the active cap. */
export const SYNC_STORED_ROW_LIMIT: Record<UserPlan, number> = {
  free: 400,
  pro: 4000,
}

const textEncoder = new TextEncoder()

export function utf8Bytes(value: string): number {
  return textEncoder.encode(value).length
}

export interface SyncPayloadRejection {
  error: string
  status: 400 | 413
  field?: string
  max?: number
}

function reject(error: string, status: 400 | 413, extra?: { field?: string, max?: number }): SyncPayloadRejection {
  return { error, status, ...extra }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === `number` && Number.isFinite(value)
}

function validateHistory(
  history: unknown,
): SyncPayloadRejection | null {
  if (history == null)
    return null
  if (!Array.isArray(history))
    return reject(`invalid_history`, 400, { field: `documents.history` })
  if (history.length > SYNC_PUSH_LIMITS.maxHistoryItems) {
    return reject(`history_too_long`, 413, {
      field: `documents.history`,
      max: SYNC_PUSH_LIMITS.maxHistoryItems,
    })
  }

  for (const item of history) {
    if (item == null || typeof item !== `object`)
      return reject(`invalid_history`, 400, { field: `documents.history` })

    const record = item as Record<string, unknown>
    const datetimeOk = isFiniteNumber(record.datetime) || typeof record.datetime === `string`
    if (!datetimeOk || typeof record.content !== `string`)
      return reject(`invalid_history`, 400, { field: `documents.history` })

    if (utf8Bytes(record.content) > SYNC_PUSH_LIMITS.maxHistoryContentBytes) {
      return reject(`history_content_too_large`, 413, {
        field: `documents.history.content`,
        max: SYNC_PUSH_LIMITS.maxHistoryContentBytes,
      })
    }
  }

  return null
}

function validateDocument(doc: unknown): SyncPayloadRejection | null {
  if (doc == null || typeof doc !== `object`)
    return reject(`invalid_document`, 400, { field: `documents` })

  const record = doc as Record<string, unknown>
  if (typeof record.id !== `string` || record.id.length === 0 || record.id.length > SYNC_PUSH_LIMITS.maxIdChars)
    return reject(`invalid_document_id`, 400, { field: `documents.id`, max: SYNC_PUSH_LIMITS.maxIdChars })
  if (typeof record.title !== `string`)
    return reject(`invalid_document`, 400, { field: `documents.title` })
  if (utf8Bytes(record.title) > SYNC_PUSH_LIMITS.maxTitleChars)
    return reject(`title_too_large`, 413, { field: `documents.title`, max: SYNC_PUSH_LIMITS.maxTitleChars })
  if (typeof record.content !== `string`)
    return reject(`invalid_document`, 400, { field: `documents.content` })
  if (utf8Bytes(record.content) > SYNC_PUSH_LIMITS.maxContentBytes) {
    return reject(`content_too_large`, 413, {
      field: `documents.content`,
      max: SYNC_PUSH_LIMITS.maxContentBytes,
    })
  }
  if (record.parentId != null) {
    if (typeof record.parentId !== `string` || record.parentId.length === 0 || record.parentId.length > SYNC_PUSH_LIMITS.maxIdChars) {
      return reject(`invalid_document_parent_id`, 400, {
        field: `documents.parentId`,
        max: SYNC_PUSH_LIMITS.maxIdChars,
      })
    }
  }
  if (!isFiniteNumber(record.createDatetime) || !isFiniteNumber(record.updateDatetime))
    return reject(`invalid_document`, 400, { field: `documents.updateDatetime` })
  if (typeof record.deleted !== `boolean`)
    return reject(`invalid_document`, 400, { field: `documents.deleted` })

  const historyError = validateHistory(record.history)
  if (historyError)
    return historyError

  if (estimateDocumentRowBytes(record) > SYNC_PUSH_LIMITS.maxDocumentRowBytes) {
    return reject(`document_too_large`, 413, {
      field: `documents`,
      max: SYNC_PUSH_LIMITS.maxDocumentRowBytes,
    })
  }

  return null
}

export function estimateDocumentRowBytes(record: Record<string, unknown>): number {
  const id = typeof record.id === `string` ? record.id : ``
  const title = typeof record.title === `string` ? record.title : ``
  const content = typeof record.content === `string` ? record.content : ``
  const parentId = typeof record.parentId === `string` ? record.parentId : ``
  const history = Array.isArray(record.history) ? record.history : []
  return utf8Bytes(id) + utf8Bytes(title) + utf8Bytes(content) + utf8Bytes(parentId) + utf8Bytes(JSON.stringify(history))
}

function validateSetting(setting: unknown): SyncPayloadRejection | null {
  if (setting == null || typeof setting !== `object`)
    return reject(`invalid_setting`, 400, { field: `settings` })

  const record = setting as Record<string, unknown>
  if (typeof record.key !== `string` || record.key.length === 0 || record.key.length > SYNC_PUSH_LIMITS.maxSettingKeyChars) {
    return reject(`invalid_setting_key`, 400, {
      field: `settings.key`,
      max: SYNC_PUSH_LIMITS.maxSettingKeyChars,
    })
  }
  if (record.value != null && typeof record.value !== `string`)
    return reject(`invalid_setting`, 400, { field: `settings.value` })
  if (typeof record.value === `string` && utf8Bytes(record.value) > SYNC_PUSH_LIMITS.maxSettingValueBytes) {
    return reject(`setting_value_too_large`, 413, {
      field: `settings.value`,
      max: SYNC_PUSH_LIMITS.maxSettingValueBytes,
    })
  }
  if (!isFiniteNumber(record.updatedAt))
    return reject(`invalid_setting`, 400, { field: `settings.updatedAt` })

  return null
}

/** Validate push arrays before any D1 writes. Does not mutate input. */
export function validatePushPayload(
  documents: unknown,
  settings: unknown,
): SyncPayloadRejection | null {
  if (!Array.isArray(documents))
    return reject(`invalid_body`, 400, { field: `documents` })
  if (!Array.isArray(settings))
    return reject(`invalid_body`, 400, { field: `settings` })

  if (documents.length > SYNC_PUSH_LIMITS.maxDocumentsPerPush) {
    return reject(`too_many_documents`, 413, {
      field: `documents`,
      max: SYNC_PUSH_LIMITS.maxDocumentsPerPush,
    })
  }
  if (settings.length > SYNC_PUSH_LIMITS.maxSettingsPerPush) {
    return reject(`too_many_settings`, 413, {
      field: `settings`,
      max: SYNC_PUSH_LIMITS.maxSettingsPerPush,
    })
  }

  for (const doc of documents) {
    const failed = validateDocument(doc)
    if (failed)
      return failed
  }
  for (const setting of settings) {
    const failed = validateSetting(setting)
    if (failed)
      return failed
  }

  let payloadBytes = 0
  for (const doc of documents) {
    payloadBytes += estimateDocumentRowBytes(doc as Record<string, unknown>)
  }
  for (const setting of settings) {
    const record = setting as Record<string, unknown>
    if (typeof record.key === `string`)
      payloadBytes += utf8Bytes(record.key)
    if (typeof record.value === `string`)
      payloadBytes += utf8Bytes(record.value)
  }
  if (payloadBytes > SYNC_PUSH_LIMITS.maxRequestBytes) {
    return reject(`payload_too_large`, 413, {
      field: `body`,
      max: SYNC_PUSH_LIMITS.maxRequestBytes,
    })
  }

  return null
}

/** Drop body/history on tombstones so deleted rows cannot be used for storage DoS. */
export function normalizePushDocuments(documents: SyncDocument[]): SyncDocument[] {
  return documents.map((doc) => {
    if (!doc.deleted)
      return doc
    return {
      ...doc,
      title: ``,
      content: ``,
      history: [],
    }
  })
}

export function countNewDocumentIds(
  documents: SyncDocument[],
  existing: ReadonlyMap<string, boolean>,
): number {
  const seen = new Set<string>()
  let added = 0
  for (const doc of documents) {
    if (seen.has(doc.id))
      continue
    seen.add(doc.id)
    if (!existing.has(doc.id))
      added++
  }
  return added
}

/**
 * New active rows: inserts of live docs, plus resurrecting a tombstone.
 * Duplicate ids in one push count once.
 */
export function countNewActiveDocuments(
  documents: SyncDocument[],
  existing: ReadonlyMap<string, boolean>,
): number {
  const seen = new Set<string>()
  let added = 0
  for (const doc of documents) {
    if (doc.deleted || seen.has(doc.id))
      continue
    seen.add(doc.id)
    const deleted = existing.get(doc.id)
    if (deleted == null || deleted)
      added++
  }
  return added
}

export function exceedsStoredDocumentQuota(
  plan: UserPlan,
  storedActiveCount: number,
  newActiveCount: number,
): boolean {
  if (newActiveCount <= 0)
    return false
  return storedActiveCount + newActiveCount > SYNC_STORED_DOCUMENT_LIMIT[plan]
}

export function exceedsStoredRowQuota(
  plan: UserPlan,
  storedRowCount: number,
  newRowCount: number,
): boolean {
  if (newRowCount <= 0)
    return false
  return storedRowCount + newRowCount > SYNC_STORED_ROW_LIMIT[plan]
}
