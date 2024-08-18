import path from 'node:path'
import process from 'node:process'

import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === `production`

  return {
    base: process.env.SERVER_ENV === `NETLIFY` ? `/` : `/md/`, // 基本路径, 建议以绝对路径跟随访问目录
    define: {
      process,
    },
    plugins: [
      vue(),
      UnoCSS(),
      nodePolyfills({
        include: [`path`, `util`, `timers`, `stream`, `fs`],
        overrides: {
          // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
          // fs: 'memfs',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, `./src`),
      },
    },
    css: {
      devSourcemap: !isProd,
      postcss: {
        plugins: [tailwind(), autoprefixer()],
      },
    },
    build: {
      sourcemap: !isProd,
    },
  }
})
