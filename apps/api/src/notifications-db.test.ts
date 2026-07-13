import type { NotificationRow } from './notifications-db'
import type { Env } from './types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAllNotifications,
  countUnreadNotifications,
  getNotificationById,
  listNotifications,
  markNotificationRead,

  notifyUsers,
  resolveAdminUserIds,
  rowToNotification,
} from './notifications-db'

vi.mock(`./plan`, () => ({
  getUserByGithubLogin: vi.fn(),
}))

vi.mock(`./marketplace-admin`, () => ({
  getAdminLogins: vi.fn(),
}))

const { getUserByGithubLogin } = await import(`./plan`)
const { getAdminLogins } = await import(`./marketplace-admin`)

type Stored = NotificationRow

function createMemoryDb() {
  const rows: Stored[] = []

  const db = {
    _rows: rows,
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async run() {
              if (sql.includes(`INSERT INTO notifications`)) {
                rows.push({
                  id: String(args[0]),
                  user_id: String(args[1]),
                  type: args[2] as Stored[`type`],
                  payload: String(args[3]),
                  read_at: null,
                  created_at: Number(args[4]),
                })
                return { meta: { changes: 1 } }
              }
              if (sql.includes(`UPDATE notifications SET read_at`) && sql.includes(`AND read_at IS NULL`) && sql.includes(`id = ?`)) {
                const readAt = Number(args[0])
                const id = String(args[1])
                const userId = String(args[2])
                const row = rows.find(r => r.id === id && r.user_id === userId && r.read_at == null)
                if (!row)
                  return { meta: { changes: 0 } }
                row.read_at = readAt
                return { meta: { changes: 1 } }
              }
              if (sql.includes(`DELETE FROM notifications WHERE user_id = ?`)) {
                const userId = String(args[0])
                const before = rows.length
                for (let i = rows.length - 1; i >= 0; i--) {
                  if (rows[i].user_id === userId)
                    rows.splice(i, 1)
                }
                return { meta: { changes: before - rows.length } }
              }
              return { meta: { changes: 0 } }
            },
            async first<T>() {
              if (sql.includes(`COUNT(*)`) && sql.includes(`read_at IS NULL`)) {
                const userId = String(args[0])
                const total = rows.filter(r => r.user_id === userId && r.read_at == null).length
                return { total } as T
              }
              if (sql.includes(`COUNT(*)`)) {
                const userId = String(args[0])
                return { total: rows.filter(r => r.user_id === userId).length } as T
              }
              if (sql.includes(`WHERE id = ? AND user_id = ?`)) {
                const id = String(args[0])
                const userId = String(args[1])
                return (rows.find(r => r.id === id && r.user_id === userId) ?? null) as T
              }
              return null as T
            },
            async all<T>() {
              const userId = String(args[0])
              const limit = Number(args[1])
              const offset = Number(args[2])
              const results = rows
                .filter(r => r.user_id === userId)
                .sort((a, b) => b.created_at - a.created_at)
                .slice(offset, offset + limit)
              return { results: results as T[] }
            },
          }
        },
      }
    },
    async batch(statements: Array<{ bind: (...a: unknown[]) => { run: () => Promise<unknown> } }>) {
      // Our prepare().bind() already returns run-capable objects; marketplace passes
      // D1PreparedStatement directly. Mirror by running each statement's internal run
      // if present, else no-op. notifyUsers passes prepare().bind() results into batch.
      for (const stmt of statements as unknown as Array<{ run?: () => Promise<unknown> }>) {
        if (typeof stmt.run === `function`)
          await stmt.run()
      }
    },
  }

  return db as unknown as D1Database & { _rows: Stored[] }
}

