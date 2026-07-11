import { describe, expect, it } from 'vitest'
import {
  sanitizeHtmlSnapshot,
  sanitizeStylesSnapshot,
  sharePageCspMeta,
} from './share-sanitize'

describe(`sanitizeHtmlSnapshot`, () => {
  it(`strips script tags and event handlers`, () => {
    const html = `<div onclick="alert(1)"><script>evil()</script><p>ok</p></div>`
    const out = sanitizeHtmlSnapshot(html)
    expect(out).not.toContain(`script`)
    expect(out).not.toContain(`onclick`)
    expect(out).toContain(`<p>ok</p>`)
  })

  it(`strips dangerous tags and javascript urls`, () => {
    const html = `<iframe src="x"></iframe><a href="javascript:alert(1)">x</a>`
    const out = sanitizeHtmlSnapshot(html)
    expect(out).not.toContain(`iframe`)
    expect(out.toLowerCase()).not.toContain(`javascript:`)
  })
})

describe(`sanitizeStylesSnapshot`, () => {
  it(`blocks style breakout and dangerous imports`, () => {
    const styles = `body{}</style><script>x</script><style>@import url("javascript:alert(1)");`
    const out = sanitizeStylesSnapshot(styles)
    expect(out).not.toContain(`</style>`)
    expect(out).not.toContain(`script`)
    expect(out).not.toMatch(/@import\s[^;]*javascript/i)
  })
})

describe(`sharePageCspMeta`, () => {
  it(`emits a CSP meta tag without scripts`, () => {
    const meta = sharePageCspMeta()
    expect(meta).toContain(`Content-Security-Policy`)
    expect(meta).toContain(`script-src 'none'`)
  })
})
