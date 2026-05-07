import path from 'node:path'
import process from 'node:process'

import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import { VitePluginRadar } from 'vite-plugin-radar'
import vueDevTools from 'vite-plugin-vue-devtools'

import { utoolsLocalAssetsPlugin } from './plugins/vite-plugin-utools-local-assets'

const isNetlify = process.env.SERVER_ENV === `NETLIFY`
const isUTools = process.env.SERVER_ENV === `UTOOLS`
const isCfWorkers = process.env.CF_WORKERS === `1`
const isCfPages = process.env.CF_PAGES === `1`

const base = isNetlify || isCfWorkers || isCfPages ? `/` : isUTools ? `./` : `/md/`

const PKG_NAME_SPECIAL_CHARS = /[^\w-]/g

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base,
    define: { 'process.env': {} },
    envPrefix: [`VITE_`, `CF_`],
    plugins: [
      vue(),
      isCfWorkers && cloudflare(),
      tailwindcss(),
      vueDevTools({
        launchEditor: env.VITE_LAUNCH_EDITOR ?? `code`,
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
      isUTools && utoolsLocalAssetsPlugin(),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, `./src`) },
      dedupe: [`@codemirror/state`, `@codemirror/view`],
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
              // @lezer/* are CodeMirror's parser primitives, keep together
              if (id.includes(`codemirror`) || id.includes(`@lezer`))
                return `codemirror`
              if (id.includes(`katex`))
                return `katex`
              if (id.includes(`prettier`))
                return `prettier`
              if (id.includes(`highlight.js`))
                return `highlight`

              // Handle pnpm virtual store (symlink-resolved paths contain /.pnpm/)
              if (id.includes(`/.pnpm/`)) {
                // Group Vue core ecosystem together to avoid circular chunk dependencies
                if (
                  id.includes(`/@vue/`)
                  || id.includes(`/@vue+`)
                  || id.includes(`/node_modules/vue/`)
                  || id.includes(`/node_modules/pinia/`)
                ) {
                  return `vendor_vue`
                }
                if (id.includes(`/@vueuse+`) || id.includes(`/@vueuse/`))
                  return `vendor_vueuse`

                // Extract actual package name from the real package path within .pnpm store
                // Format: .pnpm/<outer>@version/node_modules/<actual-pkg>/...
                const nmIndex = id.lastIndexOf(`/node_modules/`)
                if (nmIndex !== -1) {
                  const afterNm = id.slice(nmIndex + `/node_modules/`.length)
                  const parts = afterNm.split(`/`)
                  const pkgName = afterNm.startsWith(`@`)
                    ? `${parts[0].slice(1)}_${parts[1]}`
                    : parts[0]
                  return `vendor_${pkgName.replace(PKG_NAME_SPECIAL_CHARS, `_`)}`
                }
                return
              }

              // Handle regular (non-pnpm) node_modules paths
              const pkg = id
                .split(`node_modules/`)[1]
                .split(`/`)[0]
                .replace(`@`, `npm_`)
              return `vendor_${pkg}`
            }
          },
        },
      },
      chunkSizeWarningLimit: 1700,
    },
  }
})
