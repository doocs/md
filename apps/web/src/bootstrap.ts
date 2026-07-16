import { initComponentDarkVars } from '@md/core'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { detectInitialLocale } from '@/i18n/detect'
import { setAppI18n, setupI18n } from '@/i18n/index'
import { initStorage } from '@/storage'
import { useLocaleStore } from '@/stores/locale'

import AppRoot from './App.vue'
import { scheduleInitialLoaderFallback } from './lib/bootstrap/dismiss-initial-loader'
import { setupComponents } from './lib/bootstrap/setup-components'

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
  app.mount(`#app`)
  scheduleInitialLoaderFallback()
}