describe(`rowToNotification`, () => {
  it(`parses payload and maps snake_case fields`, () => {
    const dto = rowToNotification({
      id: `n1`,
      user_id: `u1`,
      type: `marketplace_pending`,
      payload: JSON.stringify({
        itemId: `i1`,
        itemType: `theme`,
        name: `Nice`,
        slug: `nice`,
      }),
      read_at: null,
      created_at: 100,
    })
    expect(dto).toEqual({
      id: `n1`,
      type: `marketplace_pending`,
      payload: {
        itemId: `i1`,
        itemType: `theme`,
        name: `Nice`,
        slug: `nice`,
        rejectReason: null,
      },
      readAt: null,
      createdAt: 100,
    })
  })

  it(`tolerates malformed payload JSON`, () => {
    const dto = rowToNotification({
      id: `n1`,
      user_id: `u1`,
      type: `marketplace_rejected`,
      payload: `{not-json`,
      read_at: 1,
      created_at: 2,
    })
    expect(dto.payload.itemId).toBe(``)
    expect(dto.readAt).toBe(1)
  })
})

describe(`notifyUsers + isolation`, () => {
  let db: D1Database & { _rows: Stored[] }

  beforeEach(() => {
    db = createMemoryDb()
  })

  it(`inserts one row per recipient and ignores empty list`, async () => {
    await notifyUsers(db, [], {
      type: `marketplace_pending`,
      payload: { itemId: `i`, itemType: `theme`, name: `A`, slug: `a` },
      createdAt: 1,
    })
    expect(db._rows).toHaveLength(0)

    await notifyUsers(db, [`u1`, `u1`, `u2`], {
      type: `marketplace_pending`,
      payload: { itemId: `i`, itemType: `theme`, name: `A`, slug: `a` },
      createdAt: 10,
    })
    expect(db._rows).toHaveLength(2)
    expect(db._rows.map(r => r.user_id).sort()).toEqual([`u1`, `u2`])
  })

  it(`markRead and clearAll are scoped to the owner`, async () => {
    await notifyUsers(db, [`alice`, `bob`], {
      type: `marketplace_approved`,
      payload: { itemId: `i`, itemType: `theme`, name: `A`, slug: `a` },
      createdAt: 1,
    })
    const aliceId = db._rows.find(r => r.user_id === `alice`)!.id
    const bobId = db._rows.find(r => r.user_id === `bob`)!.id

    expect(await markNotificationRead(db, `bob`, aliceId, 99)).toBe(false)
    expect(await getNotificationById(db, `bob`, aliceId)).toBeNull()
    expect(await markNotificationRead(db, `alice`, aliceId, 99)).toBe(true)
    expect((await getNotificationById(db, `alice`, aliceId))?.read_at).toBe(99)

    await clearAllNotifications(db, `alice`)
    expect(await countUnreadNotifications(db, `alice`)).toBe(0)
    expect((await listNotifications(db, `alice`, { page: 1, pageSize: 10 })).total).toBe(0)
    expect((await listNotifications(db, `bob`, { page: 1, pageSize: 10 })).total).toBe(1)
    expect(await getNotificationById(db, `bob`, bobId)).not.toBeNull()
  })
})

describe(`resolveAdminUserIds`, () => {
  beforeEach(() => {
    vi.mocked(getAdminLogins).mockReset()
    vi.mocked(getUserByGithubLogin).mockReset()
  })

  it(`returns only admins that exist in users table`, async () => {
    vi.mocked(getAdminLogins).mockReturnValue(new Set([`yanglbme`, `ghost`]))
    vi.mocked(getUserByGithubLogin).mockImplementation(async (_db, login) => {
      if (login === `yanglbme`)
        return { id: `admin-1`, login: `yanglbme`, plan: `pro`, plan_expires_at: null }
      return null
    })

    const ids = await resolveAdminUserIds({} as Env)
    expect(ids).toEqual([`admin-1`])
    expect(getUserByGithubLogin).toHaveBeenCalledTimes(2)
  })

  it(`can exclude a user id`, async () => {
    vi.mocked(getAdminLogins).mockReturnValue(new Set([`a`, `b`]))
    vi.mocked(getUserByGithubLogin).mockImplementation(async (_db, login) => ({
      id: login === `a` ? `id-a` : `id-b`,
      login,
      plan: `free`,
      plan_expires_at: null,
    }))

    const ids = await resolveAdminUserIds({} as Env, { excludeUserId: `id-a` })
    expect(ids).toEqual([`id-b`])
  })
})
