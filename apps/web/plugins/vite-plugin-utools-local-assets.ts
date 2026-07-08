import type { Plugin } from 'vite'
import { Buffer } from 'node:buffer'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  MATHJAX_BUNDLE_CDN_BASE,
  MATHJAX_CDN_URL,
  MATHJAX_FILE_LIST_URL,
  MATHJAX_LOCAL_URL,
} from '@md/core/utils/mathjax'

const DOWNLOAD_CONCURRENCY = 10

interface JsdelivrFile {
  name: string
}

function resolveSafeDestination(targetDir: string, relativePath: string): string {
  const destination = path.resolve(targetDir, relativePath)
  const resolvedTarget = path.resolve(targetDir)
  const isInsideTarget = destination === resolvedTarget
    || destination.startsWith(`${resolvedTarget}${path.sep}`)

  if (!isInsideTarget)
    throw new Error(`Unsafe MathJax path: ${relativePath}`)

  return destination
}

function isSafeRelativePath(relativePath: string): boolean {
  return relativePath.length > 0
    && !path.isAbsolute(relativePath)
    && !relativePath.split(/[/\\]/).includes(`..`)
}

async function listMathJaxEs5Files(): Promise<string[]> {
  const response = await fetch(MATHJAX_FILE_LIST_URL)
  if (!response.ok)
    throw new Error(`Failed to list MathJax files: ${response.status}`)

  const data = await response.json() as { files: JsdelivrFile[] }
  return data.files
    .map(file => file.name)
    .filter(name => name.startsWith(`/es5/`))
    .map(name => name.slice(`/es5/`.length))
    .filter(isSafeRelativePath)
}

async function downloadMathJaxEs5(targetDir: string) {
  const files = await listMathJaxEs5Files()
  await mkdir(targetDir, { recursive: true })

  for (let index = 0; index < files.length; index += DOWNLOAD_CONCURRENCY) {
    const batch = files.slice(index, index + DOWNLOAD_CONCURRENCY)
    await Promise.all(batch.map(async (relativePath) => {
      const url = `${MATHJAX_BUNDLE_CDN_BASE}/${relativePath}`
      const response = await fetch(url)
      if (!response.ok)
        throw new Error(`Failed to download ${url}: ${response.status}`)

      const destination = resolveSafeDestination(targetDir, relativePath)
      await mkdir(path.dirname(destination), { recursive: true })
      await writeFile(destination, Buffer.from(await response.arrayBuffer()))
    }))
  }
}

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

        return html.split(MATHJAX_CDN_URL).join(MATHJAX_LOCAL_URL)
      },
    },
    async closeBundle() {
      if (!isUTools)
        return

      const targetDir = path.join(outDir, `static`, `libs`, `mathjax`)
      await downloadMathJaxEs5(targetDir)
    },
  }
}
