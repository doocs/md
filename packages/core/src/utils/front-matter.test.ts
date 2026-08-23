import { describe, expect, it } from 'vitest'
import { parseFrontMatter } from './front-matter'

describe(`parseFrontMatter`, () => {
  it(`returns the original text when there is no fence`, () => {
    expect(parseFrontMatter(`# Hello`)).toEqual({
      attributes: {},
      body: `# Hello`,
    })
  })

  it(`parses a YAML block and leaves the body`, () => {
    expect(parseFrontMatter(`---\ntitle: Test\n---\n\n# Body`)).toEqual({
      attributes: { title: `Test` },
      body: `\n# Body`,
    })
  })

  it(`accepts CRLF and a BOM`, () => {
    expect(parseFrontMatter(`\uFEFF---\r\ntitle: CRLF\r\n---\r\nBody`)).toEqual({
      attributes: { title: `CRLF` },
      body: `Body`,
    })
  })

  it(`ignores a non-object YAML document`, () => {
    expect(parseFrontMatter(`---\njust a string\n---\n# Body`)).toEqual({
      attributes: {},
      body: `# Body`,
    })
  })

  it(`treats Markdown star lists as YAML sequences`, () => {
    const markdown = `---
title: Agent
tags:

* AI
* Agent
categories:
* 技术
draft: false
---

# Body`
    expect(parseFrontMatter(markdown)).toEqual({
      attributes: {
        title: `Agent`,
        tags: [`AI`, `Agent`],
        categories: [`技术`],
        draft: false,
      },
      body: `\n# Body`,
    })
  })

  it(`keeps the original text when YAML is invalid`, () => {
    const markdown = `---\nfoo: [unterminated\n---\n# Body`
    expect(parseFrontMatter(markdown)).toEqual({
      attributes: {},
      body: markdown,
    })
  })
})
