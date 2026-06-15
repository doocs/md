import { initComponentDarkVars } from '@md/core'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { initStorage } from '@/storage'

import App from './App.vue'
import { setupComponents } from './utils/setup-components'

import 'vue-sonner/style.css'

/* 每个页面公共css */
import '@/assets/index.css'
import '@/assets/less/theme.less'

async function bootstrap() {
  initComponentDarkVars()
  setupComponents()
  await initStorage()

  const app = createApp(App)
  app.use(createPinia())
  app.mount(`#app`)
}

bootstrap()
