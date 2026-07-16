import type { AppLocale } from '@/i18n/types'
import { getNextLocale, LOCALE_STORAGE_KEY } from '@/i18n/constants'
import { detectInitialLocale } from '@/i18n/detect'
import { ensureLocaleMessages, getAppI18n } from '@/i18n/index'
import { t } from '@/i18n/translate'
import { store } from '@/storage'

function syncDocumentLocale(locale: AppLocale) {
  document.documentElement.lang = locale
  document.title = t(`meta.title`)

  const description = document.querySelector(`meta[name="description"]`)
  if (description)
    description.setAttribute(`content`, t(`meta.description`))
}

/** Sync locale to localStorage for index.html splash before IndexedDB is ready. */
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

  async function setLocale(value: AppLocale) {
    await ensureLocaleMessages(getAppI18n(), value)
    locale.value = value
  }

  /** Cycle to the next locale in SUPPORTED_LOCALES order. */
  async function cycleLocale() {
    await setLocale(getNextLocale(locale.value))
  }

  return {
    locale,
    setLocale,
    cycleLocale,
  }
})
