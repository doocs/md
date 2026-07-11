export type AppLocale = `zh-CN` | `zh-TW` | `en-US` | `ja-JP`

export interface LocaleOption {
  value: AppLocale
  labelKey: `locale.zhCN` | `locale.zhTW` | `locale.enUS` | `locale.jaJP`
  shortLabel: string
}
