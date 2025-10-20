#!/usr/bin/env node
/**
 * 下载 uTools 插件所需的本地资源
 * 用于替代 CDN 加载的远程资源
 */
import { createWriteStream, existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { get as httpsGet } from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, `..`)
const libsDir = path.join(rootDir, `apps`, `web`, `public`, `static`, `libs`)

const resources = [
  {
    name: `MathJax`,
    url: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/mathjax@3/es5/tex-svg.js`,
    output: path.join(libsDir, `mathjax`, `tex-svg.js`),
  },
  {
    name: `Mermaid`,
    url: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/mermaid@11/dist/mermaid.min.js`,
    output: path.join(libsDir, `mermaid`, `mermaid.min.js`),
  },
  {
    name: `WeChat Sync`,
    url: `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/gh/wechatsync/article-syncjs@latest/dist/main.js`,
    output: path.join(libsDir, `article-syncjs`, `main.js`),
  },
]

async function downloadFile(url, outputPath) {
  const dir = path.dirname(outputPath)
  await mkdir(dir, { recursive: true })

  return new Promise((resolve, reject) => {
    const file = createWriteStream(outputPath)

    httpsGet(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // 处理重定向
        downloadFile(response.headers.location, outputPath).then(resolve).catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`))
        return
      }

      response.pipe(file)

      file.on(`finish`, () => {
        file.close()
        resolve()
      })

      file.on(`error`, (err) => {
        file.close()
        reject(err)
      })
    }).on(`error`, reject)
  })
}

async function main() {
  console.log(`> 开始下载 uTools 插件所需的本地资源...`)

  for (const resource of resources) {
    try {
      if (existsSync(resource.output)) {
        console.log(`✓ ${resource.name} 已存在，跳过下载`)
        continue
      }

      console.log(`  正在下载 ${resource.name}...`)
      await downloadFile(resource.url, resource.output)
      console.log(`✓ ${resource.name} 下载完成`)
    }
    catch (error) {
      console.error(`✗ ${resource.name} 下载失败:`, error.message)
      throw error
    }
  }

  console.log(`\n✔ 所有资源下载完成`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
