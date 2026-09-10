import { describe, expect, it } from 'vitest'
import {
  collectPlaceholderReplacements,
  hasMarkdownRemoteImages,
  rewriteMarkdownImagesToPlaceholders,
} from './pasteMarkdownImages'

describe(`hasMarkdownRemoteImages`, () => {
  it(`detects markdown images with http(s) urls`, () => {
    expect(hasMarkdownRemoteImages(`![alt](https://example.com/a.png)`)).toBe(true)
    expect(hasMarkdownRemoteImages(`![alt](http://example.com/a.png)`)).toBe(true)
  })

  it(`ignores local paths and plain text`, () => {
    expect(hasMarkdownRemoteImages(`![alt](./local.png)`)).toBe(false)
    expect(hasMarkdownRemoteImages(`no images here`)).toBe(false)
  })
})

describe(`rewriteMarkdownImagesToPlaceholders`, () => {
  it(`replaces each remote image with a unique placeholder`, () => {
    const { previewText, placeholders } = rewriteMarkdownImagesToPlaceholders(
      `see ![one](https://a.com/1.png) and ![two](https://b.com/2.png)`,
      `uploading`,
      42,
    )

    expect(placeholders).toEqual([
      { id: `LOADING_42_0`, originalUrl: `https://a.com/1.png`, originalAlt: `one` },
      { id: `LOADING_42_1`, originalUrl: `https://b.com/2.png`, originalAlt: `two` },
    ])
    expect(previewText).toBe(`see ![uploading](LOADING_42_0) and ![uploading](LOADING_42_1)`)
  })
})

describe(`collectPlaceholderReplacements`, () => {
  it(`maps placeholders back in a single change list`, () => {
    const placeholders = [
      { id: `LOADING_1_0`, originalUrl: `https://a.com/1.png`, originalAlt: `one` },
      { id: `LOADING_1_1`, originalUrl: `https://b.com/2.png`, originalAlt: `two` },
    ]
    const doc = `see ![uploading](LOADING_1_0) and ![uploading](LOADING_1_1)`
    const urls = new Map([
      [`https://a.com/1.png`, `https://cdn.example/1.png`],
    ])

    const changes = collectPlaceholderReplacements(doc, `uploading`, placeholders, urls)
    expect(changes).toHaveLength(2)
    expect(doc.slice(changes[0].from, changes[0].to)).toBe(`![uploading](LOADING_1_0)`)
    expect(changes[0].insert).toBe(`![one](https://cdn.example/1.png)`)
    expect(doc.slice(changes[1].from, changes[1].to)).toBe(`![uploading](LOADING_1_1)`)
    expect(changes[1].insert).toBe(`![two](https://b.com/2.png)`)
  })

  it(`skips placeholders the user already edited away`, () => {
    const placeholders = [
      { id: `LOADING_1_0`, originalUrl: `https://a.com/1.png`, originalAlt: `one` },
    ]
    expect(collectPlaceholderReplacements(`plain text`, `uploading`, placeholders, new Map())).toEqual([])
  })
})
