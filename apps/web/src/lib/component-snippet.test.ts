import type { CustomComponentDef } from '@md/shared'
import { describe, expect, it } from 'vitest'
import {
  alreadyUsedProps,
  buildComponentSnippet,
  formatAttr,
  getInitialPropValues,
  missingRequiredProps,
  parseExampleProps,
} from './component-snippet'

const tipDef: CustomComponentDef = {
  id: `test-tip`,
  name: `TipBlock`,
  template: ``,
  props: [
    { name: `type`, default: `info` },
    { name: `title` },
    { name: `content`, required: true },
  ],
  example: `<TipBlock type="info" title="提示" content="这是一条提示信息" />`,
}

describe(`parseExampleProps`, () => {
  it(`parses double-quoted props`, () => {
    expect(parseExampleProps(`<TipBlock type="info" content="hello" />`)).toEqual({
      type: `info`,
      content: `hello`,
    })
  })

  it(`parses single-quoted props`, () => {
    expect(parseExampleProps(`<A name='x' />`)).toEqual({ name: `x` })
  })
})

describe(`alreadyUsedProps`, () => {
  it(`ignores equals inside quoted URL values`, () => {
    const used = alreadyUsedProps(`url="https://x.com?a=1&b=2" text="hi"`)
    expect([...used].sort()).toEqual([`text`, `url`])
  })

  it(`counts incomplete attr at end`, () => {
    expect(alreadyUsedProps(`url="https://x.com" te`)).not.toContain(`te`)
    expect(alreadyUsedProps(`url="https://x.com" size=`)).toContain(`size`)
    expect(alreadyUsedProps(`url="https://x.com" size="1`)).toContain(`size`)
  })
})

describe(`formatAttr`, () => {
  it(`uses double quotes by default`, () => {
    expect(formatAttr(`url`, `https://a.com`)).toBe(`url="https://a.com"`)
  })

  it(`switches to single quotes when value has double quotes`, () => {
    expect(formatAttr(`title`, `say "hi"`)).toBe(`title='say "hi"'`)
  })

  it(`replaces double quotes when value has both quote types`, () => {
    expect(formatAttr(`title`, `say "hi" 'there'`)).toBe(`title="say 'hi' 'there'"`)
  })
})

describe(`getInitialPropValues`, () => {
  it(`overlays example props onto defaults for all props`, () => {
    const def: CustomComponentDef = {
      ...tipDef,
      props: [
        { name: `type`, default: `info` },
        { name: `title` },
        { name: `content`, required: true },
        { name: `extra`, default: `x` },
      ],
      example: `<TipBlock type="warning" content="hi" />`,
    }
    expect(getInitialPropValues(def)).toEqual({
      type: `warning`,
      title: `title`,
      content: `hi`,
      extra: `x`,
    })
  })

  it(`falls back to defaults and placeholders without example`, () => {
    const def: CustomComponentDef = {
      id: `x`,
      name: `X`,
      template: ``,
      props: [
        { name: `a`, default: `1` },
        { name: `b`, type: `boolean` },
        { name: `c`, required: true },
        { name: `d` },
      ],
    }
    expect(getInitialPropValues(def)).toEqual({
      a: `1`,
      b: `true`,
      c: ``,
      d: `d`,
    })
  })
})

describe(`missingRequiredProps`, () => {
  it(`flags empty required props`, () => {
    expect(missingRequiredProps(tipDef, {
      type: `info`,
      content: `  `,
    })).toEqual([`content`])
  })

  it(`passes when required props are filled`, () => {
    expect(missingRequiredProps(tipDef, {
      type: `info`,
      content: `hi`,
    })).toEqual([])
  })
})

describe(`buildComponentSnippet`, () => {
  it(`uses example when no values`, () => {
    expect(buildComponentSnippet(tipDef)).toBe(tipDef.example)
  })

  it(`builds from values and skips empty optional`, () => {
    expect(buildComponentSnippet(tipDef, {
      type: `warning`,
      title: ``,
      content: `hi`,
    })).toBe(`<TipBlock type="warning" content="hi" />`)
  })

  it(`keeps placeholder for empty required`, () => {
    expect(buildComponentSnippet(tipDef, {
      type: `info`,
      content: ``,
    })).toBe(`<TipBlock type="info" content="content" />`)
  })

  it(`formats values that contain double quotes`, () => {
    expect(buildComponentSnippet(tipDef, {
      type: `info`,
      content: `say "hi"`,
    })).toBe(`<TipBlock type="info" content='say "hi"' />`)
  })
})
