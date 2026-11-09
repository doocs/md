import { Marked } from 'marked'
import { parse } from 'yaml'

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[character])
}

export function safeHref(value) {
  if (typeof value !== 'string')
    return null
  if (/^(?:\/(?!\/)|#[\w-])/.test(value) && !/[\s\\]/.test(value))
    return value
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  }
  catch {
    return null
  }
}

export function renderMarkdown(source) {
  const toc = []
  const markdown = new Marked({
    renderer: {
      html({ text }) { return escapeHtml(text) },
      heading({ depth, text, tokens }) {
        const id = `section-${toc.length + 1}`
        toc.push({ id, depth, text: text.replace(/[*_`]/g, '') })
        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`
      },
      link({ href, tokens }) {
        const text = this.parser.parseInline(tokens)
        const url = safeHref(href)
        return url ? `<a href="${escapeHtml(url)}">${text}</a>` : text
      },
      image({ href, text }) {
        const url = safeHref(href)
        return url ? `<img src="${escapeHtml(url)}" alt="${escapeHtml(text)}" loading="lazy" decoding="async">` : escapeHtml(text)
      },
    },
  })
  return { html: markdown.parse(source), toc }
}

function checkDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().startsWith(value)
}

export function readPost(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match)
    throw new Error(`${filename}: Markdown posts need YAML frontmatter`)
  const metadata = parse(match[1])
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata))
    throw new Error(`${filename}: invalid frontmatter`)
  const slug = metadata.slug || filename.replace(/\.md$/, '')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error(`${filename}: invalid slug`)
  if (!['release', 'tutorial', 'community'].includes(metadata.category) || !checkDate(metadata.date) || (metadata.updated && !checkDate(metadata.updated)))
    throw new Error(`${filename}: invalid category or date`)
  for (const field of ['title', 'summary', 'author', 'cover', 'coverAlt']) {
    if (typeof metadata[field] !== 'string' || !metadata[field].trim())
      throw new Error(`${filename}: ${field} is required`)
  }
  if (!/^\/images\/[\w-]+\.(?:webp|png|jpg)$/.test(metadata.cover))
    throw new Error(`${filename}: cover must be a local product image`)
  if (metadata.draft != null && typeof metadata.draft !== 'boolean')
    throw new Error(`${filename}: draft must be a boolean`)
  if (metadata.category === 'release' && !['main', 'cli'].includes(metadata.channel))
    throw new Error(`${filename}: release posts need a channel`)
  if (metadata.sources && (!Array.isArray(metadata.sources) || metadata.sources.some(source => !safeHref(source) || !source.startsWith('https://'))))
    throw new Error(`${filename}: invalid source links`)
  const rendered = renderMarkdown(match[2])
  const characters = (match[2].match(/[\u4E00-\u9FFF]/g) || []).length
  const words = (match[2].match(/[a-z]+/gi) || []).length
  return { ...metadata, slug, href: `/blog/${slug}/`, ...rendered, minutes: Math.max(1, Math.ceil(characters / 400 + words / 200)) }
}

export function publicPosts(posts) {
  const published = posts.filter(post => !post.draft).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
  if (new Set(published.map(post => post.slug)).size !== published.length)
    throw new Error('Duplicate published blog slug')
  return published
}

export function formatDate(value) {
  return value ? value.slice(0, 10).replaceAll('-', '.') : ''
}
