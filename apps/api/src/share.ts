import type { Context } from 'hono'
import type { CreateShareRequest, ShareHtmlSnapshot } from './share-types'
import type { Env } from './types'
import { getCookie, setCookie } from 'hono/cookie'
import { getUserById } from './db'
import {
  consumeShareCreateRateLimit,
  getEffectivePlan,
  peekShareCreateRateLimit,
} from './plan'
import {
  deleteShareByUserAndId,
  getShareById,
  getShareByUserAndPostId,
  getShareRateLimitCount,
  incrementShareRateLimit,
  incrementShareViewCount,
  insertShare,
  listSharesByUserId,
  shareRateLimitRetryAfterSec,
  updateShareContent,
} from './share-db'
import { buildShareGateHtml } from './share-gate-page'
import { buildSharePageHtml, injectShareViewCount } from './share-page'
import {
  generateSharePassword,
  hashSharePassword,
  issueShareAccessToken,
  parseCustomPassword,
  parseSharePasswordMode,
  shareAccessCookieName,
  shareAccessCookiePath,
  verifyShareAccessToken,
  verifySharePassword,
} from './share-password'
import { sanitizeHtmlSnapshot, sanitizeStylesSnapshot, SHARE_PAGE_CSP } from './share-sanitize'

const MAX_SNAPSHOT_BYTES = 2 * 1024 * 1024
const MAX_POST_ID_LENGTH = 64
const SHARE_EXPIRE_MS = 24 * 60 * 60 * 1000
const UNLOCK_ATTEMPT_LIMIT = 20

async function deriveShareId(userId: string, postId: string): Promise<string> {
  const hash = await crypto.subtle.digest(
    `SHA-256`,
    new TextEncoder().encode(`${userId}:${postId}`),
  )
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, `0`))
    .join(``)
    .slice(0, 12)
}

function getClientIp(c: Context<{ Bindings: Env }>): string {
  return c.req.header(`CF-Connecting-IP`)
    ?? c.req.header(`X-Forwarded-For`)?.split(`,`)[0]?.trim()
    ?? `unknown`
}

function parseHtmlSnapshot(input: unknown): ShareHtmlSnapshot | null {
  if (!input || typeof input !== `object`)
    return null

  const raw = input as Record<string, unknown>
  if (typeof raw.bodyHtml !== `string` || typeof raw.stylesHtml !== `string`)
    return null
  if (!raw.bodyHtml.trim())
    return null

  return {
    bodyHtml: sanitizeHtmlSnapshot(raw.bodyHtml),
    stylesHtml: sanitizeStylesSnapshot(raw.stylesHtml),
  }
}

function parsePostId(value: unknown): string | null {
  if (typeof value !== `string`)
    return null
  const postId = value.trim()
  if (!postId || postId.length > MAX_POST_ID_LENGTH)
    return null
  return postId
}

function buildShareUrl(c: Context<{ Bindings: Env, Variables: { userId: string } }>, id: string): string {
  const url = new URL(c.req.url)
  return `${url.origin}/s/${id}`
}

function isHttps(c: Context<{ Bindings: Env }>): boolean {
  return new URL(c.req.url).protocol === `https:`
}

function shareHtml(c: Context<{ Bindings: Env }>, html: string, status: 200 | 404 | 410 = 200) {
  return c.html(html, status, {
    'Content-Security-Policy': SHARE_PAGE_CSP,
  })
}

function wantsJsonResponse(c: Context<{ Bindings: Env }>): boolean {
  return (c.req.header(`accept`) ?? ``).includes(`application/json`)
    || (c.req.header(`content-type`) ?? ``).includes(`application/json`)
}

async function resolveSharePassword(
  body: CreateShareRequest,
): Promise<{ ok: true, passwordHash: string | null, generatedPassword?: string } | { ok: false, error: string }> {
  const mode = parseSharePasswordMode(body.passwordMode) ?? `none`

  if (mode === `none`)
    return { ok: true, passwordHash: null }

  if (mode === `auto`) {
    const generatedPassword = generateSharePassword()
    const passwordHash = await hashSharePassword(generatedPassword)
    return { ok: true, passwordHash, generatedPassword }
  }

  const plainPassword = parseCustomPassword(body.password)
  if (!plainPassword)
    return { ok: false, error: `invalid_password` }

  const passwordHash = await hashSharePassword(plainPassword)
  return { ok: true, passwordHash }
}

