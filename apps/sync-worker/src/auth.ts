import type { Context, MiddlewareHandler } from 'hono'
import type { Env, JwtPayload } from './types'
import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import { getUserById, upsertUser } from './db'
import { defaultOrigin, resolveRedirect } from './origin'
import { getEffectivePlan } from './plan'

const STATE_COOKIE = `md_oauth_state`
const REDIRECT_COOKIE = `md_oauth_redirect`
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 天

function callbackUrl(c: Context): string {
  const url = new URL(c.req.url)
  return `${url.origin}/auth/github/callback`
}

export async function issueToken(env: Env, payload: { sub: string, login: string }): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  return sign({ ...payload, exp }, env.JWT_SECRET, `HS256`)
}

/** 鉴权中间件：校验 Bearer JWT，并把用户 id 写入 context */
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

// 第一步：跳转到 GitHub 授权页
authRoutes.get(`/github`, (c) => {
  const state = crypto.randomUUID()
  const isHttps = new URL(c.req.url).protocol === `https:`
  const cookieOpts = {
    httpOnly: true,
    secure: isHttps,
    sameSite: `Lax`,
    path: `/`,
    maxAge: 600,
  } as const

  setCookie(c, STATE_COOKIE, state, cookieOpts)

  // 记录发起登录的前端来源（校验后），授权完成后跳回它
  const redirect = resolveRedirect(c.env, c.req.query(`redirect`))
  setCookie(c, REDIRECT_COOKIE, redirect, cookieOpts)

  const authorize = new URL(`https://github.com/login/oauth/authorize`)
  authorize.searchParams.set(`client_id`, c.env.GITHUB_CLIENT_ID)
  authorize.searchParams.set(`redirect_uri`, callbackUrl(c))
  authorize.searchParams.set(`scope`, `read:user`)
  authorize.searchParams.set(`state`, state)
  return c.redirect(authorize.toString())
})

// 第二步：GitHub 回调，换取 token 并签发自有 JWT，回跳前端
authRoutes.get(`/github/callback`, async (c) => {
  const code = c.req.query(`code`)
  const state = c.req.query(`state`)
  const savedState = getCookie(c, STATE_COOKIE)
  const savedRedirect = getCookie(c, REDIRECT_COOKIE)
  deleteCookie(c, STATE_COOKIE, { path: `/` })
  deleteCookie(c, REDIRECT_COOKIE, { path: `/` })

  if (!code || !state || state !== savedState)
    return c.json({ error: `invalid_oauth_state` }, 400)

  // 用 code 换 access_token
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

  // 拉取用户信息（GitHub 要求 User-Agent）
  const userRes = await fetch(`https://api.github.com/user`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': `md-sync-worker`,
      'Accept': `application/vnd.github+json`,
    },
  })
  if (!userRes.ok)
    return c.json({ error: `github_user_fetch_failed` }, 400)

  const gh = await userRes.json<{ id: number, login: string, name: string | null, avatar_url: string | null }>()

  // upsert 用户
  const existing = await c.env.DB
    .prepare(`SELECT id FROM users WHERE github_id = ?`)
    .bind(gh.id)
    .first<{ id: string }>()
  const userId = existing?.id ?? crypto.randomUUID()

  await upsertUser(c.env.DB, {
    id: userId,
    githubId: gh.id,
    login: gh.login,
    name: gh.name,
    avatar: gh.avatar_url,
  })

  const token = await issueToken(c.env, { sub: userId, login: gh.login })

  // 回跳到发起登录的前端来源（再次校验），token 放在 fragment，避免进入服务端日志
  const target = resolveRedirect(c.env, savedRedirect)
  const redirect = new URL(target || defaultOrigin(c.env))
  redirect.hash = `account_token=${token}`
  return c.redirect(redirect.toString())
})

// 当前用户信息
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
  })
}
