export type AppLocale = `zh-CN` | `zh-TW` | `en-US` | `ja-JP` | `es-ES` | `fr-FR` | `de-DE` | `ru-RU` | `pt-BR`

export interface LocaleOption {
  value: AppLocale
  labelKey: `locale.zhCN` | `locale.zhTW` | `locale.enUS` | `locale.jaJP` | `locale.esES` | `locale.frFR` | `locale.deDE` | `locale.ruRU` | `locale.ptBR`
  shortLabel: string
}
