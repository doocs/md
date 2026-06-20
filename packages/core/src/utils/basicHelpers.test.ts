import { describe, expect, it } from 'vitest'
import { escapeHtml, simpleHash, ucfirst, unescapeHtml } from './basicHelpers'

describe('basicHelpers', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      `&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;`,
    )
  })

  it('unescapes HTML entities', () => {
    expect(unescapeHtml(`&lt;p&gt;&quot;hi&quot;&lt;/p&gt;`)).toBe(`<p>"hi"</p>`)
  })

  it('capitalizes first letter', () => {
    expect(ucfirst(`note`)).toBe(`Note`)
    expect(ucfirst(`ALERT`)).toBe(`Alert`)
  })

  it('produces stable hash for same input', () => {
    expect(simpleHash(`hello`)).toBe(simpleHash(`hello`))
    expect(simpleHash(`hello`)).not.toBe(simpleHash(`world`))
  })
})
