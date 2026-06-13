import type { Env } from './types'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { activateHandler } from './activate'
import { authMiddleware, authRoutes, meHandler } from './auth'
import { isAllowedOrigin } from './origin'
import { createShareHandler, deleteShareHandler, listSharesHandler, unlockShareHandler, viewShareHandler } from './share'
import { SHARE_FAVICON_PATH } from './share-head'
import { pullHandler, pushHandler } from './sync'
import { uploadHandler } from './upload'
import { afdianWebhookHandler } from './webhook'

const app = new Hono<{ Bindings: Env, Variables: { userId: string } }>()

// CORS：允许 APP_URL 中配置的来源（支持通配符，逗号分隔）携带凭据访问
app.use(`*`, async (c, next) => {
  const handler = cors({
    origin: origin => (isAllowedOrigin(c.env, origin) ? origin : null),
    allowMethods: [`GET`, `POST`, `DELETE`, `OPTIONS`],
    allowHeaders: [`Authorization`, `Content-Type`],
    credentials: true,
    maxAge: 86400,
  })
  return handler(c, next)
})

app.get(`/`, c => c.json({ name: `md-api`, ok: true }))

// 默认图床上传（公开，由 UPLOAD_ENABLED 控制）
app.post(`/upload`, uploadHandler)

app.get(SHARE_FAVICON_PATH, c => c.env.ASSETS.fetch(c.req.raw))

app.route(`/auth`, authRoutes)
// 爱发电 Webhook：无密钥与带路径密钥两种形式共用同一处理器。
// 设置 AFDIAN_WEBHOOK_TOKEN 后，仅 `/webhooks/afdian/<token>` 可通过校验。
app.post(`/webhooks/afdian`, afdianWebhookHandler)
app.post(`/webhooks/afdian/:token`, afdianWebhookHandler)

// 公开分享：只读 HTML 预览页 + 密码解锁
app.get(`/s/:shareId`, viewShareHandler)
app.post(`/s/:shareId/unlock`, unlockShareHandler)

const api = new Hono<{ Bindings: Env, Variables: { userId: string } }>()
api.use(`*`, authMiddleware)
api.get(`/me`, meHandler)
api.get(`/sync/pull`, pullHandler)
api.post(`/sync/push`, pushHandler)
api.post(`/sync/activate`, activateHandler)
api.get(`/share`, listSharesHandler)
api.post(`/share`, createShareHandler)
api.delete(`/share/:id`, deleteShareHandler)

app.route(`/`, api)

export default app
