import type { Env } from './types'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { activateHandler } from './activate'
import { authMiddleware, authRoutes, meHandler } from './auth'
import { isAllowedOrigin } from './origin'
import { pullHandler, pushHandler } from './sync'
import { afdianWebhookHandler } from './webhook'

const app = new Hono<{ Bindings: Env, Variables: { userId: string } }>()

// CORS：允许 APP_URL 中配置的来源（支持通配符，逗号分隔）携带凭据访问
app.use(`*`, async (c, next) => {
  const handler = cors({
    origin: origin => (isAllowedOrigin(c.env, origin) ? origin : null),
    allowMethods: [`GET`, `POST`, `OPTIONS`],
    allowHeaders: [`Authorization`, `Content-Type`],
    credentials: true,
    maxAge: 86400,
  })
  return handler(c, next)
})

app.get(`/`, c => c.json({ name: `md-sync`, ok: true }))

app.route(`/auth`, authRoutes)
app.post(`/webhooks/afdian`, afdianWebhookHandler)

const api = new Hono<{ Bindings: Env, Variables: { userId: string } }>()
api.use(`*`, authMiddleware)
api.get(`/me`, meHandler)
api.get(`/sync/pull`, pullHandler)
api.post(`/sync/push`, pushHandler)
api.post(`/sync/activate`, activateHandler)

app.route(`/`, api)

export default app
