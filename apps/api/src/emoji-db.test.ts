import { describe, expect, it } from 'vitest'
import { insertUserEmojiItemConditional } from './emoji-db'
import { EMOJI_MAX_ITEMS } from './emoji-validate'

function conditionalInsertDb(changes: number) {
  let sql = ``
  let bindings: unknown[] = []
  const db = {
    prepare(value: string) {
      sql = value
      return {
        bind(...values: unknown[]) {
          bindings = values
          return {
            run: async () => ({ meta: { changes } }),
          }
        },
      }
    },
  } as unknown as D1Database
  return {
    db,
    inspect: () => ({ sql, bindings }),
  }
}

describe(`insertUserEmojiItemConditional`, () => {
  it(`enforces the item cap in the INSERT statement`, async () => {
    const fake = conditionalInsertDb(1)
    const inserted = await insertUserEmojiItemConditional(fake.db, {
      id: `item-id`,
      userId: `user-id`,
      objectKey: `user/user-id/item-id.png`,
      name: `emoji`,
      mime: `image/png`,
      size: 42,
      createdAt: 123,
    })

    expect(inserted).toBe(true)
    expect(fake.inspect().sql).toContain(`HAVING COUNT(i.id) < ?`)
    expect(fake.inspect().bindings.at(-1)).toBe(EMOJI_MAX_ITEMS)
  })

  it(`reports a rejected insert at the concurrent quota boundary`, async () => {
    const fake = conditionalInsertDb(0)
    const inserted = await insertUserEmojiItemConditional(fake.db, {
      id: `item-id`,
      userId: `user-id`,
      objectKey: `user/user-id/item-id.png`,
      name: `emoji`,
      mime: `image/png`,
      size: 42,
      createdAt: 123,
    })
    expect(inserted).toBe(false)
  })
})
