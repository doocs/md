import { describe, expect, it } from 'vitest'
import {
  filterDiscoveredModels,
  formatDiscoverErrorDetail,
  mergeModelOptions,
  parseOpenAIModelIds,
} from './ai-models'

describe(`parseOpenAIModelIds`, () => {
  it(`keeps string ids and drops invalid entries`, () => {
    expect(parseOpenAIModelIds({
      data: [
        { id: `gpt-4.1` },
        { id: `  dall-e-3  ` },
        { id: 12 },
        {},
        { id: `` },
      ],
    })).toEqual([`gpt-4.1`, `dall-e-3`])
  })

  it(`reads Ollama-style models arrays and string entries`, () => {
    expect(parseOpenAIModelIds({
      models: [
        { name: `llama3` },
        { id: `qwen2.5` },
        `deepseek-chat`,
      ],
    })).toEqual([`llama3`, `qwen2.5`, `deepseek-chat`])
  })

  it(`returns an empty list for missing payloads`, () => {
    expect(parseOpenAIModelIds(null)).toEqual([])
    expect(parseOpenAIModelIds({})).toEqual([])
  })
})

describe(`filterDiscoveredModels`, () => {
  const catalog = [
    `gpt-4.1`,
    `gpt-4o`,
    `dall-e-3`,
    `gpt-image-1`,
    `gemini-2.5-flash-image`,
    `Kwai-Kolors/Kolors`,
    `whisper-1`,
    `text-embedding-3-small`,
    `kling-v2`,
  ]

  it(`keeps likely image models and drops chat-only names`, () => {
    expect(filterDiscoveredModels(catalog, `image`)).toEqual([
      `dall-e-3`,
      `gpt-image-1`,
      `gemini-2.5-flash-image`,
      `Kwai-Kolors/Kolors`,
    ])
  })

  it(`falls back to the original list when nothing looks like an image model`, () => {
    expect(filterDiscoveredModels([`my-custom-1`, `my-custom-2`], `image`))
      .toEqual([`my-custom-1`, `my-custom-2`])
  })

  it(`drops obvious non-chat models from chat discovery`, () => {
    expect(filterDiscoveredModels(catalog, `chat`)).toEqual([
      `gpt-4.1`,
      `gpt-4o`,
    ])
  })
})

describe(`mergeModelOptions`, () => {
  it(`deduplicates presets, discoveries, and the current value`, () => {
    expect(mergeModelOptions(
      [`gpt-4.1`, `gpt-4o`],
      [`gpt-4o`, `gpt-5.5`],
      `custom-model`,
    )).toEqual([`gpt-4.1`, `gpt-4o`, `gpt-5.5`, `custom-model`])
  })
})

describe(`formatDiscoverErrorDetail`, () => {
  it(`returns an empty string for blank bodies`, () => {
    expect(formatDiscoverErrorDetail(`  \n  `)).toBe(``)
  })

  it(`prefixes and truncates long error bodies`, () => {
    const detail = formatDiscoverErrorDetail(`x`.repeat(200), 20)
    expect(detail.startsWith(` `)).toBe(true)
    expect(detail.endsWith(`...`)).toBe(true)
    expect(detail.length).toBe(21)
  })
})
