import type { ConfigEnv } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'wxt'
import ViteConfig from './vite.config'

function getRootPackageVersion() {
  let dir = __dirname
  while (dir !== path.parse(dir).root) {
    const pkgPath = path.join(dir, `package.json`)
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, `utf-8`))
      if (pkg.version)
        return pkg.version
    }
    dir = path.dirname(dir)
  }
  return `0.0.0`
}

const version = getRootPackageVersion()

export default defineConfig({
  srcDir: `src`,
  modulesDir: `src/modules`,
  manifest: ({ mode, browser }) => ({
    name: `公众号内容编辑器`,
    version,
    icons: {
      256: mode === `development` ? `/mpmd/icon-256-gray.png` : `/mpmd/icon-256.png`,
    },
    permissions: [`storage`, `activeTab`, `sidePanel`, `contextMenus`],
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
    side_panel: browser === `chrome`
      ? {
          default_path: `sidepanel.html`,
        }
      : undefined,
    sidebar_action: browser === `firefox`
      ? {
          default_panel: `sidepanel.html`,
          default_icon: {
            256: `mpmd/icon-256.png`,
          },
          default_title: `MD 公众号编辑器`,
        }
      : undefined,
    commands: {
      _execute_sidebar_action: {
        description: `Open MD Editor Side Panel`,
        suggested_key: {
          default: `Ctrl+Shift+Y`,
        },
      },
    },
  }),
  zip: {
    excludeSources: [
      `dist/**`,
      `docker/**`,
      `docs/**`,
      `example/**`,
      `functions/**`,
      `md-cli/**`,
      `scripts/**`,
      `src/extension/**`,
    ],
  },
  analysis: {
    open: true,
  },
  vite: ({ mode }) => {
    const config = ViteConfig({ mode } as ConfigEnv)

    return {
      ...config,
      plugins: config.plugins!.filter((plugin) => {
        if (typeof plugin === `object` && plugin != null && `name` in plugin && plugin?.name === `vite-plugin-Radar`) {
          return false
        }
        return true
      }),
      define: undefined,
      build: undefined,
      base: `/`,
    }
  },
})
