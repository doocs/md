import enUS from './default-custom-theme.en-US.txt?raw'
import jaJP from './default-custom-theme.ja-JP.txt?raw'
import zhCN from './default-custom-theme.zh-CN.txt?raw'
import zhTW from './default-custom-theme.zh-TW.txt?raw'

export type CustomThemeLocale = `zh-CN` | `zh-TW` | `en-US` | `ja-JP`

const DEFAULT_CUSTOM_THEME_BY_LOCALE: Record<CustomThemeLocale, string> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
}

/** English skeleton; prefer getDefaultCustomTheme(locale) for locale-aware defaults. */
export const DEFAULT_CUSTOM_THEME = enUS

/** Default custom CSS skeleton for the given UI locale. */
export function getDefaultCustomTheme(locale: string = `zh-CN`): string {
  return DEFAULT_CUSTOM_THEME_BY_LOCALE[locale as CustomThemeLocale]
    ?? DEFAULT_CUSTOM_THEME_BY_LOCALE[`zh-CN`]
}
