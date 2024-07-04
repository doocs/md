import { URL, fileURLToPath } from 'node:url'
import process from 'node:process'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === `production`

  return {
    base: process.env.VITE_SERVER_ENV === `NETLIFY` ? `/` : `/md/`, // 基本路径, 建议以绝对路径跟随访问目录
    define: {
      process,
    },
    plugins: [
      vue(),
      nodePolyfills({
        include: ['path', 'util', 'timers', 'stream', 'fs'],
        overrides: {
          // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
          // fs: 'memfs',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      devSourcemap: !isProd,
    },
    build: {
      sourcemap: !isProd,
    },
  }
})
