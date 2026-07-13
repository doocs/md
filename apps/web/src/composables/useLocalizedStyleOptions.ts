import type { ThemeName } from '@md/shared/configs'
import type { IConfigOption } from '@md/shared/types'
import {
  codeBlockThemeOptions,
  colorOptions,
  fontFamilyOptions,
  fontSizeOptions,
  headingLevelOptions,
  headingStyleOptions,
  legendOptions,
  themeOptions,
} from '@md/shared/configs'
import { useMarketplaceStore } from '@/stores/marketplace'

type Translate = (key: string) => string

const FONT_FAMILY_KEYS = [`sansSerif`, `serif`, `monospace`] as const
const FONT_SIZE_DESC_KEYS = [`smaller`, `slightlySmaller`, `recommended`, `slightlyLarger`, `larger`] as const
const COLOR_KEYS = [
  `classicBlue`,
  `emeraldGreen`,
  `vividOrange`,
  `lemonYellow`,
  `lavenderPurple`,
  `skyBlue`,
  `roseGold`,
  `oliveGreen`,
  `graphiteBlack`,
  `mistGray`,
  `sakuraPink`,
] as const
const LEGEND_KEYS = [`titleAlt`, `altTitle`, `titleOnly`, `altOnly`, `filename`, `none`] as const
const HEADING_STYLE_VALUE_TO_KEY: Record<string, string> = {
  'default': `default`,
  'color-only': `colorOnly`,
  'border-bottom': `borderBottom`,
  'border-left': `borderLeft`,
  'custom': `custom`,
}

function localizeThemeOptions(t: Translate): IConfigOption<ThemeName>[] {
  return themeOptions.map((option) => {
    const desc = option.desc ? t(`styleOptions.theme.${option.value}.desc`) : option.desc
    return {
      ...option,
      label: t(`styleOptions.theme.${option.value}.label`),
      desc,
    }
  })
}

function localizeFontFamilyOptions(t: Translate): IConfigOption[] {
  return fontFamilyOptions.map((option, index) => ({
    ...option,
    label: t(`styleOptions.fontFamily.${FONT_FAMILY_KEYS[index]}.label`),
    desc: t(`styleOptions.fontFamily.${FONT_FAMILY_KEYS[index]}.desc`),
  }))
}

function localizeFontSizeOptions(t: Translate): IConfigOption[] {
  return fontSizeOptions.map((option, index) => ({
    ...option,
    desc: t(`styleOptions.fontSize.${FONT_SIZE_DESC_KEYS[index]}`),
  }))
}

function localizeColorOptions(t: Translate): IConfigOption[] {
  return colorOptions.map((option, index) => ({
    ...option,
    label: t(`styleOptions.color.${COLOR_KEYS[index]}.label`),
    desc: t(`styleOptions.color.${COLOR_KEYS[index]}.desc`),
  }))
}

function localizeHeadingLevelOptions(t: Translate): IConfigOption[] {
  return headingLevelOptions.map(option => ({
    ...option,
    label: t(`styleOptions.headingLevel.${option.value}`),
  }))
}

function localizeHeadingStyleOptions(t: Translate): IConfigOption[] {
  return headingStyleOptions.map((option) => {
    const key = HEADING_STYLE_VALUE_TO_KEY[option.value] ?? option.value
    return {
      ...option,
      label: t(`styleOptions.headingStyle.${key}`),
    }
  })
}

function localizeLegendOptions(t: Translate): IConfigOption[] {
  return legendOptions.map((option, index) => ({
    ...option,
    label: t(`styleOptions.legend.${LEGEND_KEYS[index]}`),
  }))
}

export function getThemeLabel(t: Translate, theme: ThemeName, fallback?: string): string {
  if (String(theme).startsWith(`mp:`))
    return fallback || String(theme)
  return t(`styleOptions.theme.${theme}.label`)
}

export function createLocalizedStyleOptions(
  t: Translate,
  installedThemeOptions: IConfigOption<ThemeName>[] = [],
) {
  const themeOptionsLocalized = [
    ...localizeThemeOptions(t),
    ...installedThemeOptions,
  ]

  return {
    themeOptions: themeOptionsLocalized,
    fontFamilyOptions: localizeFontFamilyOptions(t),
    fontSizeOptions: localizeFontSizeOptions(t),
    colorOptions: localizeColorOptions(t),
    codeBlockThemeOptions,
    headingLevelOptions: localizeHeadingLevelOptions(t),
    headingStyleOptions: localizeHeadingStyleOptions(t),
    legendOptions: localizeLegendOptions(t),
    getThemeLabel: (theme: ThemeName) => {
      const installed = installedThemeOptions.find(o => o.value === theme)
      return getThemeLabel(t, theme, installed?.label)
    },
  }
}

export function useLocalizedStyleOptions() {
  const { t, locale } = useI18n()
  const marketplaceStore = useMarketplaceStore()

  return computed(() => {
    void locale.value
    // Depend on installed themes map so options refresh after install/uninstall
    void marketplaceStore.installedThemes
    const installed = marketplaceStore.getInstalledThemeOptions() as IConfigOption<ThemeName>[]
    return createLocalizedStyleOptions(t, installed)
  })
}
