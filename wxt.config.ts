import { defineConfig } from 'wxt'
import ViteConfig from './vite.config'

export default defineConfig({
  srcDir: `src`,
  modulesDir: `src/modules`,
  manifest: ({ mode }) => ({
    name: `公众号内容编辑器`,
    icons: {
      256: mode === `development` ? `/mpmd/icon-256-gray.png` : `/mpmd/icon-256.png`,
    },
    permissions: [`storage`, `tabs`, `activeTab`, `sidePanel`, `contextMenus`],
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
        resources: [`*.png`, `*.svg`, `injected.js`],
        matches: [`<all_urls>`],
      },
    ],
  }),
  analysis: {
    open: true,
  },
  vite: () => ({
    ...ViteConfig,
    plugins: ViteConfig.plugins!.filter(plugin =>
      typeof plugin === `object`
      && plugin !== null
      && !(`name` in plugin && plugin.name === `vite-plugin-Radar`),
    ),
    base: `/`,
  }),
})
