import { initComponentDarkVars } from '@md/core'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { initStorage } from '@/storage'

import AppRoot from './App.vue'
import { setupComponents } from './utils/setup-components'

export async function bootstrap(): Promise<void> {
  initComponentDarkVars()
  setupComponents()
  await initStorage()

  const app = createApp(AppRoot)
  app.use(createPinia())
  app.mount(`#app`)
}
