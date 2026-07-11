import type { AppLocale, LocaleOption } from './types'

export const LOCALE_STORAGE_KEY = `locale`

export const DEFAULT_LOCALE: AppLocale = `zh-CN`

export const SUPPORTED_LOCALES: AppLocale[] = [`zh-CN`, `en-US`]

export const LOCALE_OPTIONS: LocaleOption[] = [
  { value: `zh-CN`, labelKey: `locale.zhCN`, shortLabel: `中` },
  { value: `en-US`, labelKey: `locale.enUS`, shortLabel: `EN` },
]

export function getNextLocale(current: AppLocale): AppLocale {
  const index = SUPPORTED_LOCALES.indexOf(current)
  const nextIndex = index < 0 ? 0 : (index + 1) % SUPPORTED_LOCALES.length
  return SUPPORTED_LOCALES[nextIndex]!
}

export function getLocaleOption(locale: AppLocale): LocaleOption {
  return LOCALE_OPTIONS.find(option => option.value === locale) ?? LOCALE_OPTIONS[0]!
}
