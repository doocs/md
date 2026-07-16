import type { Context, MiddlewareHandler } from 'hono'
import type { Env, JwtPayload } from './types'
import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import { getUserById, upsertUser } from './db'
import { isAdmin } from './marketplace-admin'
import { defaultOrigin, resolveRedirect } from './origin'
import { getEffectivePlan } from './plan'
import { uuidv4 } from './uuid'

const STATE_COOKIE = `md_oauth_state`
const REDIRECT_COOKIE = `md_oauth_redirect`
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

function callbackUrl(c: Context): string {
  const url = new URL(c.req.url)
  return `${url.origin}/auth/github/callback`
}

export async function issueToken(env: Env, payload: { sub: string, login: string }): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  return sign({ ...payload, exp }, env.JWT_SECRET, `HS256`)
}

/** Auth middleware: validate Bearer JWT and set user id on context. */
export const authMiddleware: MiddlewareHandler<{ Bindings: Env, Variables: { userId: string } }> = async (c, next) => {
  const header = c.req.header(`Authorization`) ?? ``
  const token = header.startsWith(`Bearer `) ? header.slice(7) : ``
  if (!token)
    return c.json({ error: `unauthorized` }, 401)

  try {
    const payload = (await verify(token, c.env.JWT_SECRET, `HS256`)) as unknown as JwtPayload
    if (!payload || typeof payload.sub !== `string` || !payload.sub)
      return c.json({ error: `invalid_token` }, 401)
    c.set(`userId`, payload.sub)
    await next()
  }
  catch {
    return c.json({ error: `invalid_token` }, 401)
  }
}

export const authRoutes = new Hono<{ Bindings: Env }>()

// Step 1: redirect to GitHub authorization
authRoutes.get(`/github`, (c) => {
  const state = uuidv4()
  const isHttps = new URL(c.req.url).protocol === `https:`
  const cookieOpts = {
    httpOnly: true,
    secure: isHttps,
    sameSite: `Lax`,
    path: `/`,
    maxAge: 600,
  } as const

  setCookie(c, STATE_COOKIE, state, cookieOpts)

  // Remember the validated frontend origin; redirect back after authorization
  const redirect = resolveRedirect(c.env, c.req.query(`redirect`))
  setCookie(c, REDIRECT_COOKIE, redirect, cookieOpts)

  const authorize = new URL(`https://github.com/login/oauth/authorize`)
  authorize.searchParams.set(`client_id`, c.env.GITHUB_CLIENT_ID)
  authorize.searchParams.set(`redirect_uri`, callbackUrl(c))
  authorize.searchParams.set(`scope`, `read:user`)
  authorize.searchParams.set(`state`, state)
  return c.redirect(authorize.toString())
})

// Step 2: GitHub callback — exchange code, issue JWT, redirect to frontend
authRoutes.get(`/github/callback`, async (c) => {
  const code = c.req.query(`code`)
  const state = c.req.query(`state`)
  const savedState = getCookie(c, STATE_COOKIE)
  const savedRedirect = getCookie(c, REDIRECT_COOKIE)
  deleteCookie(c, STATE_COOKIE, { path: `/` })
  deleteCookie(c, REDIRECT_COOKIE, { path: `/` })

  if (!code || !state || state !== savedState)
    return c.json({ error: `invalid_oauth_state` }, 400)

  const tokenRes = await fetch(`https://github.com/login/oauth/access_token`, {
    method: `POST`,
    headers: { 'Accept': `application/json`, 'Content-Type': `application/json` },
    body: JSON.stringify({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: callbackUrl(c),
    }),
  })
  const tokenJson = await tokenRes.json<{ access_token?: string }>()
  const accessToken = tokenJson.access_token
  if (!accessToken)
    return c.json({ error: `oauth_exchange_failed` }, 400)

  // GitHub API requires a User-Agent header
  const userRes = await fetch(`https://api.github.com/user`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': `md-api`,
      'Accept': `application/vnd.github+json`,
    },
  })
  if (!userRes.ok)
    return c.json({ error: `github_user_fetch_failed` }, 400)

  const gh = await userRes.json<{ id: number, login: string, name: string | null, avatar_url: string | null }>()

  const existing = await c.env.DB
    .prepare(`SELECT id FROM users WHERE github_id = ?`)
    .bind(gh.id)
    .first<{ id: string }>()
  const userId = existing?.id ?? uuidv4()

  await upsertUser(c.env.DB, {
    id: userId,
    githubId: gh.id,
    login: gh.login,
    name: gh.name,
    avatar: gh.avatar_url,
  })

  const token = await issueToken(c.env, { sub: userId, login: gh.login })

  // Redirect to the validated frontend origin; token in URL fragment avoids server logs
  const target = resolveRedirect(c.env, savedRedirect)
  const redirect = new URL(target || defaultOrigin(c.env))
  redirect.hash = `account_token=${token}`
  return c.redirect(redirect.toString())
})

export async function meHandler(c: Context<{ Bindings: Env, Variables: { userId: string } }>) {
  const user = await getUserById(c.env.DB, c.get(`userId`))
  if (!user)
    return c.json({ error: `not_found` }, 404)
  const plan = getEffectivePlan(user.plan ?? `free`, user.plan_expires_at ?? null)
  return c.json({
    id: user.id,
    login: user.login,
    name: user.name,
    avatar: user.avatar,
    plan,
    planExpiresAt: user.plan_expires_at ?? null,
    isAdmin: isAdmin(c.env, user.login),
  })
}
