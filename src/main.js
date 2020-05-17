import Vue from 'vue'
import App from './App.vue'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './element'
import 'codemirror/lib/codemirror.css';
import "codemirror/theme/ambiance.css";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/theme/xq-light.css";
import "./assets/less/theme.less";
Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
    store,
    render: h => h(App)
}).$mount('#app')
