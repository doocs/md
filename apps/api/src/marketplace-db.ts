import type {
  MarketplaceAuthorInfo,
  MarketplaceItemRow,
  MarketplaceItemStatus,
  MarketplaceItemType,
  MarketplaceSort,
} from './marketplace-types'
import type { NormalizedPublish, NormalizedUpdate } from './marketplace-validate'

export interface MarketplaceListRow extends MarketplaceItemRow {
  author_login: string
  author_name: string | null
  author_avatar: string | null
}

function authorFromRow(row: MarketplaceListRow): MarketplaceAuthorInfo {
  return {
    id: row.author_id,
    login: row.author_login,
    name: row.author_name,
    avatar: row.author_avatar,
  }
}

export function rowToSummary(row: MarketplaceListRow, includeRejectReason = false) {
  return {
    id: row.id,
    type: row.type,
    slug: row.slug,
    name: row.name,
    description: row.description,
    version: row.version,
    coverUrl: row.cover_url,
    primaryColor: row.primary_color,
    status: row.status,
    ...(includeRejectReason ? { rejectReason: row.reject_reason } : {}),
    downloadCount: row.download_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    author: authorFromRow(row),
  }
}

export function rowToDetail(row: MarketplaceListRow, includeRejectReason = false) {
  return {
    ...rowToSummary(row, includeRejectReason),
    payload: row.payload,
    sampleMarkdown: row.sample_markdown ?? null,
  }
}

const AUTHOR_JOIN = `
  SELECT m.*,
         u.login AS author_login,
         u.name AS author_name,
         u.avatar AS author_avatar
  FROM marketplace_items m
  JOIN users u ON u.id = m.author_id
`

export async function getMarketplaceItemById(
  db: D1Database,
  id: string,
): Promise<MarketplaceListRow | null> {
  return db
    .prepare(`${AUTHOR_JOIN} WHERE m.id = ?`)
    .bind(id)
    .first<MarketplaceListRow>()
}

export async function listApprovedItems(
  db: D1Database,
  opts: {
    type: MarketplaceItemType
    q?: string
    sort: MarketplaceSort
    page: number
    pageSize: number
  },
): Promise<{ rows: MarketplaceListRow[], total: number }> {
  const offset = (opts.page - 1) * opts.pageSize
  const orderBy = opts.sort === `popular`
    ? `m.download_count DESC, m.published_at DESC`
    : `m.published_at DESC, m.updated_at DESC`

  if (opts.q) {
    const like = `%${opts.q}%`
    const totalRow = await db
      .prepare(
        `SELECT COUNT(*) AS total FROM marketplace_items m
         WHERE m.type = ? AND m.status = 'approved'
           AND (m.name LIKE ? OR m.description LIKE ? OR m.slug LIKE ?)`,
      )
      .bind(opts.type, like, like, like)
      .first<{ total: number }>()

    const result = await db
      .prepare(
        `${AUTHOR_JOIN}
         WHERE m.type = ? AND m.status = 'approved'
           AND (m.name LIKE ? OR m.description LIKE ? OR m.slug LIKE ?)
         ORDER BY ${orderBy}
         LIMIT ? OFFSET ?`,
      )
      .bind(opts.type, like, like, like, opts.pageSize, offset)
      .all<MarketplaceListRow>()

    return { rows: result.results ?? [], total: totalRow?.total ?? 0 }
  }

  const totalRow = await db
    .prepare(
      `SELECT COUNT(*) AS total FROM marketplace_items
       WHERE type = ? AND status = 'approved'`,
    )
    .bind(opts.type)
    .first<{ total: number }>()

  const result = await db
    .prepare(
      `${AUTHOR_JOIN}
       WHERE m.type = ? AND m.status = 'approved'
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
    )
    .bind(opts.type, opts.pageSize, offset)
    .all<MarketplaceListRow>()

  return { rows: result.results ?? [], total: totalRow?.total ?? 0 }
}

export async function listItemsByAuthor(
  db: D1Database,
  authorId: string,
): Promise<MarketplaceListRow[]> {
  const result = await db
    .prepare(
      `${AUTHOR_JOIN}
       WHERE m.author_id = ?
       ORDER BY m.updated_at DESC`,
    )
    .bind(authorId)
    .all<MarketplaceListRow>()

  return result.results ?? []
}

export async function listPendingItems(
  db: D1Database,
  opts: { page: number, pageSize: number, type?: MarketplaceItemType },
): Promise<{ rows: MarketplaceListRow[], total: number }> {
  const offset = (opts.page - 1) * opts.pageSize

  if (opts.type) {
    const totalRow = await db
      .prepare(
        `SELECT COUNT(*) AS total FROM marketplace_items
         WHERE status = 'pending' AND type = ?`,
      )
      .bind(opts.type)
      .first<{ total: number }>()

    const result = await db
      .prepare(
        `${AUTHOR_JOIN}
         WHERE m.status = 'pending' AND m.type = ?
         ORDER BY m.updated_at ASC
         LIMIT ? OFFSET ?`,
      )
      .bind(opts.type, opts.pageSize, offset)
      .all<MarketplaceListRow>()

    return { rows: result.results ?? [], total: totalRow?.total ?? 0 }
  }

  const totalRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM marketplace_items WHERE status = 'pending'`)
    .first<{ total: number }>()

  const result = await db
    .prepare(
      `${AUTHOR_JOIN}
       WHERE m.status = 'pending'
       ORDER BY m.updated_at ASC
       LIMIT ? OFFSET ?`,
    )
    .bind(opts.pageSize, offset)
    .all<MarketplaceListRow>()

  return { rows: result.results ?? [], total: totalRow?.total ?? 0 }
}

