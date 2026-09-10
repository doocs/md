import type { Context } from 'hono'
import type { EmojiItemRow, EmojiPackRow } from './emoji-db'
import type { Env } from './types'
import { Hono } from 'hono'
import { authMiddleware } from './auth'
import {
  deleteOwnedEmojiItem,
  deleteUserPack,
  getEmojiAsset,
  getOrCreateUserPack,
  getOwnedEmojiItem,
  getSystemPack,
  insertUserEmojiItemConditional,
  listPackItems,
  updateUserPackName,
} from './emoji-db'
import {
  EMOJI_MAX_ITEMS,
  sanitizeEmojiName,
  sanitizePackName,
  validateEmojiFile,
} from './emoji-validate'
import { UPLOAD_MAX_BYTES } from './upload-config'
import { uuidv4 } from './uuid'

interface AppEnv { Bindings: Env, Variables: { userId: string } }
type AppContext = Context<AppEnv>

function itemJson(item: EmojiItemRow, origin: string) {
  return {
    id: item.id,
    name: item.name,
    mime: item.mime,
    size: item.size,
    width: item.width,
    height: item.height,
    sortOrder: item.sort_order,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    url: `${origin}/emojis/assets/${encodeURIComponent(item.id)}`,
  }
}

export function manifestJson(pack: EmojiPackRow, items: EmojiItemRow[], origin: string) {
  return {
    id: pack.id,
    kind: pack.kind,
    slug: pack.slug,
    name: pack.name,
    metadata: {
      sourceUrl: pack.source_url,
      sourceCommit: pack.source_commit,
      license: pack.license_spdx,
      licenseUrl: pack.license_url,
      attribution: pack.attribution,
      description: pack.description,
    },
    createdAt: pack.created_at,
    updatedAt: pack.updated_at,
    items: items.map(item => itemJson(item, origin)),
  }
}

async function packManifest(c: AppContext, pack: EmojiPackRow) {
  const items = await listPackItems(c.env.DB, pack.id)
  return manifestJson(pack, items, new URL(c.req.url).origin)
}

async function defaultManifestHandler(c: AppContext) {
  const pack = await getSystemPack(c.env.DB)
  if (!pack)
    return c.json({ error: `not_found` }, 404)
  return c.json(await packManifest(c, pack))
}

async function assetHandler(c: AppContext) {
  const id = c.req.param(`id`)
  if (!id)
    return c.json({ error: `not_found` }, 404)
  const item = await getEmojiAsset(c.env.DB, id)
  if (!item)
    return c.json({ error: `not_found` }, 404)

  const object = await c.env.EMOJI_ASSETS.get(item.object_key)
  if (!object)
    return c.json({ error: `not_found` }, 404)

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set(`Content-Type`, item.mime)
  headers.set(`Content-Length`, String(item.size))
  headers.set(`ETag`, object.httpEtag)
  headers.set(`X-Content-Type-Options`, `nosniff`)
  headers.set(
    `Cache-Control`,
    item.kind === `system`
      ? `public, max-age=31536000, immutable`
      : `public, max-age=300`,
  )
  return new Response(object.body, { headers })
}

async function getMyManifestHandler(c: AppContext) {
  const pack = await getOrCreateUserPack(c.env.DB, c.get(`userId`), Date.now())
  return c.json(await packManifest(c, pack))
}

async function updateMyPackHandler(c: AppContext) {
  const body = await c.req.json().catch(() => null)
  const name = sanitizePackName((body as { name?: unknown } | null)?.name)
  if (!name)
    return c.json({ error: `invalid_name` }, 400)

  const userId = c.get(`userId`)
  await getOrCreateUserPack(c.env.DB, userId, Date.now())
  await updateUserPackName(c.env.DB, userId, name, Date.now())
  const pack = await getOrCreateUserPack(c.env.DB, userId, Date.now())
  return c.json(await packManifest(c, pack))
}

