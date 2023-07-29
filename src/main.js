import Vue from 'vue'
import App from './App'
import store from './store'
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

Vue.use(ElementUI)

Vue.config.productionTip = false

App.mpType = `app`

const app = new Vue({
  store,
  ...App,
})
app.$mount(`#app`)
