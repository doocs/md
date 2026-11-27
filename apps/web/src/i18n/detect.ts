import type { AppLocale } from './types'
import { store } from '@/storage'
import { DEFAULT_LOCALE, isAppLocale, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from './constants'

export function normalizeLocale(value: string | null | undefined): AppLocale | null {
  if (!value)
    return null

  if (isAppLocale(value))
    return value

  const lower = value.toLowerCase()

  if (lower === `zh-tw` || lower === `zh-hk` || lower === `zh-mo` || lower.startsWith(`zh-hant`))
    return `zh-TW`

  if (lower.startsWith(`zh`))
    return `zh-CN`

  if (lower.startsWith(`ja`))
    return `ja-JP`

  if (lower.startsWith(`es`))
    return `es-ES`

  if (lower.startsWith(`fr`))
    return `fr-FR`

  if (lower.startsWith(`de`))
    return `de-DE`

  if (lower.startsWith(`ru`))
    return `ru-RU`

  if (lower.startsWith(`pt`))
    return `pt-BR`

  if (lower.startsWith(`en`))
    return `en-US`

  return null
}

function detectFromNavigator(): AppLocale | null {
  if (typeof navigator === `undefined`)
    return null

  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language]

  for (const language of languages) {
    const normalized = normalizeLocale(language)
    if (normalized)
      return normalized
  }

  return null
}

/** Explicit `?locale=` from the host (the DSH embed). Wins over the saved preference. */
export function localeFromQuery(): AppLocale | null {
  if (typeof window === `undefined`)
    return null

  try {
    return normalizeLocale(new URLSearchParams(window.location.search).get(`locale`))
  }
  catch {
    return null
  }
}

export function detectInitialLocale(): AppLocale {
  const fromQuery = localeFromQuery()
  if (fromQuery && SUPPORTED_LOCALES.includes(fromQuery))
    return fromQuery

  const stored = store.getSync(LOCALE_STORAGE_KEY)
  const fromStorage = normalizeLocale(stored)
  if (fromStorage && SUPPORTED_LOCALES.includes(fromStorage))
    return fromStorage

  if (typeof window !== `undefined`) {
    const bootLocale = normalizeLocale(
      (window as Window & { __MD_BOOT_LOCALE__?: string }).__MD_BOOT_LOCALE__,
    )
    if (bootLocale && SUPPORTED_LOCALES.includes(bootLocale))
      return bootLocale
  }

  return detectFromNavigator() ?? DEFAULT_LOCALE
}
