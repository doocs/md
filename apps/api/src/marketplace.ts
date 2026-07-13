import type { Context } from 'hono'
import type { MarketplaceItemType, MarketplaceSort } from './marketplace-types'
import type { NotificationPayload } from './notifications-db'
import type { Env, JwtPayload } from './types'
import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { authMiddleware } from './auth'
import { getUserById } from './db'
import { isAdmin } from './marketplace-admin'
import {
  approveMarketplaceItem,
  consumeMarketplacePublishRateLimit,
  deleteMarketplaceItemByAuthor,
  getMarketplaceItemById,
  incrementDownloadCount,
  insertMarketplaceItem,
  listApprovedItems,
  listItemsByAuthor,
  listPendingItems,
  rejectMarketplaceItem,
  rowToDetail,
  rowToSummary,
  updateMarketplaceItemByAuthor,
} from './marketplace-db'
import {
  parseRejectReason,
  validatePublishComponent,
  validatePublishTheme,
  validateUpdate,
} from './marketplace-validate'
import {
  notifyUsers,
  resolveAdminUserIds,
} from './notifications-db'
import { getEffectivePlan } from './plan'

const MARKETPLACE_PUBLISH_LIMIT = {
  free: 5,
  pro: 30,
} as const

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 50

interface AppEnv { Bindings: Env, Variables: { userId: string } }
type AppContext = Context<AppEnv>

function requireId(c: AppContext): string | null {
  const id = c.req.param(`id`)
  return id || null
}

function parseType(value: string | undefined): MarketplaceItemType | null {
  if (value === `theme` || value === `component`)
    return value
  return null
}

function parseSort(value: string | undefined): MarketplaceSort {
  return value === `popular` ? `popular` : `newest`
}

function parsePage(value: string | undefined): number {
  const n = Number.parseInt(value ?? `1`, 10)
  if (!Number.isFinite(n) || n < 1)
    return 1
  return n
}

function parsePageSize(value: string | undefined): number {
  const n = Number.parseInt(value ?? String(DEFAULT_PAGE_SIZE), 10)
  if (!Number.isFinite(n) || n < 1)
    return DEFAULT_PAGE_SIZE
  return Math.min(n, MAX_PAGE_SIZE)
}

async function tryGetUserId(c: AppContext): Promise<string | null> {
  const header = c.req.header(`Authorization`) ?? ``
  const token = header.startsWith(`Bearer `) ? header.slice(7) : ``
  if (!token)
    return null
  try {
    const payload = (await verify(token, c.env.JWT_SECRET, `HS256`)) as unknown as JwtPayload
    if (!payload || typeof payload.sub !== `string` || !payload.sub)
      return null
    return payload.sub
  }
  catch {
    return null
  }
}

async function requireAdmin(
  c: AppContext,
): Promise<{ ok: true } | { ok: false, response: Response }> {
  const user = await getUserById(c.env.DB, c.get(`userId`))
  if (!user)
    return { ok: false, response: c.json({ error: `not_found` }, 404) }
  if (!isAdmin(c.env, user.login))
    return { ok: false, response: c.json({ error: `forbidden` }, 403) }
  return { ok: true }
}

function notificationPayloadFromRow(row: {
  id: string
  type: MarketplaceItemType
  name: string
  slug: string
  reject_reason?: string | null
}): NotificationPayload {
  return {
    itemId: row.id,
    itemType: row.type,
    name: row.name,
    slug: row.slug,
    rejectReason: row.reject_reason ?? null,
  }
}

async function notifyAdminsPending(
  c: AppContext,
  row: { id: string, type: MarketplaceItemType, name: string, slug: string, author_id: string },
  createdAt: number,
) {
  try {
    // Notify all admins who have logged in (including the author when they are an admin).
    const adminIds = await resolveAdminUserIds(c.env)
    await notifyUsers(c.env.DB, adminIds, {
      type: `marketplace_pending`,
      payload: notificationPayloadFromRow(row),
      createdAt,
    })
  }
  catch (err) {
    console.error(`[marketplace] notifyAdminsPending failed`, err)
  }
}

async function notifyAuthorReviewResult(
  c: AppContext,
  row: { id: string, type: MarketplaceItemType, name: string, slug: string, author_id: string, reject_reason?: string | null },
  type: `marketplace_approved` | `marketplace_rejected`,
  createdAt: number,
) {
  try {
    await notifyUsers(c.env.DB, [row.author_id], {
      type,
      payload: notificationPayloadFromRow(row),
      createdAt,
    })
  }
  catch (err) {
    console.error(`[marketplace] notifyAuthorReviewResult failed`, err)
  }
}

