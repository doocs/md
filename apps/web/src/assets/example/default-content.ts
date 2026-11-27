import type { AppLocale } from '@/i18n/types'
import { DEFAULT_LOCALE } from '@/i18n/constants'
import { getLocale } from '@/i18n/translate'
import deDE from './markdown.de-DE.md?raw'
import enUS from './markdown.en-US.md?raw'
import esES from './markdown.es-ES.md?raw'
import frFR from './markdown.fr-FR.md?raw'
import jaJP from './markdown.ja-JP.md?raw'
import ptBR from './markdown.pt-BR.md?raw'
import ruRU from './markdown.ru-RU.md?raw'
import zhCN from './markdown.zh-CN.md?raw'
import zhTW from './markdown.zh-TW.md?raw'

const CONTENT_BY_LOCALE: Record<AppLocale, string> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
  'es-ES': esES,
  'fr-FR': frFR,
  'de-DE': deDE,
  'ru-RU': ruRU,
  'pt-BR': ptBR,
}

/** Default editor sample article for the given (or current) UI locale. */
export function getDefaultContent(locale: AppLocale = getLocale()): string {
  return CONTENT_BY_LOCALE[locale] ?? CONTENT_BY_LOCALE[DEFAULT_LOCALE]
}
