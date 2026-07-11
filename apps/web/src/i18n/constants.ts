import type { AppLocale, LocaleOption } from './types'

export const LOCALE_STORAGE_KEY = `locale`

export const DEFAULT_LOCALE: AppLocale = `zh-CN`

/**
 * Fixed BCP 47 tag on editor/preview so system-font fallback stays stable when
 * `html[lang]` follows the UI locale. Use `und` (undetermined) instead of a
 * concrete locale so assistive tech is not told the wrong content language.
 */
export const CONTENT_FONT_LANG = `und` as const

export const SUPPORTED_LOCALES: AppLocale[] = [`zh-CN`, `zh-TW`, `en-US`, `ja-JP`]

export const LOCALE_OPTIONS: LocaleOption[] = [
  { value: `zh-CN`, labelKey: `locale.zhCN`, shortLabel: `简` },
  { value: `zh-TW`, labelKey: `locale.zhTW`, shortLabel: `繁` },
  { value: `en-US`, labelKey: `locale.enUS`, shortLabel: `EN` },
  { value: `ja-JP`, labelKey: `locale.jaJP`, shortLabel: `日` },
]

export function getNextLocale(current: AppLocale): AppLocale {
  const index = SUPPORTED_LOCALES.indexOf(current)
  const nextIndex = index < 0 ? 0 : (index + 1) % SUPPORTED_LOCALES.length
  return SUPPORTED_LOCALES[nextIndex]!
}

export function getLocaleOption(locale: AppLocale): LocaleOption {
  return LOCALE_OPTIONS.find(option => option.value === locale) ?? LOCALE_OPTIONS[0]!
}

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}
