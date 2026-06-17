import { initComponentDarkVars } from '@md/core'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { initStorage } from '@/storage'

import AppRoot from './App.vue'
import { scheduleInitialLoaderFallback } from './lib/bootstrap/dismiss-initial-loader'
import { setupComponents } from './lib/bootstrap/setup-components'

export async function bootstrap(): Promise<void> {
  initComponentDarkVars()
  setupComponents()
  await initStorage()

  const app = createApp(AppRoot)
  app.use(createPinia())
  app.mount(`#app`)
  scheduleInitialLoaderFallback()
}
