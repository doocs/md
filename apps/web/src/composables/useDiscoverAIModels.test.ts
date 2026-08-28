import { describe, expect, it } from 'vitest'
import { canDiscoverAIModels } from './useDiscoverAIModels'

describe(`canDiscoverAIModels`, () => {
  it(`requires a non-default service, endpoint, and API key`, () => {
    expect(canDiscoverAIModels(`https://api.openai.com/v1`, `sk-test`, `openai`)).toBe(true)
    expect(canDiscoverAIModels(`https://api.openai.com/v1`, `sk-test`, `default`)).toBe(false)
    expect(canDiscoverAIModels(``, `sk-test`, `openai`)).toBe(false)
    expect(canDiscoverAIModels(`https://api.openai.com/v1`, ``, `openai`)).toBe(false)
    expect(canDiscoverAIModels(`not-a-url`, `sk-test`, `openai`)).toBe(false)
  })
})
