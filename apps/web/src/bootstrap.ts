import { initComponentDarkVars } from '@md/core/theme'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { detectInitialLocale, normalizeLocale } from '@/i18n/detect'
import { setAppI18n, setupI18n } from '@/i18n/index'
import { initStorage } from '@/storage'
import { useLocaleStore } from '@/stores/locale'

import AppRoot from './App.vue'
import { scheduleInitialLoaderFallback } from './lib/bootstrap/dismiss-initial-loader'
import { setupComponents } from './lib/bootstrap/setup-components'

/** DSH embed posts this when its UI language changes. Same-origin only. */
const HOST_LOCALE_MESSAGE = `doocs-md:set-locale`

function installHostLocaleBridge() {
  window.addEventListener(`message`, (event) => {
    if (event.origin !== window.location.origin)
      return

    const data = event.data as { type?: string, locale?: string } | null
    if (!data || data.type !== HOST_LOCALE_MESSAGE || typeof data.locale !== `string`)
      return

    const next = normalizeLocale(data.locale)
    if (!next)
      return

    void useLocaleStore().setLocale(next)
  })
}

export async function bootstrap(): Promise<void> {
  initComponentDarkVars()
  setupComponents()
  await initStorage()

  const i18n = await setupI18n(detectInitialLocale())
  setAppI18n(i18n)

  const app = createApp(AppRoot)
  app.use(i18n)
  app.use(createPinia())
  useLocaleStore()
  installHostLocaleBridge()
  app.mount(`#app`)
  scheduleInitialLoaderFallback()
}
