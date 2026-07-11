import type { AppLocale } from '@/i18n/types'
import { DEFAULT_LOCALE } from '@/i18n/constants'
import { getLocale } from '@/i18n/translate'
import enUS from './markdown.en-US.md?raw'
import jaJP from './markdown.ja-JP.md?raw'
import zhCN from './markdown.zh-CN.md?raw'
import zhTW from './markdown.zh-TW.md?raw'

const CONTENT_BY_LOCALE: Record<AppLocale, string> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
}

/** Default editor sample article for the given (or current) UI locale. */
export function getDefaultContent(locale: AppLocale = getLocale()): string {
  return CONTENT_BY_LOCALE[locale] ?? CONTENT_BY_LOCALE[DEFAULT_LOCALE]
}
