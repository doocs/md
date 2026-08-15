// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { inlineEmojiImagesAsBase64 } from './inlineEmojiImages'

vi.mock(`@/lib/assets/blob`, async importOriginal => ({
  ...await importOriginal<typeof import('../assets/blob')>(),
  blobToDataUrl: vi.fn(async () => `data:image/png;base64,STUB`),
}))

const getEmojiBlobMock = vi.fn()

vi.mock(`@/storage/repositories/emoji`, () => ({
  getEmojiBlob: (id: string) => getEmojiBlobMock(id),
}))

function makeBlob(content: string): Blob {
  return new Blob([content], { type: `image/png` })
}

function buildContainer(html: string): HTMLElement {
  const div = document.createElement(`div`)
  div.innerHTML = html
  return div
}

beforeEach(() => {
  getEmojiBlobMock.mockReset()
  // Default: return a fresh blob so each test only has to override the cases
  // where the lookup is expected to miss.
  getEmojiBlobMock.mockImplementation(() => Promise.resolve(makeBlob(`default`)))
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe(`inlineEmojiImagesAsBase64`, () => {
  describe(`asset: scheme`, () => {
    it(`rewrites <img src="asset://abc"> via getEmojiBlob`, async () => {
      getEmojiBlobMock.mockResolvedValueOnce(makeBlob(`a`))
      const root = buildContainer(`<img src="asset://abc">`)

      await inlineEmojiImagesAsBase64(root)

      expect(getEmojiBlobMock).toHaveBeenCalledWith(`abc`)
      const img = root.querySelector(`img`)!
      expect(img.getAttribute(`src`)).toBe(`data:image/png;base64,STUB`)
      expect(img.getAttribute(`src`)).not.toContain(`asset:`)
    })

    it(`keeps working with the legacy asset:<id> form (no slashes)`, async () => {
      getEmojiBlobMock.mockResolvedValueOnce(makeBlob(`b`))
      const root = buildContainer(`<img src="asset:xyz">`)

      await inlineEmojiImagesAsBase64(root)

      expect(getEmojiBlobMock).toHaveBeenCalledWith(`xyz`)
      expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`data:image/png;base64,STUB`)
    })

    it(`tolerates extra leading/trailing slashes in the asset: scheme`, async () => {
      getEmojiBlobMock.mockResolvedValueOnce(makeBlob(`c`))
      const root = buildContainer(`<img src="asset:///crazy//">`)

      await inlineEmojiImagesAsBase64(root)

      expect(getEmojiBlobMock).toHaveBeenCalledWith(`crazy`)
    })

    it(`leaves the src untouched when getEmojiBlob returns null`, async () => {
      getEmojiBlobMock.mockResolvedValueOnce(null)
      const root = buildContainer(`<img src="asset://missing">`)

      await inlineEmojiImagesAsBase64(root)

      expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`asset://missing`)
    })

    it(`rejects ids that contain slashes (locked-down behaviour)`, async () => {
      const root = buildContainer(`<img src="asset://a/b">`)

      await inlineEmojiImagesAsBase64(root)

      expect(getEmojiBlobMock).not.toHaveBeenCalled()
      expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`asset://a/b`)
    })

    it(`inlines multiple asset: images in parallel`, async () => {
      getEmojiBlobMock.mockImplementation(async id => makeBlob(`payload-${id}`))
      const root = buildContainer(
        `<img src="asset://one"><img src="asset://two"><img src="asset://three">`,
      )

      await inlineEmojiImagesAsBase64(root)

      expect(getEmojiBlobMock).toHaveBeenCalledTimes(3)
      for (const img of Array.from(root.querySelectorAll(`img`))) {
        expect(img.getAttribute(`src`)).toBe(`data:image/png;base64,STUB`)
      }
    })
  })

  describe(`inline <img class="md-emoji">`, () => {
    it(`inlines a placeholder whose src is still about:blank via IDB`, async () => {
      getEmojiBlobMock.mockResolvedValueOnce(makeBlob(`emoji-payload`))
      const root = buildContainer(
        `<img class="md-emoji" data-emoji-id="hash-1" src="about:blank" alt=":hash-1:">`,
      )

      await inlineEmojiImagesAsBase64(root)

      expect(getEmojiBlobMock).toHaveBeenCalledWith(`hash-1`)
      const img = root.querySelector(`img`)!
      expect(img.getAttribute(`src`)).toBe(`data:image/png;base64,STUB`)
      expect(img.getAttribute(`data-emoji-id`)).toBe(`hash-1`)
      expect(img.getAttribute(`alt`)).toBe(`:hash-1:`)
    })

    it(`prefers the live blob: URL over the IDB lookup`, async () => {
      // Simulate a hydrated emoji whose src is a blob: URL the hydration
      // observer already wired up. The SUT should read it directly instead
      // of going to IDB.
      const hydrated = makeBlob(`hydrated-payload`)
      const hydratedUrl = URL.createObjectURL(hydrated)
      try {
        const root = buildContainer(
          `<img class="md-emoji" data-emoji-id="hash-2" src="${hydratedUrl}" alt=":hash-2:">`,
        )

        await inlineEmojiImagesAsBase64(root)

        // No IDB hit when the live blob is fetchable.
        expect(getEmojiBlobMock).not.toHaveBeenCalled()
        expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`data:image/png;base64,STUB`)
      }
      finally {
        URL.revokeObjectURL(hydratedUrl)
      }
    })

    it(`falls back to IDB when fetching the live blob: URL fails`, async () => {
      // Build an <img> whose src points to a blob: URL that does not exist.
      // fetch() will reject with a TypeError, and the SUT must fall back to
      // getEmojiBlob so the user does not see a broken image.
      const orphanUrl = `blob:https://example.invalid/does-not-exist`
      getEmojiBlobMock.mockResolvedValueOnce(makeBlob(`fallback-payload`))
      const root = buildContainer(
        `<img class="md-emoji" data-emoji-id="hash-3" src="${orphanUrl}" alt=":hash-3:">`,
      )

      await inlineEmojiImagesAsBase64(root)

      expect(getEmojiBlobMock).toHaveBeenCalledWith(`hash-3`)
      expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`data:image/png;base64,STUB`)
    })

    it(`leaves the placeholder src alone when both blob sources miss`, async () => {
      getEmojiBlobMock.mockResolvedValueOnce(null)
      const root = buildContainer(
        `<img class="md-emoji" data-emoji-id="hash-4" src="about:blank" alt=":hash-4:">`,
      )

      await inlineEmojiImagesAsBase64(root)

      expect(getEmojiBlobMock).toHaveBeenCalledWith(`hash-4`)
      expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`about:blank`)
    })

    it(`ignores <img class="md-emoji"> without a data-emoji-id`, async () => {
      const root = buildContainer(
        `<img class="md-emoji" src="about:blank" alt=":orphan:">`,
      )

      await inlineEmojiImagesAsBase64(root)

      expect(getEmojiBlobMock).not.toHaveBeenCalled()
      expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`about:blank`)
    })
  })

  describe(`unrelated images`, () => {
    it(`does not touch a remote http(s) <img>`, async () => {
      const root = buildContainer(`<img src="https://example.com/x.png" alt="x">`)

      await inlineEmojiImagesAsBase64(root)

      expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`https://example.com/x.png`)
      expect(getEmojiBlobMock).not.toHaveBeenCalled()
    })

    it(`does not touch an <img> with neither asset: nor md-emoji class`, async () => {
      const root = buildContainer(`<img src="data:image/png;base64,ALREADY">`)

      await inlineEmojiImagesAsBase64(root)

      expect(root.querySelector(`img`)!.getAttribute(`src`)).toBe(`data:image/png;base64,ALREADY`)
      expect(getEmojiBlobMock).not.toHaveBeenCalled()
    })
  })

  describe(`mixed container`, () => {
    it(`inlines asset: and md-emoji images side by side`, async () => {
      getEmojiBlobMock.mockImplementation(async id => makeBlob(`payload-${id}`))
      const root = buildContainer(`
        <img src="asset://a">
        <img class="md-emoji" data-emoji-id="b" src="about:blank">
        <img src="https://example.com/keep.png">
      `)

      await inlineEmojiImagesAsBase64(root)

      const [a, b, c] = Array.from(root.querySelectorAll(`img`))
      expect(a.getAttribute(`src`)).toBe(`data:image/png;base64,STUB`)
      expect(b.getAttribute(`src`)).toBe(`data:image/png;base64,STUB`)
      expect(c.getAttribute(`src`)).toBe(`https://example.com/keep.png`)
    })
  })
})