export async function insertMarketplaceItem(
  db: D1Database,
  row: {
    id: string
    authorId: string
    data: NormalizedPublish
    status: MarketplaceItemStatus
    createdAt: number
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO marketplace_items (
         id, type, author_id, slug, name, description, version,
         cover_url, primary_color, sample_markdown, payload, status, reject_reason,
         download_count, created_at, updated_at, published_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?, NULL)`,
    )
    .bind(
      row.id,
      row.data.type,
      row.authorId,
      row.data.slug,
      row.data.name,
      row.data.description,
      row.data.version,
      row.data.coverUrl,
      row.data.primaryColor,
      row.data.sampleMarkdown,
      row.data.payload,
      row.status,
      row.createdAt,
      row.createdAt,
    )
    .run()
}

export async function updateMarketplaceItemByAuthor(
  db: D1Database,
  opts: {
    id: string
    authorId: string
    patch: NormalizedUpdate
    status: MarketplaceItemStatus
    updatedAt: number
  },
): Promise<boolean> {
  const existing = await db
    .prepare(`SELECT * FROM marketplace_items WHERE id = ? AND author_id = ?`)
    .bind(opts.id, opts.authorId)
    .first<MarketplaceItemRow>()

  if (!existing)
    return false

  const name = opts.patch.name ?? existing.name
  const description = opts.patch.description ?? existing.description
  const version = opts.patch.version ?? existing.version
  const coverUrl = opts.patch.coverUrl !== undefined ? opts.patch.coverUrl : existing.cover_url
  const primaryColor = opts.patch.primaryColor !== undefined
    ? opts.patch.primaryColor
    : existing.primary_color
  const sampleMarkdown = opts.patch.sampleMarkdown !== undefined
    ? opts.patch.sampleMarkdown
    : existing.sample_markdown
  const payload = opts.patch.payload ?? existing.payload

  const result = await db
    .prepare(
      `UPDATE marketplace_items
       SET name = ?, description = ?, version = ?, cover_url = ?, primary_color = ?,
           sample_markdown = ?, payload = ?, status = ?, reject_reason = NULL, updated_at = ?, published_at = NULL
       WHERE id = ? AND author_id = ?`,
    )
    .bind(
      name,
      description,
      version,
      coverUrl,
      primaryColor,
      sampleMarkdown,
      payload,
      opts.status,
      opts.updatedAt,
      opts.id,
      opts.authorId,
    )
    .run()

  return (result.meta.changes ?? 0) > 0
}

export async function deleteMarketplaceItemByAuthor(
  db: D1Database,
  authorId: string,
  id: string,
): Promise<boolean> {
  const result = await db
    .prepare(`DELETE FROM marketplace_items WHERE id = ? AND author_id = ?`)
    .bind(id, authorId)
    .run()

  return (result.meta.changes ?? 0) > 0
}

export async function approveMarketplaceItem(
  db: D1Database,
  id: string,
  publishedAt: number,
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE marketplace_items
       SET status = 'approved', reject_reason = NULL,
           published_at = ?, updated_at = ?
       WHERE id = ? AND status = 'pending'`,
    )
    .bind(publishedAt, publishedAt, id)
    .run()

  return (result.meta.changes ?? 0) > 0
}

export async function rejectMarketplaceItem(
  db: D1Database,
  id: string,
  reason: string | null,
  updatedAt: number,
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE marketplace_items
       SET status = 'rejected', reject_reason = ?, updated_at = ?, published_at = NULL
       WHERE id = ? AND status = 'pending'`,
    )
    .bind(reason, updatedAt, id)
    .run()

  return (result.meta.changes ?? 0) > 0
}

export async function incrementDownloadCount(db: D1Database, id: string): Promise<number> {
  await db
    .prepare(`UPDATE marketplace_items SET download_count = download_count + 1 WHERE id = ?`)
    .bind(id)
    .run()

  const row = await db
    .prepare(`SELECT download_count FROM marketplace_items WHERE id = ?`)
    .bind(id)
    .first<{ download_count: number }>()

  return row?.download_count ?? 0
}

function utcDayKey(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, `0`)}-${String(d.getUTCDate()).padStart(2, `0`)}`
}

export function marketplacePublishRetryAfterSec(): number {
  const d = new Date()
  const nextDayUtc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1)
  return Math.max(1, Math.floor((nextDayUtc - d.getTime()) / 1000))
}

export async function consumeMarketplacePublishRateLimit(
  db: D1Database,
  userId: string,
  limit: number,
): Promise<{ allowed: boolean, limit: number, retryAfterSec?: number }> {
  const dayKey = utcDayKey()
  const scopeKey = `publish:${userId}`

  const row = await db
    .prepare(
      `SELECT count FROM marketplace_rate_limits WHERE scope_key = ? AND day_key = ?`,
    )
    .bind(scopeKey, dayKey)
    .first<{ count: number }>()

  const count = row?.count ?? 0
  if (count >= limit) {
    return {
      allowed: false,
      limit,
      retryAfterSec: marketplacePublishRetryAfterSec(),
    }
  }

  await db
    .prepare(
      `INSERT INTO marketplace_rate_limits (scope_key, day_key, count)
       VALUES (?, ?, 1)
       ON CONFLICT(scope_key, day_key) DO UPDATE SET count = count + 1`,
    )
    .bind(scopeKey, dayKey)
    .run()

  return { allowed: true, limit }
}
