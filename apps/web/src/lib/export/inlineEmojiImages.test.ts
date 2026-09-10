// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { inlineEmojiImagesAsBase64 } from './inlineEmojiImages'

vi.mock(`@/services/account/config`, () => ({
  MD_API_URL: `https://api.example.com`,
}))

vi.mock(`@/lib/assets/blob`, () => ({
  blobToDataUrl: vi.fn(async () => `data:image/png;base64,STUB`),
}))

function buildContainer(html: string): HTMLElement {
  const root = document.createElement(`div`)
  root.innerHTML = html
  return root
}

beforeEach(() => {
  vi.stubGlobal(`fetch`, vi.fn(async () =>
    ({
      ok: true,
      blob: async () => new Blob([`image`], { type: `image/png` }),
    } as Response),
  ))
})

describe(`inlineEmojiImagesAsBase64`, () => {
  it(`resolves asset ids through the cloud asset endpoint`, async () => {
    const root = buildContainer(`<img src="asset://abc">`)

    await inlineEmojiImagesAsBase64(root)

    expect(fetch).toHaveBeenCalledWith(`https://api.example.com/emojis/assets/abc`)
    expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`data:image/png;base64,STUB`)
  })

  it(`supports the legacy asset:<id> syntax`, async () => {
    const root = buildContainer(`<img src="asset:legacy">`)

    await inlineEmojiImagesAsBase64(root)

    expect(fetch).toHaveBeenCalledWith(`https://api.example.com/emojis/assets/legacy`)
    expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`data:image/png;base64,STUB`)
  })

  it(`prefers an attached cloud URL for inline emoji`, async () => {
    const root = buildContainer(
      `<img class="md-emoji" data-emoji-id="cloud-1" src="https://cdn.example.com/cloud-1">`,
    )

    await inlineEmojiImagesAsBase64(root)

    expect(fetch).toHaveBeenCalledWith(`https://cdn.example.com/cloud-1`)
    expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`data:image/png;base64,STUB`)
  })

  it(`falls back to the deterministic endpoint when the attached URL fails`, async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob([`image`], { type: `image/png` }),
      } as Response)
    const root = buildContainer(
      `<img class="md-emoji" data-emoji-id="cloud-2" src="https://cdn.example.com/missing">`,
    )

    await inlineEmojiImagesAsBase64(root)

    expect(fetch).toHaveBeenNthCalledWith(2, `https://api.example.com/emojis/assets/cloud-2`)
    expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`data:image/png;base64,STUB`)
  })

  it(`keeps the original source when every cloud request fails`, async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)
    const root = buildContainer(`<img src="asset://missing">`)

    await inlineEmojiImagesAsBase64(root)

    expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`asset://missing`)
  })

  it(`does not touch unrelated images`, async () => {
    const root = buildContainer(`<img src="https://example.com/x.png">`)

    await inlineEmojiImagesAsBase64(root)

    expect(fetch).not.toHaveBeenCalled()
    expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`https://example.com/x.png`)
  })
})
