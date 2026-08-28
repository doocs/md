export interface OpenAIModelListResponse {
  data?: Array<{ id?: unknown, name?: unknown } | string>
  models?: Array<{ id?: unknown, name?: unknown } | string>
}

const IMAGE_MODEL_RE = /image|dall-e|dalle|kolors|flux|midjourney|ideogram|cogview|stable-?diff|sd3|t2i|seedream|recraft|wan\d/i
const NON_CHAT_MODEL_RE = /whisper|tts(?:-|$)|embedding|moderation|dall-e|dalle|gpt-image|transcri|audio-preview|kolors|kling|-image(?:-|$)/i

export function parseOpenAIModelIds(data: unknown): string[] {
  if (Array.isArray(data))
    return collectModelIds(data)
  if (!data || typeof data !== `object`)
    return []

  const payload = data as OpenAIModelListResponse
  if (Array.isArray(payload.data))
    return collectModelIds(payload.data)
  if (Array.isArray(payload.models))
    return collectModelIds(payload.models)
  return []
}

function collectModelIds(rows: Array<{ id?: unknown, name?: unknown } | string>): string[] {
  return rows
    .map((item) => {
      if (typeof item === `string`)
        return item.trim()
      if (item && typeof item === `object`) {
        if (typeof item.id === `string`)
          return item.id.trim()
        if (typeof item.name === `string`)
          return item.name.trim()
      }
      return ``
    })
    .filter(Boolean)
}

export function isLikelyImageModel(id: string): boolean {
  return IMAGE_MODEL_RE.test(id)
}

export function isLikelyNonChatModel(id: string): boolean {
  return NON_CHAT_MODEL_RE.test(id)
}

export function filterDiscoveredModels(ids: string[], kind: `chat` | `image`): string[] {
  const filtered = kind === `image`
    ? ids.filter(isLikelyImageModel)
    : ids.filter(id => !isLikelyNonChatModel(id))
  return filtered.length > 0 ? filtered : ids
}

export function mergeModelOptions(...lists: Array<readonly string[] | string | undefined | null>): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const list of lists) {
    const items = list == null ? [] : typeof list === `string` ? [list] : list
    for (const item of items) {
      const id = item.trim()
      if (!id || seen.has(id))
        continue
      seen.add(id)
      result.push(id)
    }
  }
  return result
}

export function formatDiscoverErrorDetail(errorText: string, maxLength = 160): string {
  const trimmed = errorText.replace(/\s+/g, ` `).trim()
  if (!trimmed)
    return ``
  const short = trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 3)}...` : trimmed
  return ` ${short}`
}
