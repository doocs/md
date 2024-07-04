import { createApp } from 'vue'
import Store from './stores'
import ElementPlus from './element'
import App from './App.vue'

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/xq-light.css'

/* 每个页面公共css */
import './assets/less/theme.less'
import './assets/less/style-mirror.less'

import 'codemirror/mode/css/css'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/selection/active-line'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/css-hint'

const app = createApp(App)

app.use(Store)
app.use(ElementPlus)

app.mount('#app')
