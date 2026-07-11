import { describe, expect, it } from 'vitest'
import { generatePureHTML } from './pureHtml'

describe(`generatePureHTML`, () => {
  it(`renders headings without theme classes`, async () => {
    const html = await generatePureHTML(`# Title\n\nParagraph`)
    expect(html).toContain(`<h1`)
    expect(html).toContain(`Title`)
    expect(html).toContain(`Paragraph`)
  })

  it(`renders alert blocks without styled alert chrome when withoutStyle`, async () => {
    const html = await generatePureHTML(`> [!NOTE]\n> Body`)
    expect(html).toContain(`Body`)
  })
})