async function listPublicHandler(
  c: AppContext,
  type: MarketplaceItemType,
) {
  const q = (c.req.query(`q`) ?? ``).trim().slice(0, 64) || undefined
  const sort = parseSort(c.req.query(`sort`))
  const page = parsePage(c.req.query(`page`))
  const pageSize = parsePageSize(c.req.query(`pageSize`))

  const { rows, total } = await listApprovedItems(c.env.DB, {
    type,
    q,
    sort,
    page,
    pageSize,
  })

  return c.json({
    items: rows.map(row => rowToSummary(row)),
    total,
    page,
    pageSize,
  })
}

async function getMarketplaceItemHandler(c: AppContext) {
  const id = requireId(c)
  if (!id)
    return c.json({ error: `not_found` }, 404)

  const row = await getMarketplaceItemById(c.env.DB, id)
  if (!row)
    return c.json({ error: `not_found` }, 404)

  const userId = await tryGetUserId(c)
  const user = userId ? await getUserById(c.env.DB, userId) : null
  const isAuthor = userId === row.author_id
  const admin = user ? isAdmin(c.env, user.login) : false

  if (row.status !== `approved` && !isAuthor && !admin)
    return c.json({ error: `not_found` }, 404)

  return c.json(rowToDetail(row, isAuthor || admin))
}

async function installMarketplaceItemHandler(c: AppContext) {
  const id = requireId(c)
  if (!id)
    return c.json({ error: `not_found` }, 404)

  const row = await getMarketplaceItemById(c.env.DB, id)
  if (!row || row.status !== `approved`)
    return c.json({ error: `not_found` }, 404)

  const downloadCount = await incrementDownloadCount(c.env.DB, id)

  return c.json({
    ...rowToDetail(row),
    downloadCount,
  })
}

async function publishHandler(
  c: AppContext,
  type: MarketplaceItemType,
) {
  const userId = c.get(`userId`)
  const user = await getUserById(c.env.DB, userId)
  if (!user)
    return c.json({ error: `not_found` }, 404)

  // Admins (e.g. marketplace reviewers) are not subject to daily publish caps.
  if (!isAdmin(c.env, user.login)) {
    const plan = getEffectivePlan(user.plan ?? `free`, user.plan_expires_at ?? null)
    const limit = MARKETPLACE_PUBLISH_LIMIT[plan]
    const rate = await consumeMarketplacePublishRateLimit(c.env.DB, userId, limit)
    if (!rate.allowed) {
      return c.json(
        { error: `rate_limited`, limit: rate.limit, retryAfterSec: rate.retryAfterSec },
        429,
      )
    }
  }

  const body = await c.req.json().catch(() => null)
  const validated = type === `theme`
    ? validatePublishTheme(body)
    : validatePublishComponent(body)

  if (!validated.ok)
    return c.json({ error: validated.error }, 400)

  const now = Date.now()
  const id = crypto.randomUUID()

  try {
    await insertMarketplaceItem(c.env.DB, {
      id,
      authorId: userId,
      data: validated.value,
      status: `pending`,
      createdAt: now,
    })
  }
  catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes(`UNIQUE`) || message.includes(`unique`))
      return c.json({ error: `slug_taken` }, 409)
    throw err
  }

  const row = await getMarketplaceItemById(c.env.DB, id)
  if (!row)
    return c.json({ error: `not_found` }, 404)

  await notifyAdminsPending(c, row, now)

  return c.json(rowToDetail(row, true), 201)
}

async function listMyMarketplaceItemsHandler(c: AppContext) {
  const rows = await listItemsByAuthor(c.env.DB, c.get(`userId`))
  return c.json({
    items: rows.map(row => rowToSummary(row, true)),
  })
}

async function updateMarketplaceItemHandler(c: AppContext) {
  const id = requireId(c)
  if (!id)
    return c.json({ error: `not_found` }, 404)

  const existing = await getMarketplaceItemById(c.env.DB, id)
  if (!existing)
    return c.json({ error: `not_found` }, 404)
  if (existing.author_id !== c.get(`userId`))
    return c.json({ error: `forbidden` }, 403)

  const body = await c.req.json().catch(() => null)
  const validated = validateUpdate(existing.type, body, { currentVersion: existing.version })
  if (!validated.ok)
    return c.json({ error: validated.error }, 400)

  const now = Date.now()
  const ok = await updateMarketplaceItemByAuthor(c.env.DB, {
    id,
    authorId: c.get(`userId`),
    patch: validated.value,
    status: `pending`,
    updatedAt: now,
  })
  if (!ok)
    return c.json({ error: `not_found` }, 404)

  const row = await getMarketplaceItemById(c.env.DB, id)
  if (!row)
    return c.json({ error: `not_found` }, 404)

  await notifyAdminsPending(c, row, now)

  return c.json(rowToDetail(row, true))
}

