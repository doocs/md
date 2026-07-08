import type { Plugin } from 'vite'
import { Buffer } from 'node:buffer'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { MATHJAX_CDN_URL, MATHJAX_LOCAL_URL } from '@md/core/utils/mathjax'

async function downloadMathJaxTexSvg(targetDir: string) {
  const response = await fetch(MATHJAX_CDN_URL)
  if (!response.ok)
    throw new Error(`Failed to download MathJax: ${response.status}`)

  await mkdir(targetDir, { recursive: true })
  await writeFile(
    path.join(targetDir, `tex-svg.js`),
    Buffer.from(await response.arrayBuffer()),
  )
}

/**
 * Vite 插件：在 uTools 构建时将 MathJax 从 doocs CDN 下载为本地资源
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

        return html.split(MATHJAX_CDN_URL).join(MATHJAX_LOCAL_URL)
      },
    },
    async closeBundle() {
      if (!isUTools)
        return

      const targetDir = path.join(outDir, `static`, `libs`, `mathjax`)
      await downloadMathJaxTexSvg(targetDir)
    },
  }
}
