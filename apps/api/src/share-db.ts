import type { ShareRow } from './share-types'

export async function getShareByUserAndPostId(
  db: D1Database,
  userId: string,
  postId: string,
): Promise<ShareRow | null> {
  return db
    .prepare(`SELECT * FROM shares WHERE user_id = ? AND post_id = ?`)
    .bind(userId, postId)
    .first<ShareRow>()
}

export async function getShareById(db: D1Database, id: string): Promise<ShareRow | null> {
  return db.prepare(`SELECT * FROM shares WHERE id = ?`).bind(id).first<ShareRow>()
}

export async function insertShare(
  db: D1Database,
  row: {
    id: string
    postId: string
    userId: string
    title: string
    html: string
    passwordHash: string | null
    createdAt: number
    expiresAt: number | null
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO shares (id, post_id, user_id, title, html, password_hash, created_at, expires_at, view_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    )
    .bind(row.id, row.postId, row.userId, row.title, row.html, row.passwordHash, row.createdAt, row.expiresAt)
    .run()
}

export async function updateShareContent(
  db: D1Database,
  row: {
    userId: string
    postId: string
    title: string
    html: string
    passwordHash: string | null
    expiresAt: number | null
  },
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE shares
       SET title = ?, html = ?, password_hash = ?, expires_at = ?
       WHERE user_id = ? AND post_id = ?`,
    )
    .bind(row.title, row.html, row.passwordHash, row.expiresAt, row.userId, row.postId)
    .run()

  return (result.meta.changes ?? 0) > 0
}

export async function incrementShareViewCount(db: D1Database, id: string): Promise<number> {
  const row = await db
    .prepare(`UPDATE shares SET view_count = view_count + 1 WHERE id = ? RETURNING view_count`)
    .bind(id)
    .first<{ view_count: number }>()

  return row?.view_count ?? 1
}

export async function getShareRateLimitCount(
  db: D1Database,
  scopeKey: string,
): Promise<number> {
  const hourKey = utcHourKey()
  const row = await db
    .prepare(`SELECT count FROM share_rate_limits WHERE scope_key = ? AND hour_key = ?`)
    .bind(scopeKey, hourKey)
    .first<{ count: number }>()

  return row?.count ?? 0
}

export async function incrementShareRateLimit(
  db: D1Database,
  scopeKey: string,
): Promise<void> {
  const hourKey = utcHourKey()
  await db
    .prepare(
      `INSERT INTO share_rate_limits (scope_key, hour_key, count) VALUES (?, ?, 1)
       ON CONFLICT(scope_key, hour_key) DO UPDATE SET count = count + 1`,
    )
    .bind(scopeKey, hourKey)
    .run()
}

export function shareRateLimitRetryAfterSec(): number {
  const d = new Date()
  return Math.max(1, (60 - d.getUTCMinutes()) * 60 - d.getUTCSeconds())
}

function utcHourKey(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, `0`)}-${String(d.getUTCDate()).padStart(2, `0`)}T${String(d.getUTCHours()).padStart(2, `0`)}`
}
