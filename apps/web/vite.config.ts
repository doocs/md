import path from 'node:path'
import process from 'node:process'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from 'vite-plugin-pwa'
import { VitePluginRadar } from 'vite-plugin-radar'
import vueDevTools from 'vite-plugin-vue-devtools'

const base = process.env.SERVER_ENV === `NETLIFY` ? `/` : `/md/`

export default defineConfig({
  base,
  define: { process },
  envPrefix: [`VITE_`, `CF_`],
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
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
      devOptions: {
        enabled: true,
      },
    }),
    nodePolyfills({
      include: [`path`, `util`, `timers`, `stream`, `fs`],
      overrides: {
        // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
        // fs: 'memfs',
      },
    }),
    VitePluginRadar({
      analytics: { id: `G-7NZL3PZ0NK` },
    }),
    process.env.ANALYZE === `true`
    && visualizer({ emitFile: true, filename: `stats.html` }),
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
            if (id.includes(`katex`))
              return `katex`
            if (id.includes(`mermaid`))
              return `mermaid`
            if (id.includes(`highlight.js`))
              return `hljs`
            const pkg = id
              .split(`node_modules/`)[1]
              .split(`/`)[0]
              .replace(`@`, `npm_`)
            return `vendor_${pkg}`
          }
        },
      },
    },
  },
})
