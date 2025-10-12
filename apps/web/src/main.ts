import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { setupComponents } from './utils/setup-components'

import './userWorker'

import 'vue-sonner/style.css'

/* 每个页面公共css */
import '@/assets/index.css'
import '@/assets/less/theme.less'

setupComponents()

const app = createApp(App)

app.use(createPinia())

app.mount(`#app`)
