import { describe, expect, it } from 'vitest'
import {
  coerceHistoryDateTime,
  normalizePostHistory,
  parseStoredDateTime,
  toStoredDateTime,
} from './datetime'

describe(`toStoredDateTime`, () => {
  it(`returns epoch milliseconds`, () => {
    const date = new Date(`2024-06-01T12:00:00.000Z`)
    expect(toStoredDateTime(date)).toBe(Date.parse(`2024-06-01T12:00:00.000Z`))
  })
})

describe(`parseStoredDateTime`, () => {
  it(`parses Date, ISO string and number`, () => {
    const iso = `2024-06-01T12:00:00.000Z`
    expect(parseStoredDateTime(new Date(iso))).toBe(Date.parse(iso))
    expect(parseStoredDateTime(iso)).toBe(Date.parse(iso))
    expect(parseStoredDateTime(Date.parse(iso))).toBe(Date.parse(iso))
  })

  it(`parses common locale-formatted strings`, () => {
    expect(parseStoredDateTime(`2024/6/1 12:00:00`)).toBe(new Date(`2024/6/1 12:00:00`).getTime())
  })

  it(`returns null for invalid values instead of epoch 0`, () => {
    expect(parseStoredDateTime(undefined)).toBeNull()
    expect(parseStoredDateTime(null)).toBeNull()
    expect(parseStoredDateTime(`not-a-date`)).toBeNull()
    expect(parseStoredDateTime(Number.NaN)).toBeNull()
  })

  it(`preserves legitimate epoch 0`, () => {
    expect(parseStoredDateTime(0)).toBe(0)
  })
})

describe(`coerceHistoryDateTime`, () => {
  it(`converts parseable values to epoch ms`, () => {
    expect(coerceHistoryDateTime(`2024-01-01T00:00:00.000Z`)).toBe(Date.parse(`2024-01-01T00:00:00.000Z`))
    expect(coerceHistoryDateTime(1_700_000_000_000)).toBe(1_700_000_000_000)
  })

  it(`keeps unparseable legacy strings as-is`, () => {
    expect(coerceHistoryDateTime(`not-a-date`)).toBe(`not-a-date`)
  })
})

describe(`normalizePostHistory`, () => {
  it(`normalizes mixed legacy and numeric entries`, () => {
    const history = normalizePostHistory([
      { datetime: `2024-01-01T00:00:00.000Z`, content: `iso` },
      { datetime: 1_700_000_000_000, content: `ms` },
      { datetime: `not-a-date`, content: `legacy` },
    ])

    expect(history).toEqual([
      { datetime: Date.parse(`2024-01-01T00:00:00.000Z`), content: `iso` },
      { datetime: 1_700_000_000_000, content: `ms` },
      { datetime: `not-a-date`, content: `legacy` },
    ])
  })

  it(`returns empty array for missing history`, () => {
    expect(normalizePostHistory(undefined)).toEqual([])
    expect(normalizePostHistory(null)).toEqual([])
  })
})
