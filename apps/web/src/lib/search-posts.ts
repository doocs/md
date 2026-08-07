import type { Post } from '@/types/post'

export interface HighlightPart {
  text: string
  highlight: boolean
}

export interface SearchResult extends Post {
  titleParts: HighlightPart[]
  snippetParts: HighlightPart[]
}

export interface SearchOptions {
  isRegex?: boolean
  isCaseSensitive?: boolean
}

export interface SearchScan {
  results: SearchResult[]
  totalMatches: number
}

export function getSearchRegex(query: string, { isRegex = false, isCaseSensitive = false }: SearchOptions = {}): RegExp | null {
  if (!query.trim())
    return null
  try {
    if (isRegex)
      return new RegExp(query, `gm${isCaseSensitive ? `` : `i`}`)
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)
    return new RegExp(escaped, `gm${isCaseSensitive ? `` : `i`}`)
  }
  catch {
    return null
  }
}

export function highlightParts(text: string, query: string, options: SearchOptions = {}): HighlightPart[] {
  if (!query)
    return [{ text, highlight: false }]
  const regex = getSearchRegex(query, options)
  if (!regex)
    return [{ text, highlight: false }]
  const parts: HighlightPart[] = []
  let lastIndex = 0
  let match = regex.exec(text)
  while (match !== null) {
    if (match.index > lastIndex)
      parts.push({ text: text.slice(lastIndex, match.index), highlight: false })
    parts.push({ text: match[0], highlight: true })
    lastIndex = match.index + match[0].length
    if (match[0].length === 0)
      regex.lastIndex++
    match = regex.exec(text)
  }
  if (lastIndex < text.length)
    parts.push({ text: text.slice(lastIndex), highlight: false })
  return parts
}

export function getContentSnippet(content: string, query: string, options: SearchOptions = {}): string {
  if (!query.trim())
    return ``
  const regex = getSearchRegex(query, options)
  if (!regex)
    return ``
  const match = regex.exec(content)
  if (!match)
    return ``
  const idx = match.index
  const matchLen = match[0].length
  const start = Math.max(0, idx - 20)
  const end = Math.min(content.length, idx + matchLen + 40)
  let snippet = content.slice(start, end).replace(/\n/g, ` `)
  if (start > 0)
    snippet = `…${snippet}`
  if (end < content.length)
    snippet = `${snippet}…`
  return snippet
}

/**
 * Single pass over all posts collecting both the matching-post list and the
 * global match count, so stats and results never scan the corpus twice.
 */
export function scanPosts(posts: Post[], query: string, options: SearchOptions = {}): SearchScan {
  const q = query.trim()
  const empty: SearchScan = { results: [], totalMatches: 0 }
  if (!q)
    return empty
  const regex = getSearchRegex(q, options)
  if (!regex)
    return empty

  const results: SearchResult[] = []
  let totalMatches = 0
  for (const post of posts) {
    // String.match with a global regex always scans from the start, avoiding
    // the stale-lastIndex pitfalls of repeated RegExp.test calls.
    const titleMatches = post.title.match(regex)?.length ?? 0
    const contentMatches = post.content.match(regex)?.length ?? 0
    totalMatches += titleMatches + contentMatches
    if (titleMatches + contentMatches === 0)
      continue
    const snippet = getContentSnippet(post.content, q, options)
    results.push({
      ...post,
      titleParts: highlightParts(post.title, q, options),
      snippetParts: snippet ? highlightParts(snippet, q, options) : [],
    })
  }
  return { results, totalMatches }
}
