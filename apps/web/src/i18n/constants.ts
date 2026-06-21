import type { AppLocale, LocaleOption } from './types'

export const LOCALE_STORAGE_KEY = `locale`

export const DEFAULT_LOCALE: AppLocale = `zh-CN`

export const SUPPORTED_LOCALES: AppLocale[] = [`zh-CN`, `en-US`]

export const LOCALE_OPTIONS: LocaleOption[] = [
  { value: `zh-CN`, labelKey: `locale.zhCN` },
  { value: `en-US`, labelKey: `locale.enUS` },
]
