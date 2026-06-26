import { describe, expect, it } from 'vitest'
import {
  DIAGRAM_DARK_COLORS,
  DIAGRAM_LIGHT_COLORS,
  getMermaidThemeConfig,
  injectPlantUmlTheme,
  resolveDiagramThemeMode,
} from './diagram-theme'

describe(`diagram-theme`, () => {
  it(`resolves theme mode with light fallback`, () => {
    expect(resolveDiagramThemeMode(undefined)).toBe(`light`)
    expect(resolveDiagramThemeMode(`light`)).toBe(`light`)
    expect(resolveDiagramThemeMode(`dark`)).toBe(`dark`)
  })

  it(`injects light skinparams into plantuml`, () => {
    const result = injectPlantUmlTheme(`A -> B`, `light`)
    expect(result).toContain(`@startuml`)
    expect(result).toContain(`skinparam backgroundColor ${DIAGRAM_LIGHT_COLORS.background}`)
    expect(result).toContain(`skinparam defaultFontColor ${DIAGRAM_LIGHT_COLORS.text}`)
  })

  it(`injects dark skinparams into plantuml`, () => {
    const result = injectPlantUmlTheme(`@startuml\nAlice -> Bob\n@enduml`, `dark`)
    expect(result).toContain(`skinparam backgroundColor ${DIAGRAM_DARK_COLORS.background}`)
    expect(result).toContain(`skinparam defaultFontColor ${DIAGRAM_DARK_COLORS.text}`)
  })

  it(`does not duplicate skinparams when already present`, () => {
    const once = injectPlantUmlTheme(`A -> B`, `dark`)
    const twice = injectPlantUmlTheme(once, `dark`)
    expect(twice.match(/skinparam backgroundColor/g)?.length).toBe(1)
  })

  it(`returns mermaid dark theme config`, () => {
    expect(getMermaidThemeConfig(`dark`)).toMatchObject({
      theme: `dark`,
      themeVariables: { darkMode: true },
    })
    expect(getMermaidThemeConfig(`light`)).toMatchObject({
      theme: `default`,
      themeVariables: { darkMode: false },
    })
  })
})