async function deleteMarketplaceItemHandler(c: AppContext) {
  const id = requireId(c)
  if (!id)
    return c.json({ error: `not_found` }, 404)

  const ok = await deleteMarketplaceItemByAuthor(c.env.DB, c.get(`userId`), id)
  if (!ok)
    return c.json({ error: `not_found` }, 404)
  return c.json({ ok: true })
}

async function listPendingMarketplaceHandler(c: AppContext) {
  const adminCheck = await requireAdmin(c)
  if (!adminCheck.ok)
    return adminCheck.response

  const type = parseType(c.req.query(`type`)) ?? undefined
  const page = parsePage(c.req.query(`page`))
  const pageSize = parsePageSize(c.req.query(`pageSize`))
  const { rows, total } = await listPendingItems(c.env.DB, { page, pageSize, type })

  return c.json({
    items: rows.map(row => rowToDetail(row, true)),
    total,
    page,
    pageSize,
  })
}

async function approveMarketplaceItemHandler(c: AppContext) {
  const adminCheck = await requireAdmin(c)
  if (!adminCheck.ok)
    return adminCheck.response

  const id = requireId(c)
  if (!id)
    return c.json({ error: `not_found` }, 404)

  const now = Date.now()
  const ok = await approveMarketplaceItem(c.env.DB, id, now)
  if (!ok)
    return c.json({ error: `not_found` }, 404)

  const row = await getMarketplaceItemById(c.env.DB, id)
  if (!row)
    return c.json({ error: `not_found` }, 404)

  await notifyAuthorReviewResult(c, row, `marketplace_approved`, now)

  return c.json(rowToDetail(row, true))
}

async function rejectMarketplaceItemHandler(c: AppContext) {
  const adminCheck = await requireAdmin(c)
  if (!adminCheck.ok)
    return adminCheck.response

  const id = requireId(c)
  if (!id)
    return c.json({ error: `not_found` }, 404)

  const body = await c.req.json().catch(() => ({}))
  const reason = parseRejectReason((body as { reason?: unknown }).reason)
  const now = Date.now()
  const ok = await rejectMarketplaceItem(c.env.DB, id, reason, now)
  if (!ok)
    return c.json({ error: `not_found` }, 404)

  const row = await getMarketplaceItemById(c.env.DB, id)
  if (!row)
    return c.json({ error: `not_found` }, 404)

  await notifyAuthorReviewResult(c, row, `marketplace_rejected`, now)

  return c.json(rowToDetail(row, true))
}

/**
 * Marketplace routes.
 * Static paths (/themes, /components, /me, /admin/*) are registered before /:id.
 */
export const marketplaceRoutes = new Hono<{ Bindings: Env, Variables: { userId: string } }>()

marketplaceRoutes.get(`/themes`, c => listPublicHandler(c, `theme`))
marketplaceRoutes.get(`/components`, c => listPublicHandler(c, `component`))

marketplaceRoutes.get(`/me`, authMiddleware, listMyMarketplaceItemsHandler)
marketplaceRoutes.post(`/themes`, authMiddleware, c => publishHandler(c, `theme`))
marketplaceRoutes.post(`/components`, authMiddleware, c => publishHandler(c, `component`))

marketplaceRoutes.get(`/admin/pending`, authMiddleware, listPendingMarketplaceHandler)
marketplaceRoutes.post(`/admin/:id/approve`, authMiddleware, approveMarketplaceItemHandler)
marketplaceRoutes.post(`/admin/:id/reject`, authMiddleware, rejectMarketplaceItemHandler)

marketplaceRoutes.get(`/:id`, getMarketplaceItemHandler)
marketplaceRoutes.post(`/:id/install`, installMarketplaceItemHandler)
marketplaceRoutes.patch(`/:id`, authMiddleware, updateMarketplaceItemHandler)
marketplaceRoutes.delete(`/:id`, authMiddleware, deleteMarketplaceItemHandler)
