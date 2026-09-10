import type { EmojiItemRow, EmojiPackRow } from './emoji-db'
import type { Env } from './types'
import { describe, expect, it } from 'vitest'
import { manifestJson } from './emojis'
import app from './index'

describe(`emoji manifests`, () => {
  it(`builds stable absolute asset URLs and attribution metadata`, () => {
    const pack: EmojiPackRow = {
      id: `system-default`,
      owner_user_id: null,
      kind: `system`,
      slug: `default`,
      name: `Built-in`,
      source_url: null,
      source_commit: null,
      license_spdx: null,
      license_url: null,
      attribution: null,
      description: null,
      created_at: 1,
      updated_at: 2,
    }
    const item: EmojiItemRow = {
      id: `stable-id`,
      pack_id: pack.id,
      object_key: `system/default/stable-id.png`,
      name: `smile`,
      mime: `image/png`,
      size: 123,
      width: 32,
      height: 32,
      sort_order: 0,
      created_at: 1,
      updated_at: 2,
    }

    const manifest = manifestJson(pack, [item], `https://api.example`)
    expect(manifest.items[0]?.url).toBe(`https://api.example/emojis/assets/stable-id`)
    expect(manifest.slug).toBe(`default`)
  })
})

describe(`emoji route authentication`, () => {
  const env = {
    JWT_SECRET: `test-secret`,
  } as Env

  it.each([
    [`GET`, `/emojis/me`],
    [`PATCH`, `/emojis/me`],
    [`POST`, `/emojis/me/items`],
    [`DELETE`, `/emojis/me/items/item-id`],
    [`DELETE`, `/emojis/me`],
  ])(`requires auth for %s %s`, async (method, path) => {
    const response = await app.request(`https://api.example${path}`, { method }, env)
    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: `unauthorized` })
  })
})
