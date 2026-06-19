import type { CollabStyleBundle } from './collab-types'

const MAX_STYLE_BYTES = 512 * 1024

export function defaultCollabStyleBundle(): CollabStyleBundle {
  return {
    version: 1,
    theme: `default`,
    themeSettings: {},
    layout: {
      useIndent: false,
      useJustify: false,
      isCiteStatus: false,
      isCountStatus: false,
      legend: ``,
      previewWidth: `max-w-[750px]`,
    },
    customCss: {
      activeTabId: `default`,
      tabs: [{ id: `default`, title: `默认`, content: `` }],
    },
    customComponents: [],
  }
}

export function parseCollabStyleBundle(raw: string | null | undefined): CollabStyleBundle | null {
  if (!raw?.trim())
    return null
  try {
    const parsed = JSON.parse(raw) as CollabStyleBundle
    if (parsed?.version !== 1 || typeof parsed.theme !== `string`)
      return null
    if (!parsed.themeSettings || typeof parsed.themeSettings !== `object`)
      return null
    if (!parsed.layout || typeof parsed.layout !== `object`)
      return null
    if (!parsed.customCss || !Array.isArray(parsed.customCss.tabs))
      return null
    return parsed
  }
  catch {
    return null
  }
}

export function validateCollabStyleBundle(input: unknown): { ok: true, style: CollabStyleBundle } | { ok: false, error: string } {
  if (!input || typeof input !== `object`)
    return { ok: false, error: `invalid_style` }

  const serialized = JSON.stringify(input)
  if (serialized.length > MAX_STYLE_BYTES)
    return { ok: false, error: `style_too_large` }

  const style = parseCollabStyleBundle(serialized)
  if (!style)
    return { ok: false, error: `invalid_style` }

  return { ok: true, style }
}

export { MAX_STYLE_BYTES }
