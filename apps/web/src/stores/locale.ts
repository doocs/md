import type { AppLocale } from '@/i18n/types'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from '@/i18n/constants'
import { detectInitialLocale } from '@/i18n/detect'
import { getAppI18n } from '@/i18n/index'
import enUS from '@/i18n/messages/en-US'
import zhCN from '@/i18n/messages/zh-CN'
import { store } from '@/storage'

const META_BY_LOCALE = {
  'zh-CN': zhCN.meta,
  'en-US': enUS.meta,
} as const

function syncDocumentLocale(locale: AppLocale) {
  document.documentElement.lang = locale

  const meta = META_BY_LOCALE[locale]
  document.title = meta.title

  const description = document.querySelector(`meta[name="description"]`)
  if (description)
    description.setAttribute(`content`, meta.description)
}

/** 供 index.html 启动屏在 IndexedDB 就绪前同步读取 */
function syncLocaleBootCache(locale: AppLocale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }
  catch {
    // ignore quota / private mode
  }
}

function setI18nLocale(value: AppLocale) {
  const i18n = getAppI18n()
  if (typeof i18n.global.locale === `string`)
    i18n.global.locale = value
  else
    i18n.global.locale.value = value
}

function getI18nLocale(): AppLocale {
  const current = getAppI18n().global.locale
  return (typeof current === `string` ? current : current.value) as AppLocale
}

export const useLocaleStore = defineStore(`locale`, () => {
  const locale = store.reactive<AppLocale>(LOCALE_STORAGE_KEY, detectInitialLocale())

  watch(
    locale,
    (value) => {
      setI18nLocale(value)
      syncDocumentLocale(value)
      syncLocaleBootCache(value)
    },
    { immediate: true },
  )

  function setLocale(value: AppLocale) {
    locale.value = value
  }

  return {
    locale,
    setLocale,
  }
})

export function initLocaleStore() {
  syncDocumentLocale(getI18nLocale() || DEFAULT_LOCALE)
}
