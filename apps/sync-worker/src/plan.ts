import type { AfdianOrder } from './afdian'
import type { Env } from './types'
import { isProEligibleOrder } from './afdian'

export type UserPlan = `free` | `pro`

export const MS_PER_SPONSOR_MONTH = 31 * 24 * 60 * 60 * 1000

export const SYNC_RATE_LIMIT = {
  free: 30,
  pro: 300,
} as const

export function normalizeGithubLogin(value: string): string {
  return value.trim().toLowerCase()
}

export function parseGithubLoginFromRemark(remark: string): string | null {
  const trimmed = remark.trim()
  if (!trimmed)
    return null

  // 支持纯用户名，或「github:用户名」形式
  const match = trimmed.match(/^(?:github\s*[:：]\s*)?([a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?)$/i)
  if (match)
    return normalizeGithubLogin(match[1])

  // 备注中第一个像 GitHub 用户名的 token
  const token = trimmed.split(/[\s,，;；]+/).find(part => /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i.test(part))
  return token ? normalizeGithubLogin(token) : null
}

export function getEffectivePlan(plan: string, planExpiresAt: number | null): UserPlan {
  if (plan === `pro` && planExpiresAt != null && planExpiresAt > Date.now())
    return `pro`
  return `free`
}

export function extendPlanExpires(currentExpiresAt: number | null, months: number): number {
  const now = Date.now()
  const base = currentExpiresAt != null && currentExpiresAt > now ? currentExpiresAt : now
  const monthCount = Math.max(1, Math.floor(months) || 1)
  return base + monthCount * MS_PER_SPONSOR_MONTH
}

function utcHourKey(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, `0`)}-${String(d.getUTCDate()).padStart(2, `0`)}T${String(d.getUTCHours()).padStart(2, `0`)}`
}

export async function checkSyncRateLimit(
  db: D1Database,
  userId: string,
  plan: UserPlan,
): Promise<{ allowed: boolean, limit: number, retryAfterSec?: number }> {
  const limit = SYNC_RATE_LIMIT[plan]
  const hourKey = utcHourKey()

  const row = await db
    .prepare(`SELECT count FROM sync_rate_limits WHERE user_id = ? AND hour_key = ?`)
    .bind(userId, hourKey)
    .first<{ count: number }>()

  const count = row?.count ?? 0
  if (count >= limit) {
    const d = new Date()
    const retryAfterSec = (60 - d.getUTCMinutes()) * 60 - d.getUTCSeconds()
    return { allowed: false, limit, retryAfterSec: Math.max(1, retryAfterSec) }
  }

  await db
    .prepare(
      `INSERT INTO sync_rate_limits (user_id, hour_key, count) VALUES (?, ?, 1)
       ON CONFLICT(user_id, hour_key) DO UPDATE SET count = count + 1`,
    )
    .bind(userId, hourKey)
    .run()

  return { allowed: true, limit }
}

export async function getUserByGithubLogin(db: D1Database, login: string) {
  return db
    .prepare(`SELECT * FROM users WHERE lower(login) = ?`)
    .bind(normalizeGithubLogin(login))
    .first<{
    id: string
    login: string
    plan: string
    plan_expires_at: number | null
  }>()
}

export async function isOrderProcessed(db: D1Database, outTradeNo: string): Promise<boolean> {
  const row = await db
    .prepare(`SELECT out_trade_no FROM afdian_orders WHERE out_trade_no = ?`)
    .bind(outTradeNo)
    .first()
  return Boolean(row)
}

export async function activateProFromOrder(
  env: Env,
  order: AfdianOrder,
  targetGithubLogin: string,
): Promise<{ ok: true, expiresAt: number } | { ok: false, reason: string }> {
  if (!isProEligibleOrder(env, order))
    return { ok: false, reason: `ineligible_plan` }

  const user = await getUserByGithubLogin(env.DB, targetGithubLogin)
  if (!user)
    return { ok: false, reason: `user_not_found` }

  const already = await isOrderProcessed(env.DB, order.out_trade_no)
  if (already) {
    const expiresAt = user.plan_expires_at ?? Date.now()
    return { ok: true, expiresAt }
  }

  const expiresAt = extendPlanExpires(user.plan_expires_at, order.month)

  await env.DB.batch([
    env.DB.prepare(`UPDATE users SET plan = 'pro', plan_expires_at = ? WHERE id = ?`).bind(expiresAt, user.id),
    env.DB.prepare(
      `INSERT INTO afdian_orders (out_trade_no, user_id, github_login, months, processed_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(order.out_trade_no, user.id, user.login, order.month, Date.now()),
  ])

  return { ok: true, expiresAt }
}
