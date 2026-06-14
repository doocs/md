import { initComponentDarkVars } from '@md/core'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

import { setupComponents } from './utils/setup-components'

import 'vue-sonner/style.css'

/* 每个页面公共css */
import '@/assets/index.css'
import '@/assets/less/theme.less'

// 注入组件暗色模式 CSS 变量（独立样式元素，不污染剪贴板）
initComponentDarkVars()

setupComponents()

const app = createApp(App)

app.use(createPinia())

app.mount(`#app`)
