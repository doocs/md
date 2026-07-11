import type { CustomComponentDef } from '@md/shared'
import { CompletionContext } from '@codemirror/autocomplete'
import { EditorState } from '@codemirror/state'
import { beforeAll, describe, expect, it } from 'vitest'
import { setAppI18n, setupI18n } from '@/i18n'
import { createComponentCompletionSource } from './useComponentCompletion'

const tip: CustomComponentDef = {
  id: `tip`,
  name: `TipBlock`,
  template: ``,
  props: [
    { name: `type`, default: `info` },
    { name: `content`, required: true },
  ],
  example: `<TipBlock type="info" content="hi" />`,
  description: `A tip`,
  builtIn: true,
}

function ctx(doc: string, explicit = false, pos = doc.length) {
  const state = EditorState.create({ doc })
  return new CompletionContext(state, pos, explicit)
}

beforeAll(() => {
  setAppI18n(setupI18n(`zh-CN`))
})

describe(`createComponentCompletionSource`, () => {
  const source = createComponentCompletionSource(() => [tip])

  it(`lists components on bare <`, () => {
    const result = source(ctx(`<`))
    expect(result).not.toBeNull()
    expect(result!.options.map(o => o.label)).toContain(`TipBlock`)
  })

  it(`filters by PascalCase prefix`, () => {
    const result = source(ctx(`<Tip`))
    expect(result).not.toBeNull()
    expect(result!.options.map(o => o.label)).toEqual([`TipBlock`])
  })

  it(`does not open on lowercase HTML tags`, () => {
    expect(source(ctx(`<div`))).toBeNull()
  })

  it(`completes props after a component name + space`, () => {
    const result = source(ctx(`<TipBlock `))
    expect(result).not.toBeNull()
    expect(result!.options.map(o => o.label).sort()).toEqual([`content`, `type`])
  })
})
