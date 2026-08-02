import type { Plugin } from 'vite'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import { VitePluginRadar } from 'vite-plugin-radar'
import vueDevTools from 'vite-plugin-vue-devtools'

import { utoolsLocalAssetsPlugin } from './plugins/vite-plugin-utools-local-assets.ts'

const isNetlify = process.env.SERVER_ENV === `NETLIFY`
const isUTools = process.env.SERVER_ENV === `UTOOLS`
const isCfWorkers = process.env.CF_WORKERS === `1`
const isCfPages = process.env.CF_PAGES === `1`

const base = isNetlify || isCfWorkers || isCfPages ? `/` : isUTools ? `./` : `/md/`

const cloudflarePlugin = isCfWorkers
  ? (await import(`@cloudflare/vite-plugin`)).cloudflare()
  : undefined

/**
 * Only force-split heavy / cache-friendly libs.
 * Do NOT assign every node_modules package to its own chunk — that can pull shared
 * runtime helpers (e.g. __vitePreload) into large optional vendors like @aws-sdk,
 * forcing them onto the critical path.
 */
function manualChunks(id: string): string | undefined {
  if (!id.includes(`node_modules`))
    return

  // Fence language packs stay lazy via dynamic import() in codeLanguages.ts
  if (id.includes(`@codemirror/lang-`) && !id.includes(`@codemirror/lang-markdown`))
    return

  // Core CodeMirror stack; keep together for caching.
  // Only core @lezer packages belong here — language grammars (@lezer/cpp,
  // @lezer/python, …) must follow their lazy LanguageDescription.load() chunks.
  if (id.includes(`codemirror`))
    return `codemirror`
  if (/[\\/]@lezer[\\/](?:common|lr|highlight|markdown|html)[\\/]/.test(id))
    return `codemirror`

  // prettier / highlight are large and already loaded via dedicated entry points
  if (id.includes(`prettier`))
    return `prettier`
  // Match the package root only: `*-highlight.js` files (e.g. @antv/infographic's
  // select-highlight.js) would otherwise drag their dep subgraph onto the entry.
  if (/[\\/]node_modules[\\/]highlight\.js[\\/]/.test(id))
    return `highlight`

  // Do not force-chunk mermaid / katex / aws-sdk / etc.
  // Dynamic import() already creates async chunks; naming them here can suck
  // shared helpers into those vendors and pull them onto the critical path.

  // Vue core ecosystem together to avoid circular chunk dependencies
  if (
    id.includes(`/@vue/`)
    || id.includes(`/@vue+`)
    || id.includes(`/node_modules/vue/`)
    || id.includes(`/node_modules/pinia/`)
    || id.includes(`\\node_modules\\vue\\`)
    || id.includes(`\\node_modules\\pinia\\`)
  ) {
    return `vendor_vue`
  }

  if (id.includes(`@vueuse`))
    return `vendor_vueuse`
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base,
    envPrefix: [`VITE_`, `CF_`],
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: tag => tag === `math-field`,
          },
        },
      }),
      isCfWorkers && cloudflarePlugin,
      tailwindcss(),
      mode === `development` && env.VITE_VUE_DEVTOOLS === `true` && vueDevTools({
        launchEditor: env.VITE_LAUNCH_EDITOR ?? `code`,
      }),
      !isUTools && VitePluginRadar({
        analytics: { id: `G-7NZL3PZ0NK` },
      }),
      ...(process.env.ANALYZE === `true`
        ? [visualizer({ emitFile: true, filename: `stats.html` }) as Plugin]
        : []),
      AutoImport({
        imports: [`vue`, `pinia`, `@vueuse/core`, `vue-i18n`],
        dirs: [`./src/stores`, `./src/lib/toast`, `./src/composables`],
      }),
      Components({
        resolvers: [],
      }),
      isUTools && utoolsLocalAssetsPlugin(),
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL(`./src`, import.meta.url)) },
      dedupe: [`@codemirror/state`, `@codemirror/view`],
    },
    css: { devSourcemap: true },
    build: {
      rolldownOptions: {
        onwarn(warning, warn) {
          // @vueuse/core /* #__PURE__ */ placement triggers INVALID_ANNOTATION; ignore
          if (warning.code === `INVALID_ANNOTATION` && warning.message?.includes(`@vueuse/core`))
            return
          warn(warning)
        },
        output: {
          chunkFileNames: `static/js/md-[name]-[hash].js`,
          entryFileNames: `static/js/md-[name]-[hash].js`,
          assetFileNames: `static/[ext]/md-[name]-[hash].[ext]`,
          manualChunks,
        },
      },
      // Mermaid is lazy-loaded (~2.15 MB minified); keep limit above that chunk
      chunkSizeWarningLimit: 2500,
    },
  }
})
