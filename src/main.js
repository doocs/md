import Vue from 'vue'
import App from './App'
// import store from './stores'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './plugins/element'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/xq-light.css'
import 'codemirror/mode/css/css'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/selection/active-line'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/css-hint.js'
import { createPinia, PiniaVuePlugin } from 'pinia'

Vue.use(ElementUI)

Vue.config.productionTip = false

App.mpType = `app`

// const pinia = createPinia()
Vue.use(PiniaVuePlugin)

const pinia = createPinia()

const app = new Vue({
  // store,
  pinia: pinia,
  ...App,
})

app.$mount(`#app`)
