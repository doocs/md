import { EMOJI_MAX_ITEMS } from './emoji-validate'
import { uuidv4 } from './uuid'

export interface EmojiPackRow {
  id: string
  owner_user_id: string | null
  kind: `system` | `user`
  slug: string
  name: string
  source_url: string | null
  source_commit: string | null
  license_spdx: string | null
  license_url: string | null
  attribution: string | null
  description: string | null
  created_at: number
  updated_at: number
}

export interface EmojiItemRow {
  id: string
  pack_id: string
  object_key: string
  name: string
  mime: string
  size: number
  width: number | null
  height: number | null
  sort_order: number
  created_at: number
  updated_at: number
}

export interface EmojiAssetRow extends EmojiItemRow {
  kind: `system` | `user`
}

export async function getPackBySlug(db: D1Database, slug: string): Promise<EmojiPackRow | null> {
  return db
    .prepare(`SELECT * FROM emoji_packs WHERE slug = ?`)
    .bind(slug)
    .first<EmojiPackRow>()
}

export async function getSystemPack(db: D1Database): Promise<EmojiPackRow | null> {
  return db
    .prepare(`SELECT * FROM emoji_packs WHERE kind = 'system' ORDER BY created_at ASC LIMIT 1`)
    .first<EmojiPackRow>()
}

export async function getOrCreateUserPack(
  db: D1Database,
  userId: string,
  now: number,
): Promise<EmojiPackRow> {
  await db
    .prepare(
      `INSERT INTO emoji_packs (
         id, owner_user_id, kind, slug, name, created_at, updated_at
       ) VALUES (?, ?, 'user', ?, 'My Emojis', ?, ?)
       ON CONFLICT(owner_user_id) DO NOTHING`,
    )
    .bind(uuidv4(), userId, `user-${userId}`, now, now)
    .run()

  const pack = await db
    .prepare(`SELECT * FROM emoji_packs WHERE owner_user_id = ?`)
    .bind(userId)
    .first<EmojiPackRow>()
  if (!pack)
    throw new Error(`emoji_pack_create_failed`)
  return pack
}

export async function listPackItems(db: D1Database, packId: string): Promise<EmojiItemRow[]> {
  const result = await db
    .prepare(
      `SELECT * FROM emoji_items
       WHERE pack_id = ?
       ORDER BY sort_order ASC, id ASC`,
    )
    .bind(packId)
    .all<EmojiItemRow>()
  return result.results ?? []
}

export async function updateUserPackName(
  db: D1Database,
  userId: string,
  name: string,
  updatedAt: number,
): Promise<void> {
  await db
    .prepare(`UPDATE emoji_packs SET name = ?, updated_at = ? WHERE owner_user_id = ?`)
    .bind(name, updatedAt, userId)
    .run()
}

export async function insertUserEmojiItemConditional(
  db: D1Database,
  input: {
    id: string
    userId: string
    objectKey: string
    name: string
    mime: string
    size: number
    createdAt: number
  },
): Promise<boolean> {
  // A single conditional INSERT is serialized by D1, so concurrent requests cannot both cross the cap.
  const result = await db
    .prepare(
      `INSERT INTO emoji_items (
         id, pack_id, object_key, name, mime, size, width, height,
         sort_order, created_at, updated_at
       )
       SELECT ?, p.id, ?, ?, ?, ?, NULL, NULL,
              COALESCE(MAX(i.sort_order), -1) + 1, ?, ?
       FROM emoji_packs p
       LEFT JOIN emoji_items i ON i.pack_id = p.id
       WHERE p.owner_user_id = ?
       GROUP BY p.id
       HAVING COUNT(i.id) < ?`,
    )
    .bind(
      input.id,
      input.objectKey,
      input.name,
      input.mime,
      input.size,
      input.createdAt,
      input.createdAt,
      input.userId,
      EMOJI_MAX_ITEMS,
    )
    .run()
  return (result.meta.changes ?? 0) === 1
}

export async function getEmojiAsset(db: D1Database, id: string): Promise<EmojiAssetRow | null> {
  return db
    .prepare(
      `SELECT i.*, p.kind
       FROM emoji_items i
       JOIN emoji_packs p ON p.id = i.pack_id
       WHERE i.id = ?`,
    )
    .bind(id)
    .first<EmojiAssetRow>()
}

export async function getOwnedEmojiItem(
  db: D1Database,
  userId: string,
  id: string,
): Promise<EmojiItemRow | null> {
  return db
    .prepare(
      `SELECT i.*
       FROM emoji_items i
       JOIN emoji_packs p ON p.id = i.pack_id
       WHERE i.id = ? AND p.owner_user_id = ?`,
    )
    .bind(id, userId)
    .first<EmojiItemRow>()
}

export async function deleteOwnedEmojiItem(
  db: D1Database,
  userId: string,
  id: string,
): Promise<boolean> {
  const result = await db
    .prepare(
      `DELETE FROM emoji_items
       WHERE id = ? AND pack_id = (
         SELECT id FROM emoji_packs WHERE owner_user_id = ?
       )`,
    )
    .bind(id, userId)
    .run()
  return (result.meta.changes ?? 0) === 1
}

export async function deleteUserPack(db: D1Database, userId: string): Promise<void> {
  const pack = await db
    .prepare(`SELECT id FROM emoji_packs WHERE owner_user_id = ?`)
    .bind(userId)
    .first<{ id: string }>()
  if (!pack)
    return

  await db.batch([
    db.prepare(`DELETE FROM emoji_items WHERE pack_id = ?`).bind(pack.id),
    db.prepare(`DELETE FROM emoji_packs WHERE id = ? AND owner_user_id = ?`).bind(pack.id, userId),
  ])
}
