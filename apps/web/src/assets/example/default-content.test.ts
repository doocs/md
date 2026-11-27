import { describe, expect, it } from 'vitest'
import { getDefaultContent } from './default-content'

describe(`getDefaultContent`, () => {
  it(`returns locale-specific sample articles`, () => {
    expect(getDefaultContent(`zh-CN`)).toContain(`探索 Markdown 的奇妙世界`)
    expect(getDefaultContent(`zh-TW`)).toContain(`探索 Markdown 的奇妙世界`)
    expect(getDefaultContent(`zh-TW`)).toContain(`歡迎來到`)
    expect(getDefaultContent(`en-US`)).toContain(`Explore the Wonderful World of Markdown`)
    expect(getDefaultContent(`ja-JP`)).toContain(`Markdown の不思議な世界を探検しよう`)
    expect(getDefaultContent(`es-ES`)).toContain(`Explora el maravilloso mundo de Markdown`)
    expect(getDefaultContent(`fr-FR`)).toContain(`Explorez le monde merveilleux de Markdown`)
    expect(getDefaultContent(`de-DE`)).toContain(`Entdecke die wunderbare Welt von Markdown`)
    expect(getDefaultContent(`ru-RU`)).toContain(`Исследуйте удивительный мир Markdown`)
    expect(getDefaultContent(`pt-BR`)).toContain(`Explore o maravilhoso mundo do Markdown`)
  })

  it(`keeps shared demo assets across locales`, () => {
    for (const locale of [`zh-CN`, `zh-TW`, `en-US`, `ja-JP`, `es-ES`, `fr-FR`, `de-DE`, `ru-RU`, `pt-BR`] as const) {
      const content = getDefaultContent(locale)
      expect(content).toContain(`\`\`\`mermaid`)
      expect(content).toContain(`\`\`\`plantuml`)
      expect(content).toContain(`\`\`\`infographic`)
      expect(content).toContain(`[TOC]`)
    }
  })
})
