export type AppLocale = `zh-CN` | `en-US`

export interface LocaleOption {
  value: AppLocale
  labelKey: `locale.zhCN` | `locale.enUS`
  shortLabel: string
}
