import Vue from 'vue'
import { Loading, Message } from 'element-ui'

Vue.component(Message.name, Message)

Vue.prototype.$loading = Loading.service
Vue.prototype.$message = Message
