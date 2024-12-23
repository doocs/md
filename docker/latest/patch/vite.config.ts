import path from 'node:path'
import process from 'node:process'

import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  base: `/`, // 基本路径, 建议以绝对路径跟随访问目录
  define: {
    process,
  },
  plugins: [
    vue(),
    UnoCSS(),
    vueDevTools(),
    nodePolyfills({
      include: [`path`, `util`, `timers`, `stream`, `fs`],
      overrides: {
        // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
        // fs: 'memfs',
      },
    }),
    process.env.ANALYZE === `true` && visualizer({
      emitFile: true,
      filename: `stats.html`,
    }),
    AutoImport({
      imports: [
        `vue`,
        `pinia`,
        `@vueuse/core`,
      ],
      dirs: [
        `./src/stores`,
        `./src/utils/toast`,
      ],
    }),
    Components({
      resolvers: [],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, `./src`),
    },
  },
  css: {
    devSourcemap: true,
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: `static/js/md-[name]-[hash].js`,
        entryFileNames: `static/js/md-[name]-[hash].js`,
        assetFileNames: `static/[ext]/md-[name]-[hash].[ext]`,
      },
    },
  },
})
