import type { Env, SyncDocument, SyncSetting, UserRow } from './types'

interface DocumentRow {
  id: string
  title: string
  content: string
  parent_id: string | null
  history: string
  create_datetime: number
  update_datetime: number
  deleted: number
  server_updated_at: number
}

interface SettingRow {
  key: string
  value: string
  updated_at: number
  server_updated_at: number
}

function rowToDocument(row: DocumentRow): SyncDocument {
  let history: SyncDocument['history'] = []
  try {
    history = JSON.parse(row.history)
  }
  catch {
    history = []
  }
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    parentId: row.parent_id,
    history,
    createDatetime: row.create_datetime,
    updateDatetime: row.update_datetime,
    deleted: row.deleted === 1,
  }
}

function rowToSetting(row: SettingRow): SyncSetting {
  let value: unknown = null
  try {
    value = JSON.parse(row.value)
  }
  catch {
    value = null
  }
  return { key: row.key, value, updatedAt: row.updated_at }
}

export async function upsertUser(
  db: D1Database,
  user: { id: string, githubId: number, login: string, name: string | null, avatar: string | null },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (id, github_id, login, name, avatar, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(github_id) DO UPDATE SET
         login = excluded.login,
         name = excluded.name,
         avatar = excluded.avatar`,
    )
    .bind(user.id, user.githubId, user.login, user.name, user.avatar, Date.now())
    .run()
}

export async function getUserById(db: D1Database, id: string): Promise<UserRow | null> {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).bind(id).first<UserRow>()
}

/** 拉取 cursor 之后变更的文档与设置 */
export async function pullChanges(
  env: Env,
  userId: string,
  cursor: number,
): Promise<{ documents: SyncDocument[], settings: SyncSetting[], maxCursor: number }> {
  const docsResult = await env.DB
    .prepare(
      `SELECT id, title, content, parent_id, history, create_datetime, update_datetime, deleted, server_updated_at
       FROM documents WHERE user_id = ? AND server_updated_at > ?
       ORDER BY server_updated_at ASC`,
    )
    .bind(userId, cursor)
    .all<DocumentRow>()

  const settingsResult = await env.DB
    .prepare(
      `SELECT key, value, updated_at, server_updated_at
       FROM settings WHERE user_id = ? AND server_updated_at > ?
       ORDER BY server_updated_at ASC`,
    )
    .bind(userId, cursor)
    .all<SettingRow>()

  const docRows = docsResult.results ?? []
  const settingRows = settingsResult.results ?? []

  let maxCursor = cursor
  for (const r of docRows) maxCursor = Math.max(maxCursor, r.server_updated_at)
  for (const r of settingRows) maxCursor = Math.max(maxCursor, r.server_updated_at)

  return {
    documents: docRows.map(rowToDocument),
    settings: settingRows.map(rowToSetting),
    maxCursor,
  }
}

/**
 * 推入客户端变更，按 update_datetime 做 last-write-wins。
 * 返回服务端最终更新过（即客户端较新）的记录，以及新游标。
 */
export async function pushChanges(
  env: Env,
  userId: string,
  documents: SyncDocument[],
  settings: SyncSetting[],
): Promise<{ documents: SyncDocument[], settings: SyncSetting[], maxCursor: number }> {
  const now = Date.now()

  for (const doc of documents) {
    const existing = await env.DB
      .prepare(`SELECT update_datetime FROM documents WHERE user_id = ? AND id = ?`)
      .bind(userId, doc.id)
      .first<{ update_datetime: number }>()

    // LWW：仅当客户端版本更新（或不存在）时写入
    if (existing && existing.update_datetime >= doc.updateDatetime)
      continue

    await env.DB
      .prepare(
        `INSERT INTO documents
           (user_id, id, title, content, parent_id, history, create_datetime, update_datetime, deleted, server_updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, id) DO UPDATE SET
           title = excluded.title,
           content = excluded.content,
           parent_id = excluded.parent_id,
           history = excluded.history,
           update_datetime = excluded.update_datetime,
           deleted = excluded.deleted,
           server_updated_at = excluded.server_updated_at`,
      )
      .bind(
        userId,
        doc.id,
        doc.title,
        doc.content,
        doc.parentId,
        JSON.stringify(doc.history ?? []),
        doc.createDatetime,
        doc.updateDatetime,
        doc.deleted ? 1 : 0,
        now,
      )
      .run()
  }

  for (const setting of settings) {
    const existing = await env.DB
      .prepare(`SELECT updated_at FROM settings WHERE user_id = ? AND key = ?`)
      .bind(userId, setting.key)
      .first<{ updated_at: number }>()

    if (existing && existing.updated_at >= setting.updatedAt)
      continue

    await env.DB
      .prepare(
        `INSERT INTO settings (user_id, key, value, updated_at, server_updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id, key) DO UPDATE SET
           value = excluded.value,
           updated_at = excluded.updated_at,
           server_updated_at = excluded.server_updated_at`,
      )
      .bind(userId, setting.key, JSON.stringify(setting.value ?? null), setting.updatedAt, now)
      .run()
  }

  // 返回本次写入（被接受）的记录，并以服务端时钟作为新游标。
  // 客户端约定先 pull 再 push，因此服务端较新的记录已在 pull 阶段下发。
  const accepted = await pullChanges(env, userId, now - 1)
  return { documents: accepted.documents, settings: accepted.settings, maxCursor: now }
}
