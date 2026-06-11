import type { Context } from 'hono'
import type { Env, PushRequest } from './types'
import { pullChanges, pushChanges } from './db'

type SyncContext = Context<{ Bindings: Env, Variables: { userId: string } }>

export async function pullHandler(c: SyncContext) {
  const userId = c.get(`userId`)
  const sinceRaw = c.req.query(`since`)
  const since = Number.parseInt(sinceRaw ?? `0`, 10)
  const cursor = Number.isFinite(since) && since > 0 ? since : 0

  const { documents, settings, maxCursor } = await pullChanges(c.env, userId, cursor)
  return c.json({ documents, settings, cursor: maxCursor })
}

export async function pushHandler(c: SyncContext) {
  const userId = c.get(`userId`)

  let body: PushRequest
  try {
    body = await c.req.json<PushRequest>()
  }
  catch {
    return c.json({ error: `invalid_body` }, 400)
  }

  const documents = Array.isArray(body.documents) ? body.documents : []
  const settings = Array.isArray(body.settings) ? body.settings : []

  const { documents: mergedDocs, settings: mergedSettings, maxCursor } = await pushChanges(
    c.env,
    userId,
    documents,
    settings,
  )
  return c.json({ documents: mergedDocs, settings: mergedSettings, cursor: maxCursor })
}