async function uploadMyItemHandler(c: AppContext) {
  let body: Record<string, string | File>
  try {
    body = await c.req.parseBody()
  }
  catch {
    return c.json({ error: `invalid_form_data` }, 400)
  }

  const file = body.file
  if (!(file instanceof File))
    return c.json({ error: `file_required` }, 400)

  if (file.size <= 0)
    return c.json({ error: `empty_file` }, 400)
  if (file.size > UPLOAD_MAX_BYTES)
    return c.json({ error: `file_too_large`, maxBytes: UPLOAD_MAX_BYTES }, 400)

  const bytes = new Uint8Array(await file.arrayBuffer())
  const validation = validateEmojiFile(file.type, file.size, bytes)
  if (!validation.ok) {
    return c.json({
      error: validation.error,
      ...(validation.error === `file_too_large` ? { maxBytes: UPLOAD_MAX_BYTES } : {}),
    }, 400)
  }

  const userId = c.get(`userId`)
  await getOrCreateUserPack(c.env.DB, userId, Date.now())

  const id = uuidv4()
  const objectKey = `user/${userId}/${id}.${validation.extension}`
  const requestedName = typeof body.name === `string` ? body.name : file.name
  const name = sanitizeEmojiName(requestedName)
  const createdAt = Date.now()

  try {
    await c.env.EMOJI_ASSETS.put(objectKey, bytes, {
      httpMetadata: { contentType: validation.mime },
    })
  }
  catch {
    return c.json({ error: `asset_upload_failed` }, 502)
  }

  let inserted = false
  try {
    inserted = await insertUserEmojiItemConditional(c.env.DB, {
      id,
      userId,
      objectKey,
      name,
      mime: validation.mime,
      size: file.size,
      createdAt,
    })
  }
  catch {
    await c.env.EMOJI_ASSETS.delete(objectKey)
    return c.json({ error: `database_write_failed` }, 500)
  }

  if (!inserted) {
    await c.env.EMOJI_ASSETS.delete(objectKey)
    return c.json({ error: `item_limit_reached`, limit: EMOJI_MAX_ITEMS }, 409)
  }

  const pack = await getOrCreateUserPack(c.env.DB, userId, Date.now())
  return c.json(await packManifest(c, pack), 201)
}

async function deleteMyItemHandler(c: AppContext) {
  const userId = c.get(`userId`)
  const id = c.req.param(`id`)
  if (!id)
    return c.json({ error: `not_found` }, 404)
  const item = await getOwnedEmojiItem(c.env.DB, userId, id)
  if (!item)
    return c.json({ error: `not_found` }, 404)

  try {
    await c.env.EMOJI_ASSETS.delete(item.object_key)
  }
  catch {
    return c.json({ error: `asset_delete_failed` }, 502)
  }

  const deleted = await deleteOwnedEmojiItem(c.env.DB, userId, id)
  if (!deleted)
    return c.json({ error: `not_found` }, 404)

  const pack = await getOrCreateUserPack(c.env.DB, userId, Date.now())
  return c.json(await packManifest(c, pack))
}

async function deleteMyPackHandler(c: AppContext) {
  const userId = c.get(`userId`)
  const pack = await getOrCreateUserPack(c.env.DB, userId, Date.now())
  const items = await listPackItems(c.env.DB, pack.id)

  try {
    if (items.length)
      await c.env.EMOJI_ASSETS.delete(items.map(item => item.object_key))
  }
  catch {
    return c.json({ error: `asset_delete_failed` }, 502)
  }

  await deleteUserPack(c.env.DB, userId)
  return c.json({ ok: true })
}

export const emojiRoutes = new Hono<AppEnv>()

emojiRoutes.get(`/default`, defaultManifestHandler)
emojiRoutes.get(`/assets/:id`, assetHandler)
emojiRoutes.get(`/me`, authMiddleware, getMyManifestHandler)
emojiRoutes.patch(`/me`, authMiddleware, updateMyPackHandler)
emojiRoutes.post(`/me/items`, authMiddleware, uploadMyItemHandler)
emojiRoutes.delete(`/me/items/:id`, authMiddleware, deleteMyItemHandler)
emojiRoutes.delete(`/me`, authMiddleware, deleteMyPackHandler)
