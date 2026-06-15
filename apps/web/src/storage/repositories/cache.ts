import { MAX_AI_IMAGE_ENTRIES, MAX_IMAGE_MAP_ENTRIES } from '@/storage/keys'

/** 裁剪 JSON 对象 map，保留最近 maxEntries 条 */
export function trimRecordMap(raw: string, maxEntries: number): string {
  try {
    const map = JSON.parse(raw) as Record<string, string>
    const keys = Object.keys(map)
    if (keys.length <= maxEntries)
      return raw

    const trimmed = keys.slice(-maxEntries).reduce<Record<string, string>>((acc, key) => {
      acc[key] = map[key]
      return acc
    }, {})
    return JSON.stringify(trimmed)
  }
  catch {
    return raw
  }
}

/** 裁剪 JSON 数组，保留最近 maxEntries 条 */
export function trimArray(raw: string, maxEntries: number): string {
  try {
    const arr = JSON.parse(raw) as unknown[]
    if (!Array.isArray(arr) || arr.length <= maxEntries)
      return raw
    return JSON.stringify(arr.slice(-maxEntries))
  }
  catch {
    return raw
  }
}

export function trimCacheValue(key: string, value: string): string {
  if (key === `uploaded_image_map`)
    return trimRecordMap(value, MAX_IMAGE_MAP_ENTRIES)
  if (key === `ai_generated_images` || key === `ai_image_timestamps` || key === `ai_image_prompts`)
    return trimArray(value, MAX_AI_IMAGE_ENTRIES)
  return value
}
