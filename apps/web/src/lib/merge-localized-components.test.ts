import type { CustomComponentDef } from '@md/shared'
import { describe, expect, it } from 'vitest'
import { mergeLocalizedComponents } from '@/lib/merge-localized-components'

describe(`mergeLocalizedComponents`, () => {
  it(`lets user components override built-ins by name`, () => {
    const builtins: CustomComponentDef[] = [
      { id: `b1`, name: `TipBlock`, template: `a`, props: [], builtIn: true, description: `builtin` },
      { id: `b2`, name: `Other`, template: `b`, props: [], builtIn: true },
    ]
    const user: CustomComponentDef[] = [
      { id: `u1`, name: `TipBlock`, template: `custom`, props: [], description: `user` },
      { id: `u2`, name: `Mine`, template: `c`, props: [] },
    ]
    const merged = mergeLocalizedComponents(builtins, user)
    expect(merged.map(c => c.name).sort()).toEqual([`Mine`, `Other`, `TipBlock`])
    expect(merged.find(c => c.name === `TipBlock`)?.description).toBe(`user`)
    expect(merged.find(c => c.name === `TipBlock`)?.template).toBe(`custom`)
  })

  it(`does not let user components override hidden inline system components`, () => {
    const builtins: CustomComponentDef[] = [
      { id: `b1`, name: `Emoji`, template: ``, props: [], builtIn: true, inline: true, hidden: true },
    ]
    const user: CustomComponentDef[] = [
      { id: `u1`, name: `Emoji`, template: `<div>nope</div>`, props: [] },
    ]
    const merged = mergeLocalizedComponents(builtins, user)
    expect(merged).toHaveLength(1)
    expect(merged[0].id).toBe(`b1`)
    expect(merged[0].template).toBe(``)
  })
})
