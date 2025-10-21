import { initializeMermaid } from '@md/core/utils'
import JsLiteRest from 'js-lite-rest'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { data } from '@/stores/defaultData'
import App from './App.vue'

import { setupComponents } from './utils/setup-components'

import 'vue-sonner/style.css'

/* 每个页面公共css */
import '@/assets/index.css'
import '@/assets/less/theme.less'

;

(async function () {
  const storex = await JsLiteRest.create({
    history: [],
    posts: data.posts,
  }, {
    savePath: `storex`,
  })
  storex.use(async (args: any, next: any) => {
    const restLog: any = {}
    if (args[2]) {
      // 统一处理 vue 包装的可能是响应式的特殊对象
      args[2] = JSON.parse(JSON.stringify(args[2]))
    }
    let result = await next(args)
    result = JSON.parse(JSON.stringify(result))
    restLog.args = args
    restLog.result = result
    console.debug(`restLog`, args.slice(0, 2).join(`/`), args[2], result.data)
    return result
  })
  window.storex = storex

  // 异步初始化 mermaid，避免初始化顺序问题
  initializeMermaid().catch(console.error)

  setupComponents()

  const app = createApp(App)

  app.use(createPinia())

  app.mount(`#app`)
})()
