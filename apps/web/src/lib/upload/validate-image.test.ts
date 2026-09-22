import { describe, expect, it } from 'vitest'
import { collectClipboardImages } from './clipboard-images'
import { normalizePastedImageFile, validateImageFile } from './validate-image'

function t(key: string): string {
  return key
}

function makeFile(name: string, type: string, size = 16): File {
  return new File([new Uint8Array(size)], name, { type })
}

describe(`validateImageFile`, () => {
  it(`accepts a named PNG`, () => {
    expect(validateImageFile(makeFile(`shot.png`, `image/png`), t)).toEqual({ ok: true })
  })

  it(`accepts a clipboard screenshot with MIME type but no filename`, () => {
    expect(validateImageFile(makeFile(``, `image/png`), t)).toEqual({ ok: true })
  })

  it(`accepts a file with a valid suffix even when type is empty`, () => {
    expect(validateImageFile(makeFile(`photo.JPEG`, ``), t)).toEqual({ ok: true })
  })

  it(`rejects a non-image file`, () => {
    expect(validateImageFile(makeFile(`notes.pdf`, `application/pdf`), t)).toEqual({
      ok: false,
      msg: `upload.errors.invalidFormat`,
    })
  })

  it(`rejects oversized images`, () => {
    expect(validateImageFile(makeFile(`huge.png`, `image/png`, 11 * 1024 * 1024), t)).toEqual({
      ok: false,
      msg: `upload.errors.tooLarge`,
    })
  })
})

describe(`normalizePastedImageFile`, () => {
  it(`keeps a file that already has an image suffix`, () => {
    const file = makeFile(`shot.png`, `image/png`)
    expect(normalizePastedImageFile(file)).toBe(file)
  })

  it(`adds a filename when the clipboard image has no extension`, () => {
    const normalized = normalizePastedImageFile(makeFile(``, `image/png`))
    expect(normalized.name).toBe(`pasted-image.png`)
    expect(normalized.type).toBe(`image/png`)
  })
})

describe(`collectClipboardImages`, () => {
  it(`returns an empty list when clipboard data is missing`, () => {
    expect(collectClipboardImages(null)).toEqual([])
  })

  it(`collects image files from clipboard items`, () => {
    const image = makeFile(`image.png`, `image/png`)
    const data = {
      items: [{
        kind: `file`,
        type: `image/png`,
        getAsFile: () => image,
      }],
      files: [image],
    } as unknown as DataTransfer

    expect(collectClipboardImages(data)).toEqual([image])
  })

  it(`ignores files when items already contain the clipboard image`, () => {
    const fromItems = makeFile(`image.png`, `image/png`)
    const fromFiles = makeFile(`image.png`, `image/png`)
    const data = {
      items: [{
        kind: `file`,
        type: `image/png`,
        getAsFile: () => fromItems,
      }],
      files: [fromFiles],
    } as unknown as DataTransfer

    expect(collectClipboardImages(data)).toEqual([fromItems])
  })

  it(`reads files when clipboard items have no image`, () => {
    const image = makeFile(`shot.png`, `image/png`)
    const data = {
      items: [{
        kind: `string`,
        type: `text/plain`,
        getAsFile: () => null,
      }],
      files: [image],
    } as unknown as DataTransfer

    expect(collectClipboardImages(data)).toEqual([image])
  })

  it(`normalizes nameless clipboard screenshots`, () => {
    const image = makeFile(``, `image/webp`)
    const data = {
      items: [{
        kind: `file`,
        type: `image/webp`,
        getAsFile: () => image,
      }],
      files: [],
    } as unknown as DataTransfer

    const collected = collectClipboardImages(data)
    expect(collected).toHaveLength(1)
    expect(collected[0].name).toBe(`pasted-image.webp`)
  })

  it(`ignores non-image clipboard files`, () => {
    const pdf = makeFile(`doc.pdf`, `application/pdf`)
    const data = {
      items: [{
        kind: `file`,
        type: `application/pdf`,
        getAsFile: () => pdf,
      }],
      files: [pdf],
    } as unknown as DataTransfer

    expect(collectClipboardImages(data)).toEqual([])
  })
})
