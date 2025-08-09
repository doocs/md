import { createApp } from 'vue'
import App from './App.vue'

import 'virtual:uno.css'

/* 每个页面公共css */
import '@/assets/index.css'
import '@/assets/less/theme.less'

createApp(App).mount(`#app`)
