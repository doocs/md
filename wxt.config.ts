import { defineConfig } from 'wxt'
import ViteConfig from './vite.config'

export default defineConfig({
  srcDir: `src`,
  publicDir: `../public`,
  extensionApi: `chrome`,
  manifest: {
    name: `公众号内容编辑器`,
    icons: {
      256: `/mpmd/icon-256.png`,
    },
    permissions: [`storage`],
    host_permissions: [
      `https://*.github.com/*`,
      `https://*.githubusercontent.com/*`,
      `https://*.gitee.com/*`,
      `https://*.weixin.qq.com/*`,
      // 微信公众号图片
      `https://*.qpic.cn/*`,
    ],
    web_accessible_resources: [
      {
        resources: [`*.png`, `*.svg`],
        matches: [`<all_urls>`],
      },
    ],
  },
  analysis: {
    open: true,
  },
  vite: () => ({
    ...ViteConfig,
    base: `/`,
  }),
})
