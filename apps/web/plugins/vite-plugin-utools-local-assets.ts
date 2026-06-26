import type { Plugin } from 'vite'
import { cp } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'

const require = createRequire(import.meta.url)

const MATHJAX_CDN_URL = `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/mathjax@3/es5/tex-svg.js`
const MATHJAX_LOCAL_URL = `./static/libs/mathjax/tex-svg.js`

/**
 * Vite 插件：在 uTools 构建时将远程资源替换为本地资源
 */
export function utoolsLocalAssetsPlugin(): Plugin {
  const isUTools = process.env.SERVER_ENV === `UTOOLS`
  let outDir = ``

  return {
    name: `vite-plugin-utools-local-assets`,
    apply: `build`,
    configResolved(config) {
      outDir = config.build.outDir
    },
    transformIndexHtml: {
      order: `post`,
      handler(html) {
        if (!isUTools)
          return html

        return html.replaceAll(MATHJAX_CDN_URL, MATHJAX_LOCAL_URL)
      },
    },
    async closeBundle() {
      if (!isUTools)
        return

      const mathjaxRoot = path.dirname(require.resolve(`mathjax/package.json`))
      const mathjaxEs5 = path.join(mathjaxRoot, `es5`)
      const targetDir = path.join(outDir, `static`, `libs`, `mathjax`)

      await cp(mathjaxEs5, targetDir, { recursive: true })
    },
  }
}
