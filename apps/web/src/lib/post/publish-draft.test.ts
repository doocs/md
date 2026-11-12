// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { extractPublishDraft } from './publish-draft'

const ARTICLE_HTML = `
<section class="container">
  <blockquote class="md-blockquote">
    <p class="md-blockquote-p">120 words, about 1 min read</p>
  </blockquote>
  <h2 class="h2" data-heading="true">Earlier heading</h2>
  <p class="p">Opening paragraph.</p>
  <p class="p"><img class="md-emoji" data-emoji-id="smile" src="https://cdn.example/emoji.png" alt=":smile:" /></p>
  <figure><img src="https://cdn.example/cover.png" alt="cover" /></figure>
  <h1 class="h1" data-heading="true">Later heading</h1>
  <blockquote class="markdown-alert markdown-alert-note">
    <p class="markdown-alert-title alert-title-note">Note</p>
    <p class="p">Alert body</p>
  </blockquote>
  <h4 class="h4" data-heading="true">References</h4>
  <p class="footnotes"><code>[1]</code> https://example.com</p>
</section>
`

describe(`extractPublishDraft`, () => {
  it(`skips reading time, emoji, and the references heading`, () => {
    expect(extractPublishDraft(ARTICLE_HTML)).toEqual({
      title: `Earlier heading`,
      desc: `Opening paragraph.`,
      thumb: `https://cdn.example/cover.png`,
    })
  })

  it(`prefers front matter when the article declares publish metadata`, () => {
    const markdown = `---
title: Declared title
description: Declared summary
cover: https://cdn.example/meta.png
---

# Body heading

Body paragraph.
`
    expect(extractPublishDraft(ARTICLE_HTML, markdown)).toEqual({
      title: `Declared title`,
      desc: `Declared summary`,
      thumb: `https://cdn.example/meta.png`,
    })
  })

  it(`falls back to a paragraph inside a quote when the body has no plain paragraph`, () => {
    const html = `
      <blockquote class="markdown-alert">
        <p class="markdown-alert-title">Note</p>
        <p>Only this remains.</p>
      </blockquote>
    `
    expect(extractPublishDraft(html).desc).toBe(`Only this remains.`)
  })
})
