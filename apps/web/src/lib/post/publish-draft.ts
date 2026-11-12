import { parseFrontMatter } from '@md/core/utils'

export interface PublishDraftFields {
  title: string
  desc: string
  thumb: string
}

const HEADING_SELECTOR = `h1, h2, h3, h4, h5, h6`
const SKIPPED_IMAGE_CLASS = /(?:^|\s)(?:md-emoji|md-asset-img)(?:\s|$)/
const STRUCTURAL_ANCESTOR = `blockquote, li, td, th, figcaption, pre`

/**
 * Prefill the publish dialog from the article itself.
 * The preview also contains the reading-time quote, emoji images, and the
 * references heading, so those must not become the title, summary, or cover.
 * Explicit front matter wins over inferred body text.
 */
export function extractPublishDraft(html: string, markdown = ``): PublishDraftFields {
  const fromBody = extractFromHtml(html)
  const fromMeta = extractFromFrontMatter(markdown)
  return {
    title: fromMeta.title || fromBody.title,
    desc: fromMeta.desc || fromBody.desc,
    thumb: fromMeta.thumb || fromBody.thumb,
  }
}

function extractFromFrontMatter(markdown: string): PublishDraftFields {
  if (!markdown.trim())
    return { title: ``, desc: ``, thumb: `` }

  const { attributes } = parseFrontMatter(markdown)
  return {
    title: stringField(attributes.title),
    desc: stringField(attributes.description) || stringField(attributes.desc) || stringField(attributes.summary),
    thumb: stringField(attributes.cover) || stringField(attributes.image) || stringField(attributes.thumb),
  }
}

function extractFromHtml(html: string): PublishDraftFields {
  const root = parseHtml(html)
  if (!root)
    return { title: ``, desc: ``, thumb: `` }

  return {
    title: firstHeading(root),
    desc: firstParagraph(root),
    thumb: firstContentImage(root),
  }
}

function parseHtml(html: string): HTMLElement | null {
  if (!html.trim() || typeof DOMParser === `undefined`)
    return null
  return new DOMParser().parseFromString(html, `text/html`).body
}

function firstHeading(root: ParentNode): string {
  for (const heading of root.querySelectorAll(HEADING_SELECTOR)) {
    if (isReferencesHeading(heading))
      continue
    const text = textOf(heading)
    if (text)
      return text
  }
  return ``
}

function isReferencesHeading(heading: Element): boolean {
  const next = heading.nextElementSibling
  return next?.tagName === `P` && next.classList.contains(`footnotes`)
}

function firstParagraph(root: ParentNode): string {
  const paragraphs = [...root.querySelectorAll(`p`)].filter(paragraph => !isAuxiliaryParagraph(paragraph))
  const body = paragraphs.find(paragraph => !paragraph.closest(STRUCTURAL_ANCESTOR) && textOf(paragraph))
  return textOf(body ?? paragraphs.find(paragraph => textOf(paragraph)) ?? null)
}

function isAuxiliaryParagraph(paragraph: Element): boolean {
  if (paragraph.classList.contains(`md-blockquote-p`) || paragraph.classList.contains(`footnotes`))
    return true
  return [...paragraph.classList].some(name => name.includes(`alert-title`))
}

function firstContentImage(root: ParentNode): string {
  for (const image of root.querySelectorAll(`img`)) {
    if (SKIPPED_IMAGE_CLASS.test(image.className) || image.closest(`figcaption`))
      continue
    const src = image.getAttribute(`src`)?.trim() ?? ``
    if (!src || src === `about:blank` || src.startsWith(`asset:`))
      continue
    return src
  }
  return ``
}

function textOf(element: Element | null | undefined): string {
  return (element?.textContent ?? ``).replace(/\s+/g, ` `).trim()
}

function stringField(value: unknown): string {
  return typeof value === `string` ? value.trim() : ``
}
