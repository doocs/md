import type { Env } from './types'
import { getAdminLogins } from './marketplace-admin'
import { getUserByGithubLogin } from './plan'

export type NotificationType
  = `marketplace_pending`
    | `marketplace_approved`
    | `marketplace_rejected`

export interface NotificationPayload {
  itemId: string
  itemType: `theme` | `component`
  name: string
  slug: string
  rejectReason?: string | null
}

export interface NotificationRow {
  id: string
  user_id: string
  type: NotificationType
  payload: string
  read_at: number | null
  created_at: number
}

export interface NotificationDto {
  id: string
  type: NotificationType
  payload: NotificationPayload
  readAt: number | null
  createdAt: number
}

function parsePayload(raw: string): NotificationPayload {
  try {
    const parsed = JSON.parse(raw) as Partial<NotificationPayload>
    return {
      itemId: typeof parsed.itemId === `string` ? parsed.itemId : ``,
      itemType: parsed.itemType === `component` ? `component` : `theme`,
      name: typeof parsed.name === `string` ? parsed.name : ``,
      slug: typeof parsed.slug === `string` ? parsed.slug : ``,
      rejectReason: typeof parsed.rejectReason === `string`
        ? parsed.rejectReason
        : (parsed.rejectReason ?? null),
    }
  }
  catch {
    return { itemId: ``, itemType: `theme`, name: ``, slug: ``, rejectReason: null }
  }
}

export function rowToNotification(row: NotificationRow): NotificationDto {
  return {
    id: row.id,
    type: row.type,
    payload: parsePayload(row.payload),
    readAt: row.read_at,
    createdAt: row.created_at,
  }
}

/** Resolve ADMIN_GITHUB_LOGINS to user ids that already exist in users table. */
export async function resolveAdminUserIds(
  env: Env,
  options?: { excludeUserId?: string },
): Promise<string[]> {
  const logins = [...getAdminLogins(env)]
  if (!logins.length)
    return []

  const ids: string[] = []
  for (const login of logins) {
    const user = await getUserByGithubLogin(env.DB, login)
    if (!user?.id)
      continue
    if (options?.excludeUserId && user.id === options.excludeUserId)
      continue
    ids.push(user.id)
  }
  return ids
}

export async function notifyUsers(
  db: D1Database,
  userIds: string[],
  input: {
    type: NotificationType
    payload: NotificationPayload
    createdAt: number
  },
): Promise<void> {
  const unique = [...new Set(userIds.filter(Boolean))]
  if (!unique.length)
    return

  await db.batch(
    unique.map(userId =>
      db
        .prepare(
          `INSERT INTO notifications (id, user_id, type, payload, read_at, created_at)
           VALUES (?, ?, ?, ?, NULL, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          userId,
          input.type,
          JSON.stringify(input.payload),
          input.createdAt,
        ),
    ),
  )
}

export async function listNotifications(
  db: D1Database,
  userId: string,
  options: { page: number, pageSize: number },
): Promise<{ rows: NotificationRow[], total: number }> {
  const offset = (options.page - 1) * options.pageSize
  const totalRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?`)
    .bind(userId)
    .first<{ total: number }>()

  const { results } = await db
    .prepare(
      `SELECT id, user_id, type, payload, read_at, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(userId, options.pageSize, offset)
    .all<NotificationRow>()

  return {
    rows: results ?? [],
    total: totalRow?.total ?? 0,
  }
}

export async function countUnreadNotifications(
  db: D1Database,
  userId: string,
): Promise<number> {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND read_at IS NULL`,
    )
    .bind(userId)
    .first<{ total: number }>()
  return row?.total ?? 0
}

export async function markNotificationRead(
  db: D1Database,
  userId: string,
  id: string,
  readAt: number,
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE notifications SET read_at = ?
       WHERE id = ? AND user_id = ? AND read_at IS NULL`,
    )
    .bind(readAt, id, userId)
    .run()
  return (result.meta.changes ?? 0) > 0
}

export async function getNotificationById(
  db: D1Database,
  userId: string,
  id: string,
): Promise<NotificationRow | null> {
  return db
    .prepare(
      `SELECT id, user_id, type, payload, read_at, created_at
       FROM notifications WHERE id = ? AND user_id = ?`,
    )
    .bind(id, userId)
    .first<NotificationRow>()
}

export async function markAllNotificationsRead(
  db: D1Database,
  userId: string,
  readAt: number,
): Promise<number> {
  const result = await db
    .prepare(
      `UPDATE notifications SET read_at = ?
       WHERE user_id = ? AND read_at IS NULL`,
    )
    .bind(readAt, userId)
    .run()
  return result.meta.changes ?? 0
}

export async function clearAllNotifications(
  db: D1Database,
  userId: string,
): Promise<number> {
  const result = await db
    .prepare(`DELETE FROM notifications WHERE user_id = ?`)
    .bind(userId)
    .run()
  return result.meta.changes ?? 0
}
