import type { Env } from './types'
import { describe, expect, it } from 'vitest'
import app from './index'

function stubD1(options?: { first?: unknown, results?: unknown[] }) {
  const stmt = {
    bind: (..._args: unknown[]) => stmt,
    first: async () => options?.first ?? null,
    all: async () => ({ results: options?.results ?? [] }),
    run: async () => ({ meta: { changes: 0 } }),
  }
  return {
    prepare: () => stmt,
  } as unknown as D1Database
}

describe(`marketplace authentication`, () => {
  const env = {
    JWT_SECRET: `test-secret`,
  } as Env

  it.each([
    [`GET`, `/marketplace/me`],
    [`POST`, `/marketplace/themes`],
    [`POST`, `/marketplace/components`],
    [`PATCH`, `/marketplace/item-id`],
    [`DELETE`, `/marketplace/item-id`],
    [`GET`, `/marketplace/admin/pending`],
    [`POST`, `/marketplace/admin/item-id/approve`],
    [`POST`, `/marketplace/admin/item-id/reject`],
  ])(`requires auth for %s %s`, async (method, path) => {
    const response = await app.request(`https://api.example${path}`, { method }, env)
    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: `unauthorized` })
  })
})

describe(`marketplace public browse`, () => {
  const env = {
    JWT_SECRET: `test-secret`,
    DB: stubD1({ first: { total: 0 }, results: [] }),
  } as Env

  it.each([
    `/marketplace/themes`,
    `/marketplace/components`,
  ])(`lists an empty catalog for %s`, async (path) => {
    const response = await app.request(`https://api.example${path}`, {}, env)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    })
  })

  it(`returns 404 for a missing item`, async () => {
    const missing = {
      JWT_SECRET: `test-secret`,
      DB: stubD1(),
    } as Env
    const response = await app.request(`https://api.example/marketplace/missing-id`, {}, missing)
    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: `not_found` })
  })
})
