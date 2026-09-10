import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EmojiClient } from './client'

vi.mock(`@/services/account/config`, () => ({
  MD_API_URL: `https://api.example.com`,
  isAccountConfigured: () => true,
}))

const manifest = {
  id: `system-default`,
  kind: `system`,
  name: `Built-in`,
  createdAt: 1,
  updatedAt: 2,
  items: [{
    id: `weixiao`,
    name: `微笑`,
    mime: `image/png`,
    size: 123,
    width: 48,
    height: 48,
    sortOrder: 0,
    url: `https://api.example.com/emojis/assets/weixiao`,
  }],
}

beforeEach(() => {
  vi.stubGlobal(`fetch`, vi.fn(async () =>
    new Response(JSON.stringify(manifest), {
      status: 200,
      headers: { 'Content-Type': `application/json` },
    }),
  ))
})

describe(`emoji client`, () => {
  it(`normalizes an API manifest for the editor`, async () => {
    const client = new EmojiClient(() => null)

    const pack = await client.getDefault()

    expect(pack.source).toBe(`system`)
    expect(pack.files[0]).toMatchObject({
      id: `weixiao`,
      mimeType: `image/png`,
      width: 48,
    })
  })

  it(`uploads multipart data with auth and no manual content type`, async () => {
    const client = new EmojiClient(() => `token`)
    const file = new File([`GIF89a`], `wave.gif`, { type: `image/gif` })

    await client.upload(file)

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    expect(init?.headers).toEqual({ Authorization: `Bearer token` })
    expect(init?.body).toBeInstanceOf(FormData)
  })
})
