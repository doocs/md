import type { PostHistory } from '@/types/post'

/** Epoch ms for persistence (history, sync). */
export function toStoredDateTime(date: Date = new Date()): number {
  return date.getTime()
}

/**
 * Coerce stored datetime values to epoch ms.
 * Returns null when the value cannot be parsed (do not substitute epoch 0).
 */
export function parseStoredDateTime(value: Date | string | number | null | undefined): number | null {
  if (value == null)
    return null
  if (typeof value === `number`)
    return Number.isFinite(value) ? value : null
  const ms = value instanceof Date ? value.getTime() : new Date(value).getTime()
  return Number.isFinite(ms) ? ms : null
}

/**
 * Normalize a history datetime: prefer epoch ms, keep legacy strings when unparseable.
 */
export function coerceHistoryDateTime(value: number | string): number | string {
  return parseStoredDateTime(value) ?? value
}

/** Normalize post/sync history entries for persistence and in-memory use. */
export function normalizePostHistory(
  history: { datetime: number | string, content: string }[] | undefined | null,
): PostHistory[] {
  return (history ?? []).map(({ datetime, content }) => ({
    datetime: coerceHistoryDateTime(datetime),
    content: String(content),
  }))
}
