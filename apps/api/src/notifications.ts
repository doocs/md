import type { Context } from 'hono'
import type { Env } from './types'
import { Hono } from 'hono'
import {
  clearAllNotifications,
  countUnreadNotifications,
  getNotificationById,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  rowToNotification,
} from './notifications-db'

const DEFAULT_PAGE_SIZE = 30
const MAX_PAGE_SIZE = 50

interface AppEnv { Bindings: Env, Variables: { userId: string } }
type AppContext = Context<AppEnv>

function parsePage(value: string | undefined): number {
  const n = Number.parseInt(value ?? `1`, 10)
  if (!Number.isFinite(n) || n < 1)
    return 1
  return n
}

function parsePageSize(value: string | undefined): number {
  const n = Number.parseInt(value ?? String(DEFAULT_PAGE_SIZE), 10)
  if (!Number.isFinite(n) || n < 1)
    return DEFAULT_PAGE_SIZE
  return Math.min(n, MAX_PAGE_SIZE)
}

async function listHandler(c: AppContext) {
  const userId = c.get(`userId`)
  const page = parsePage(c.req.query(`page`))
  const pageSize = parsePageSize(c.req.query(`pageSize`))
  const { rows, total } = await listNotifications(c.env.DB, userId, { page, pageSize })
  return c.json({
    items: rows.map(rowToNotification),
    total,
    page,
    pageSize,
  })
}

async function unreadCountHandler(c: AppContext) {
  const count = await countUnreadNotifications(c.env.DB, c.get(`userId`))
  return c.json({ count })
}

async function markReadHandler(c: AppContext) {
  const id = c.req.param(`id`)
  if (!id)
    return c.json({ error: `not_found` }, 404)

  const existing = await getNotificationById(c.env.DB, c.get(`userId`), id)
  if (!existing)
    return c.json({ error: `not_found` }, 404)

  if (existing.read_at == null)
    await markNotificationRead(c.env.DB, c.get(`userId`), id, Date.now())

  return c.json({ ok: true })
}

async function markAllReadHandler(c: AppContext) {
  await markAllNotificationsRead(c.env.DB, c.get(`userId`), Date.now())
  return c.json({ ok: true })
}

async function clearAllHandler(c: AppContext) {
  await clearAllNotifications(c.env.DB, c.get(`userId`))
  return c.json({ ok: true })
}

export const notificationRoutes = new Hono<AppEnv>()

notificationRoutes.get(`/`, listHandler)
notificationRoutes.get(`/unread-count`, unreadCountHandler)
notificationRoutes.post(`/read-all`, markAllReadHandler)
notificationRoutes.delete(`/`, clearAllHandler)
notificationRoutes.post(`/:id/read`, markReadHandler)
