import path from 'node:path'
import process from 'node:process'

import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from 'vite-plugin-pwa'
import { VitePluginRadar } from 'vite-plugin-radar'
import vueDevTools from 'vite-plugin-vue-devtools'

const isUTools = process.env.SERVER_ENV === `UTOOLS`
const isCfWorkers = process.env.CF_PAGES === `1`
const base
  = process.env.SERVER_ENV === `NETLIFY` || isCfWorkers
    ? `/`
    : isUTools
      ? `./`
      : `/md/`

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base,
    define: { process },
    envPrefix: [`VITE_`, `CF_`],
    plugins: [
      vue(),
      isCfWorkers && cloudflare(),
      tailwindcss(),
      vueDevTools({
        launchEditor: env.VITE_LAUNCH_EDITOR ?? `code`,
      }),
      ...(!isUTools
        ? [
            VitePWA({
              registerType: `autoUpdate`,
              includeAssets: [`favicon.ico`],
              manifest: {
                name: `@doocs-md`,
                short_name: `@doocs-md`,
                theme_color: `#ffffff`,
                icons: [
                  {
                    src: `${base}pwa-192x192.png`,
                    sizes: `192x192`,
                    type: `image/png`,
                  },
                  {
                    src: `${base}pwa-512x512.png`,
                    sizes: `512x512`,
                    type: `image/png`,
                  },
                  {
                    src: `${base}pwa-512x512.png`,
                    sizes: `512x512`,
                    type: `image/png`,
                    purpose: `any maskable`,
                  },
                ],
              },
              workbox: {
                maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
              },
              devOptions: {
                enabled: true,
              },
            }),
          ]
        : []),
      !isCfWorkers && nodePolyfills({
        include: [`path`, `util`, `timers`, `stream`, `fs`],
        overrides: {
        // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
        // fs: 'memfs',
        },
      }),
      VitePluginRadar({
        analytics: { id: `G-7NZL3PZ0NK` },
      }),
      ...(process.env.ANALYZE === `true` ? [visualizer({ emitFile: true, filename: `stats.html` }) as any] : []),
      AutoImport({
        imports: [`vue`, `pinia`, `@vueuse/core`],
        dirs: [`./src/stores`, `./src/utils/toast`, `./src/composables`],
      }),
      Components({
        resolvers: [],
      }),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, `./src`) },
    },
    css: { devSourcemap: true },
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: `static/js/md-[name]-[hash].js`,
          entryFileNames: `static/js/md-[name]-[hash].js`,
          assetFileNames: `static/[ext]/md-[name]-[hash].[ext]`,
          manualChunks(id) {
            if (id.includes(`node_modules`)) {
              // 大型库单独分包
              if (id.includes(`katex`))
                return `katex`
              if (id.includes(`mermaid`))
                return `mermaid`
              if (id.includes(`highlight.js`))
                return `hljs`

              // 图片处理库分包
              if (id.includes(`browser-image-compression`) || id.includes(`html-to-image`))
                return `image-tools`

              // Vue 生态系统
              if (id.includes(`vue`) && !id.includes(`@vue`))
                return `vue-core`
              if (id.includes(`@vue`) || id.includes(`pinia`) || id.includes(`@vueuse`))
                return `vue-ecosystem`

              // UI 组件库
              if (id.includes(`radix-vue`) || id.includes(`reka-ui`))
                return `ui-components`
              if (id.includes(`lucide`))
                return `icons`

              // Markdown 处理相关
              if (id.includes(`marked`) || id.includes(`remark`) || id.includes(`unified`))
                return `markdown-tools`

              // 加密和工具库
              if (id.includes(`crypto-js`) || id.includes(`buffer`))
                return `crypto-utils`
              if (id.includes(`es-toolkit`) || id.includes(`lodash`))
                return `utils`

              // 表单和验证
              if (id.includes(`vee-validate`) || id.includes(`yup`))
                return `form-validation`

              // 网络请求
              if (id.includes(`axios`) || id.includes(`fetch`))
                return `http-client`

              // 默认vendor分包 - 更细粒度控制
              const pkg = id
                .split(`node_modules/`)[1]
                .split(`/`)[0]
                .replace(`@`, `npm_`)

              // 根据包的大小进行分组
              const smallPackages = [`clsx`, `uuid`, `buffer-from`, `csstype`, `class-variance-authority`]
              if (smallPackages.some(p => pkg.includes(p))) {
                return `vendor_small`
              }

              // 大包特殊处理
              const largePackages = [`codemirror`, `tailwindcss`]
              if (largePackages.some(p => pkg.includes(p))) {
                return `vendor_large_${pkg}`
              }

              return `vendor_${pkg}`
            }
          },
        },
      },

      // 高级压缩配置
      minify: `terser`,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: [`console.log`, `console.info`, `console.debug`],
          unused: true,
          inline: 2,
        },
        mangle: {
          keep_classnames: false,
          keep_fnames: false,
        },
        format: {
          comments: false,
        },
      },
      chunkSizeWarningLimit: 800,
      cssCodeSplit: true,
    },
  }
})
