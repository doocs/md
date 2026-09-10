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

describe(`share manage authentication`, () => {
  const env = {
    JWT_SECRET: `test-secret`,
  } as Env

  it.each([
    [`GET`, `/share`],
    [`POST`, `/share`],
    [`DELETE`, `/share/aaaaaaaaaaaa`],
  ])(`requires auth for %s %s`, async (method, path) => {
    const response = await app.request(`https://api.example${path}`, { method }, env)
    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: `unauthorized` })
  })
})

describe(`share public routes`, () => {
  const env = {
    JWT_SECRET: `test-secret`,
    DB: stubD1(),
  } as Env

  it.each([
    [`GET`, `/s/not-a-share-id`],
    [`POST`, `/s/not-a-share-id/unlock`],
  ])(`rejects malformed share ids for %s %s`, async (method, path) => {
    const response = await app.request(`https://api.example${path}`, { method }, env)
    expect(response.status).toBe(404)
    expect(await response.text()).toBe(`Not Found`)
  })

  it(`returns 404 when a well-formed share id does not exist`, async () => {
    const response = await app.request(`https://api.example/s/aaaaaaaaaaaa`, {}, env)
    expect(response.status).toBe(404)
    expect(await response.text()).toBe(`Not Found`)
  })
})
