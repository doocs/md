import type { I18n } from 'vue-i18n'
import type { AppLocale } from './types'
import { createI18n } from 'vue-i18n'
import { DEFAULT_LOCALE } from './constants'
import zhCN from './messages/zh-CN/index'

type LocaleMessages = typeof zhCN
type LazyLocale = Exclude<AppLocale, `zh-CN`>

const localeLoaders: Record<LazyLocale, () => Promise<{ default: LocaleMessages }>> = {
  'zh-TW': () => import(`./messages/zh-TW/index`),
  'en-US': () => import(`./messages/en-US/index`),
  'ja-JP': () => import(`./messages/ja-JP/index`),
}

function isLazyLocale(locale: AppLocale): locale is LazyLocale {
  return locale !== `zh-CN`
}

const loadedLocales = new Set<AppLocale>([DEFAULT_LOCALE])
const loadingLocales = new Map<AppLocale, Promise<void>>()

/** Load locale messages into i18n (no-op if already loaded). */
export async function ensureLocaleMessages(i18n: I18n, locale: AppLocale): Promise<void> {
  if (loadedLocales.has(locale))
    return

  if (!isLazyLocale(locale)) {
    i18n.global.setLocaleMessage(DEFAULT_LOCALE, zhCN)
    loadedLocales.add(DEFAULT_LOCALE)
    return
  }

  const pending = loadingLocales.get(locale)
  if (pending) {
    await pending
    return
  }

  const loadPromise = (async () => {
    const { default: messages } = await localeLoaders[locale]()
    i18n.global.setLocaleMessage(locale, messages)
    loadedLocales.add(locale)
    loadingLocales.delete(locale)
  })()

  loadingLocales.set(locale, loadPromise)
  await loadPromise
}

export async function setupI18n(locale: AppLocale = DEFAULT_LOCALE): Promise<I18n> {
  const i18n = createI18n({
    legacy: false,
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    messages: {
      [DEFAULT_LOCALE]: zhCN,
    },
  })

  if (isLazyLocale(locale))
    await ensureLocaleMessages(i18n, locale)

  return i18n
}

export type MessageSchema = LocaleMessages

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
