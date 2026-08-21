import type { Context } from 'hono'
import type { Env, PushRequest, SyncDocument, SyncSetting, UserRow } from './types'
import { countActiveDocuments, countStoredDocuments, getUserById, listExistingDocuments, pullChanges, pushChanges } from './db'
import { checkSyncRateLimit, getEffectivePlan } from './plan'
import {
  countNewActiveDocuments,
  countNewDocumentIds,
  exceedsStoredDocumentQuota,
  exceedsStoredRowQuota,
  normalizePushDocuments,
  SYNC_PUSH_LIMITS,
  SYNC_STORED_DOCUMENT_LIMIT,
  SYNC_STORED_ROW_LIMIT,
  validatePushPayload,
} from './sync-limits'

type SyncContext = Context<{ Bindings: Env, Variables: { userId: string } }>

async function enforceSyncRateLimit(
  c: SyncContext,
): Promise<{ blocked: Response, user?: undefined } | { blocked: null, user: UserRow }> {
  const userId = c.get(`userId`)
  const user = await getUserById(c.env.DB, userId)
  if (!user)
    return { blocked: c.json({ error: `not_found` }, 404) }

  const plan = getEffectivePlan(user.plan, user.plan_expires_at)
  const rate = await checkSyncRateLimit(c.env.DB, userId, plan)
  if (!rate.allowed) {
    return {
      blocked: c.json({
        error: `rate_limit_exceeded`,
        plan,
        limit: rate.limit,
        retryAfterSec: rate.retryAfterSec,
        upgradeRequired: plan === `free`,
      }, 429),
    }
  }
  return { blocked: null, user }
}

export async function pullHandler(c: SyncContext) {
  const gated = await enforceSyncRateLimit(c)
  if (gated.blocked)
    return gated.blocked

  const userId = c.get(`userId`)
  const sinceRaw = c.req.query(`since`)
  const since = Number.parseInt(sinceRaw ?? `0`, 10)
  const cursor = Number.isFinite(since) && since > 0 ? since : 0

  const { documents, settings, maxCursor } = await pullChanges(c.env, userId, cursor)
  return c.json({ documents, settings, cursor: maxCursor })
}

export async function pushHandler(c: SyncContext) {
  const gated = await enforceSyncRateLimit(c)
  if (gated.blocked)
    return gated.blocked

  const contentLength = Number.parseInt(c.req.header(`Content-Length`) ?? ``, 10)
  if (Number.isFinite(contentLength) && contentLength > SYNC_PUSH_LIMITS.maxRequestBytes) {
    return c.json({
      error: `payload_too_large`,
      max: SYNC_PUSH_LIMITS.maxRequestBytes,
    }, 413)
  }

  const userId = c.get(`userId`)

  let body: PushRequest
  try {
    body = await c.req.json<PushRequest>()
  }
  catch {
    return c.json({ error: `invalid_body` }, 400)
  }

  const documents = body.documents ?? []
  const settings = body.settings ?? []

  const invalid = validatePushPayload(documents, settings)
  if (invalid) {
    return c.json({
      error: invalid.error,
      field: invalid.field,
      max: invalid.max,
    }, invalid.status)
  }

  const typedDocuments = normalizePushDocuments(documents as SyncDocument[])
  const typedSettings = settings as SyncSetting[]

  if (typedDocuments.length > 0) {
    const plan = getEffectivePlan(gated.user.plan, gated.user.plan_expires_at)
    const existing = await listExistingDocuments(
      c.env.DB,
      userId,
      typedDocuments.map(doc => doc.id),
    )
    const storedActiveCount = await countActiveDocuments(c.env.DB, userId)
    const storedRowCount = await countStoredDocuments(c.env.DB, userId)
    const newActiveCount = countNewActiveDocuments(typedDocuments, existing)
    const newRowCount = countNewDocumentIds(typedDocuments, existing)

    if (exceedsStoredDocumentQuota(plan, storedActiveCount, newActiveCount)) {
      return c.json({
        error: `document_quota_exceeded`,
        plan,
        limit: SYNC_STORED_DOCUMENT_LIMIT[plan],
        upgradeRequired: plan === `free`,
      }, 403)
    }

    if (exceedsStoredRowQuota(plan, storedRowCount, newRowCount)) {
      return c.json({
        error: `document_quota_exceeded`,
        plan,
        limit: SYNC_STORED_ROW_LIMIT[plan],
        upgradeRequired: plan === `free`,
      }, 403)
    }
  }

  const { documents: mergedDocs, settings: mergedSettings, maxCursor } = await pushChanges(
    c.env,
    userId,
    typedDocuments,
    typedSettings,
  )
  return c.json({ documents: mergedDocs, settings: mergedSettings, cursor: maxCursor })
}
