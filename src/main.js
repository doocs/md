import Vue from 'vue'
import ElementUI from 'element-ui'
import { createPinia, PiniaVuePlugin } from 'pinia'

import 'element-ui/lib/theme-chalk/index.css'

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

import './plugins/element'
import App from './App'

Vue.use(ElementUI).use(PiniaVuePlugin)

Vue.config.productionTip = false

App.mpType = `app`

new Vue({
  ...App,
  pinia: createPinia(),
}).$mount(`#app`)
