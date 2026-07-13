import type { Env } from './types'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { activateHandler } from './activate'
import { authMiddleware, authRoutes, meHandler } from './auth'
import { marketplaceRoutes } from './marketplace'
import { notificationRoutes } from './notifications'
import { isAllowedOrigin, isBrowserExtensionOrigin } from './origin'
import { createShareHandler, deleteShareHandler, listSharesHandler, unlockShareHandler, viewShareHandler } from './share'
import { SHARE_FAVICON_PATH } from './share-head'
import { pullHandler, pushHandler } from './sync'
import { uploadHandler } from './upload'
import { afdianWebhookHandler } from './webhook'

const app = new Hono<{ Bindings: Env, Variables: { userId: string } }>()

// CORS: allow credentialed requests from origins listed in APP_URL (comma-separated, wildcards supported)
app.use(`*`, async (c, next) => {
  const handler = cors({
    origin: origin => (isAllowedOrigin(c.env, origin) || isBrowserExtensionOrigin(origin) ? origin : null),
    allowMethods: [`GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`],
    allowHeaders: [`Authorization`, `Content-Type`],
    credentials: true,
    maxAge: 86400,
  })
  return handler(c, next)
})

app.get(`/`, c => c.json({ name: `md-api`, ok: true }))

// Default image upload (public; gated by UPLOAD_ENABLED)
app.post(`/upload`, uploadHandler)

app.get(SHARE_FAVICON_PATH, c => c.env.ASSETS.fetch(c.req.raw))

app.route(`/auth`, authRoutes)
// Afdian webhook: unauthenticated and path-token routes share one handler.
// When AFDIAN_WEBHOOK_TOKEN is set, only /webhooks/afdian/<token> passes validation.
app.post(`/webhooks/afdian`, afdianWebhookHandler)
app.post(`/webhooks/afdian/:token`, afdianWebhookHandler)

// Public shares: read-only HTML preview + password unlock
app.get(`/s/:shareId`, viewShareHandler)
app.post(`/s/:shareId/unlock`, unlockShareHandler)

// Theme / component marketplace (public browse + auth publish/admin)
app.route(`/marketplace`, marketplaceRoutes)

const api = new Hono<{ Bindings: Env, Variables: { userId: string } }>()
api.use(`*`, authMiddleware)
api.get(`/me`, meHandler)
api.get(`/sync/pull`, pullHandler)
api.post(`/sync/push`, pushHandler)
api.post(`/sync/activate`, activateHandler)
api.get(`/share`, listSharesHandler)
api.post(`/share`, createShareHandler)
api.delete(`/share/:id`, deleteShareHandler)
api.route(`/notifications`, notificationRoutes)

app.route(`/`, api)

export default app