async function hasShareAccess(
  c: Context<{ Bindings: Env }>,
  shareId: string,
): Promise<boolean> {
  const token = getCookie(c, shareAccessCookieName(shareId))
  if (!token)
    return false
  return verifyShareAccessToken(c.env, shareId, token)
}

function setShareAccessCookie(
  c: Context<{ Bindings: Env }>,
  shareId: string,
  token: string,
  shareExpiresAt: number | null,
): void {
  const shareExpirySec = shareExpiresAt != null
    ? Math.floor(shareExpiresAt / 1000)
    : Math.floor(Date.now() / 1000) + 60 * 60 * 24
  const maxAge = Math.max(
    60,
    Math.min(60 * 60 * 24, shareExpirySec - Math.floor(Date.now() / 1000)),
  )

  setCookie(c, shareAccessCookieName(shareId), token, {
    httpOnly: true,
    secure: isHttps(c),
    sameSite: `Lax`,
    path: shareAccessCookiePath(shareId),
    maxAge,
  })
}

async function parseUnlockPassword(c: Context<{ Bindings: Env }>): Promise<string> {
  const contentType = c.req.header(`content-type`) ?? ``
  if (contentType.includes(`application/json`)) {
    try {
      const body = await c.req.json<{ password?: unknown }>()
      return typeof body.password === `string` ? body.password : ``
    }
    catch {
      return ``
    }
  }

  try {
    const body = await c.req.parseBody()
    const password = body.password
    return typeof password === `string` ? password : ``
  }
  catch {
    return ``
  }
}

const SHARE_ID_RE = /^[a-f0-9]{12}$/i

type ShareManageAccess = { ok: true } | { ok: false, error: `not_found` | `pro_required` }

async function requireProForShareManage(
  c: Context<{ Bindings: Env, Variables: { userId: string } }>,
): Promise<ShareManageAccess> {
  const user = await getUserById(c.env.DB, c.get(`userId`))
  if (!user)
    return { ok: false, error: `not_found` }

  const plan = getEffectivePlan(user.plan ?? `free`, user.plan_expires_at ?? null)
  if (plan !== `pro`)
    return { ok: false, error: `pro_required` }

  return { ok: true }
}

export async function listSharesHandler(c: Context<{ Bindings: Env, Variables: { userId: string } }>) {
  const access = await requireProForShareManage(c)
  if (!access.ok)
    return c.json({ error: access.error }, access.error === `pro_required` ? 403 : 404)

  const userId = c.get(`userId`)
  const rows = await listSharesByUserId(c.env.DB, userId)
  const now = Date.now()

  return c.json({
    shares: rows.map(row => ({
      id: row.id,
      postId: row.post_id,
      title: row.title,
      url: buildShareUrl(c, row.id),
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      viewCount: row.view_count,
      protected: row.password_hash != null,
      expired: row.expires_at != null && row.expires_at <= now,
    })),
  })
}

export async function deleteShareHandler(c: Context<{ Bindings: Env, Variables: { userId: string } }>) {
  const access = await requireProForShareManage(c)
  if (!access.ok)
    return c.json({ error: access.error }, access.error === `pro_required` ? 403 : 404)

  const id = c.req.param(`id`)
  if (!id || !SHARE_ID_RE.test(id))
    return c.json({ error: `invalid_id` }, 400)

  const userId = c.get(`userId`)
  const deleted = await deleteShareByUserAndId(c.env.DB, userId, id)
  if (!deleted)
    return c.json({ error: `not_found` }, 404)

  return c.json({ ok: true })
}

