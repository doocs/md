import type { I18n } from 'vue-i18n'
import type { AppLocale } from './types'
import { createI18n } from 'vue-i18n'
import { DEFAULT_LOCALE } from './constants'
import enUS from './messages/en-US/index'
import zhCN from './messages/zh-CN/index'

export function setupI18n(locale: AppLocale = DEFAULT_LOCALE): I18n {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    messages: {
      'zh-CN': zhCN,
      'en-US': enUS,
    },
  })
}

export type MessageSchema = typeof zhCN

declare module 'vue-i18n' {

  export interface DefineLocaleMessage extends MessageSchema {}
}

let appI18n: I18n | null = null

export function setAppI18n(instance: I18n) {
  appI18n = instance
}

export function getAppI18n(): I18n {
  if (!appI18n)
    throw new Error(`i18n is not initialized`)

  return appI18n
}
