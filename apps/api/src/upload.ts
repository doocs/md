import type { Context } from 'hono'
import type { UserPlan } from './plan'
import type { Env, JwtPayload } from './types'
import { verify } from 'hono/jwt'
import { getUserById } from './db'
import { getEffectivePlan } from './plan'
import {
  getUploadBackend,
  isUploadBackendReady,
  isUploadEnabled,
  parseGithubUploadConfig,
  UPLOAD_MAX_BYTES,
} from './upload-config'
import { uploadToGithub } from './upload-github'
import { uploadToR2 } from './upload-r2'
import {
  getUploadRateLimitCount,
  incrementUploadRateLimit,
  uploadRateLimitForPlan,
  uploadRateLimitRetryAfterSec,
} from './upload-rate'

type UploadContext = Context<{ Bindings: Env }>

function getClientIp(c: UploadContext): string {
  return c.req.header(`CF-Connecting-IP`)
    ?? c.req.header(`X-Forwarded-For`)?.split(`,`)[0]?.trim()
    ?? `unknown`
}

async function resolveUploadScope(c: UploadContext): Promise<{ scopeKey: string, plan: UserPlan | null }> {
  const ip = getClientIp(c)
  const header = c.req.header(`Authorization`) ?? ``
  const token = header.startsWith(`Bearer `) ? header.slice(7) : ``
  if (!token)
    return { scopeKey: `upload:ip:${ip}`, plan: null }

  try {
    const payload = (await verify(token, c.env.JWT_SECRET, `HS256`)) as unknown as JwtPayload
    if (typeof payload?.sub !== `string`)
      return { scopeKey: `upload:ip:${ip}`, plan: null }

    const user = await getUserById(c.env.DB, payload.sub)
    if (!user)
      return { scopeKey: `upload:ip:${ip}`, plan: null }

    const plan = getEffectivePlan(user.plan, user.plan_expires_at)
    return { scopeKey: `upload:user:${payload.sub}`, plan }
  }
  catch {
    return { scopeKey: `upload:ip:${ip}`, plan: null }
  }
}

async function checkUploadRateLimit(
  c: UploadContext,
  scopeKey: string,
  plan: UserPlan | null,
): Promise<Response | null> {
  const limit = uploadRateLimitForPlan(plan)
  const count = await getUploadRateLimitCount(c.env.DB, scopeKey)
  if (count >= limit) {
    return c.json({
      error: `rate_limit_exceeded`,
      limit,
      retryAfterSec: uploadRateLimitRetryAfterSec(),
      upgradeRequired: plan === `free`,
    }, 429)
  }
  return null
}

function isImageFile(file: File): boolean {
  return file.type.startsWith(`image/`)
}

export async function uploadHandler(c: UploadContext) {
  if (!isUploadEnabled(c.env))
    return c.json({ error: `upload_disabled` }, 404)

  if (!isUploadBackendReady(c.env))
    return c.json({ error: `upload_not_configured` }, 503)

  let body: Record<string, string | File>
  try {
    body = await c.req.parseBody()
  }
  catch {
    return c.json({ error: `invalid_form_data` }, 400)
  }

  const file = body.file
  if (!(file instanceof File))
    return c.json({ error: `file_required` }, 400)

  if (!isImageFile(file))
    return c.json({ error: `invalid_file_type` }, 400)

  if (file.size <= 0 || file.size > UPLOAD_MAX_BYTES)
    return c.json({ error: `file_too_large`, maxBytes: UPLOAD_MAX_BYTES }, 400)

  const { scopeKey, plan } = await resolveUploadScope(c)
  const blocked = await checkUploadRateLimit(c, scopeKey, plan)
  if (blocked)
    return blocked

  const referer = c.req.header(`Referer`) ?? c.req.header(`Origin`) ?? `md-api`

  try {
    const backend = getUploadBackend(c.env)
    const url = backend === `r2`
      ? await uploadToR2(c.env, file)
      : await uploadToGithub(parseGithubUploadConfig(c.env)!, file, referer)

    await incrementUploadRateLimit(c.env.DB, scopeKey)
    return c.json({ url })
  }
  catch (err) {
    const message = err instanceof Error ? err.message : `upload_failed`
    return c.json({ error: `upload_failed`, message }, 502)
  }
}