export async function createShareHandler(c: Context<{ Bindings: Env, Variables: { userId: string } }>) {
  let body: CreateShareRequest
  try {
    body = await c.req.json<CreateShareRequest>()
  }
  catch {
    return c.json({ error: `invalid_json` }, 400)
  }

  const postId = parsePostId(body.postId)
  if (!postId)
    return c.json({ error: `post_id_required` }, 400)

  const htmlSnapshot = parseHtmlSnapshot(body.htmlSnapshot)
  if (!htmlSnapshot)
    return c.json({ error: `html_snapshot_required` }, 400)

  const snapshotBytes = new TextEncoder().encode(htmlSnapshot.bodyHtml + htmlSnapshot.stylesHtml).byteLength
  if (snapshotBytes > MAX_SNAPSHOT_BYTES)
    return c.json({ error: `snapshot_too_large` }, 413)

  const passwordResult = await resolveSharePassword(body)
  if (!passwordResult.ok)
    return c.json({ error: passwordResult.error }, 400)

  const userId = c.get(`userId`)
  const user = await getUserById(c.env.DB, userId)
  if (!user)
    return c.json({ error: `not_found` }, 404)

  const plan = getEffectivePlan(user.plan, user.plan_expires_at)
  const rate = await peekShareCreateRateLimit(c.env.DB, userId, plan)
  if (!rate.allowed) {
    return c.json(
      {
        error: `rate_limited`,
        plan,
        period: rate.period,
        limit: rate.limit,
        retryAfterSec: rate.retryAfterSec,
      },
      429,
    )
  }

  const existing = await getShareByUserAndPostId(c.env.DB, userId, postId)

  const now = Date.now()
  const expiresAt = now + SHARE_EXPIRE_MS
  const title = typeof body.title === `string` ? body.title.trim().slice(0, 200) : ``
  const id = existing?.id ?? await deriveShareId(userId, postId)

  let html: string
  try {
    html = buildSharePageHtml(title, htmlSnapshot.bodyHtml, htmlSnapshot.stylesHtml)
  }
  catch (err) {
    console.error(`[share] build page failed:`, err)
    return c.json({ error: `render_failed` }, 400)
  }

  if (existing) {
    const updated = await updateShareContent(c.env.DB, {
      userId,
      postId,
      title,
      html,
      passwordHash: passwordResult.passwordHash,
      expiresAt,
    })
    if (!updated)
      return c.json({ error: `forbidden` }, 403)
  }
  else {
    await insertShare(c.env.DB, {
      id,
      postId,
      userId,
      title,
      html,
      passwordHash: passwordResult.passwordHash,
      createdAt: now,
      expiresAt,
    })
  }

  await consumeShareCreateRateLimit(c.env.DB, userId, plan)

  return c.json({
    id,
    url: buildShareUrl(c, id),
    expiresAt,
    updated: Boolean(existing),
    protected: passwordResult.passwordHash != null,
    ...(passwordResult.generatedPassword ? { password: passwordResult.generatedPassword } : {}),
  })
}

export async function viewShareHandler(c: Context<{ Bindings: Env }>) {
  const id = c.req.param(`shareId`)
  if (!id || !SHARE_ID_RE.test(id))
    return c.text(`Not Found`, 404)

  const share = await getShareById(c.env.DB, id)
  if (!share)
    return c.text(`Not Found`, 404)

  if (share.expires_at != null && share.expires_at <= Date.now())
    return c.text(`This share link has expired.`, 410)

  if (share.password_hash) {
    const unlocked = await hasShareAccess(c, id)
    if (!unlocked) {
      const error = c.req.query(`error`)
      const gateError = error === `rate_limited` || error === `invalid` ? error : undefined
      return shareHtml(c, buildShareGateHtml(id, share.title, { error: gateError }))
    }
  }

  const viewCount = await incrementShareViewCount(c.env.DB, id)

  return shareHtml(c, injectShareViewCount(share.html, viewCount))
}

export async function unlockShareHandler(c: Context<{ Bindings: Env }>) {
  const id = c.req.param(`shareId`)
  if (!id || !/^[a-f0-9]{12}$/i.test(id))
    return c.text(`Not Found`, 404)

  const share = await getShareById(c.env.DB, id)
  if (!share)
    return c.text(`Not Found`, 404)

  if (share.expires_at != null && share.expires_at <= Date.now())
    return c.text(`This share link has expired.`, 410)

  if (!share.password_hash)
    return c.redirect(`/s/${id}`, 303)

  const scopeKey = `unlock:${id}:${getClientIp(c)}`
  const attemptCount = await getShareRateLimitCount(c.env.DB, scopeKey)
  if (attemptCount >= UNLOCK_ATTEMPT_LIMIT) {
    if (wantsJsonResponse(c))
      return c.json({ error: `rate_limited`, retryAfterSec: shareRateLimitRetryAfterSec() }, 429)
    return c.redirect(`/s/${id}?error=rate_limited`, 303)
  }

  const password = await parseUnlockPassword(c)
  const valid = password ? await verifySharePassword(password, share.password_hash) : false
  if (!valid) {
    await incrementShareRateLimit(c.env.DB, scopeKey)
    if (wantsJsonResponse(c))
      return c.json({ error: `invalid_password` }, 401)
    return c.redirect(`/s/${id}?error=invalid`, 303)
  }

  const token = await issueShareAccessToken(c.env, id, share.expires_at)
  setShareAccessCookie(c, id, token, share.expires_at)

  if (wantsJsonResponse(c))
    return c.json({ ok: true, url: `/s/${id}` })

  return c.redirect(`/s/${id}`, 303)
}
