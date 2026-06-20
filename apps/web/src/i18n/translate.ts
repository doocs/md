import type { AppLocale } from './types'
import { getAppI18n } from './index'

type TranslateFn = (key: string, params?: Record<string, unknown>) => string

export function t(key: string, params?: Record<string, unknown>): string {
  const translate = getAppI18n().global.t as TranslateFn
  return translate(key, params ?? {})
}

export function getLocale(): AppLocale {
  const current = getAppI18n().global.locale
  return (typeof current === `string` ? current : current.value) as AppLocale
}
