import type { UserPlan } from './plan'
import { UPLOAD_RATE_LIMIT } from './upload-config'

function utcHourKey(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, `0`)}-${String(d.getUTCDate()).padStart(2, `0`)}T${String(d.getUTCHours()).padStart(2, `0`)}`
}

export function uploadRateLimitRetryAfterSec(): number {
  const d = new Date()
  return Math.max(1, (60 - d.getUTCMinutes()) * 60 - d.getUTCSeconds())
}

export async function getUploadRateLimitCount(
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

export async function incrementUploadRateLimit(
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

export function uploadRateLimitForPlan(plan: UserPlan | null): number {
  if (plan === `pro`)
    return UPLOAD_RATE_LIMIT.pro
  if (plan === `free`)
    return UPLOAD_RATE_LIMIT.free
  return UPLOAD_RATE_LIMIT.anonymous
}
