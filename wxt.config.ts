import { defineConfig } from 'wxt'
import ViteConfig from './vite.config'

export default defineConfig({
  srcDir: `src`,
  publicDir: `../public`,
  extensionApi: `chrome`,
  manifest: {
    name: `公众号内容编辑器`,
    description: `一款高度简洁的微信 Markdown 编辑器：支持 Markdown 语法、色盘取色、多图上传、一键下载文档、自定义 CSS 样式、一键重置、微信公众号图床等特性`,
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
