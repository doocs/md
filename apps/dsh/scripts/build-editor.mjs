#!/usr/bin/env node
/**
 * @description: 把仓库自带的 md 编辑器（apps/web）构建成插件里的 iframe 页面
 *
 * 产物：apps/dsh/build/editor（持久缓存，gitignore 掉），打包时复制进 dist/editor，
 * 由 Host 半片挂在 `/md-wechat/editor/` 前缀下，侧边栏面板用 iframe 打开。
 *
 * 与上游默认构建的三处差异（都在这里完成，不改编排逻辑）：
 *   1. 站点前缀 `--base=/md-wechat/editor/`，让资源落在插件自己的路由下；
 *   2. `SERVER_ENV=UTOOLS`：关掉上游的统计插件（Radix），并把 MathJax 下载成本地文件；
 *   3. 把 bundle 里剩余的 MathJax CDN 地址改成本地路径，离线也能渲染公式。
 *
 * 用法：
 *   node apps/dsh/scripts/build-editor.mjs          # 已有产物则复用
 *   node apps/dsh/scripts/build-editor.mjs --force  # 强制重建
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { resolveLayout } from './lib/build.mjs'

/** 编辑器在插件里的挂载前缀（与 src/server.ts 的常量保持一致） */
export const EDITOR_PREFIX = `/md-wechat/editor/`

/** 上游 MathJax 的 CDN 地址（构建后改写成本地路径） */
const MATHJAX_CDN_URL = `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/mathjax@3/es5/tex-svg.js`

/** 本地 MathJax 地址：挂在插件前缀下，离线可用 */
const MATHJAX_LOCAL_URL = `${EDITOR_PREFIX}static/libs/mathjax/tex-svg.js`

/**
 * 递归列出文件
 * @param {string} dir 目录
 * @param {string[]} [out] 收集数组
 * @returns {Promise<string[]>} 文件绝对路径
 */
async function listFiles(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)

    if (entry.isDirectory())
      await listFiles(full, out)
    else out.push(full)
  }

  return out
}

/**
 * 跑子进程并把输出透传
 * @param {string} command 命令
 * @param {string[]} args 参数
 * @param {{cwd: string, env?: Record<string, string>}} options 选项
 * @returns {Promise<void>}
 */
function run(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: `inherit`, ...options })

    child.on(`close`, code => (code === 0 ? resolve() : reject(new Error(`${command} 退出码 ${code}`))))
    child.on(`error`, reject)
  })
}

/**
 * 把 bundle 里残留的 MathJax CDN 地址改成本地路径
 * @param {string} outDir 构建产物目录
 * @returns {Promise<number>} 改写文件数
 */
async function localizeMathJax(outDir) {
  const files = (await listFiles(outDir)).filter(file => file.endsWith(`.js`) || file.endsWith(`.html`))
  let patched = 0

  for (const file of files) {
    const body = await readFile(file, `utf-8`)

    if (!body.includes(MATHJAX_CDN_URL))
      continue

    await writeFile(file, body.split(MATHJAX_CDN_URL).join(MATHJAX_LOCAL_URL), `utf-8`)
    patched += 1
  }

  return patched
}

/**
 * 构建产物自检
 * @param {string} outDir 构建产物目录
 * @returns {Promise<{files: number, bytes: number}>} 文件数与体积
 */
async function verifyEditor(outDir) {
  const index = await readFile(path.join(outDir, `index.html`), `utf-8`).catch(() => null)

  if (index === null)
    throw new Error(`编辑器产物缺少 index.html：${outDir}`)
  if (!index.includes(EDITOR_PREFIX))
    throw new Error(`index.html 没有使用 ${EDITOR_PREFIX} 作为站点前缀`)
  if (index.includes(MATHJAX_CDN_URL))
    throw new Error(`index.html 仍指向 MathJax CDN`)

  if (!(await stat(path.join(outDir, `static`, `libs`, `mathjax`, `tex-svg.js`)).catch(() => null))) {
    throw new Error(`缺少本地 MathJax（构建期需要联网下载一次）`)
  }

  const files = await listFiles(outDir)
  let bytes = 0

  for (const file of files) bytes += (await stat(file)).size

  return { files: files.length, bytes }
}

/**
 * 构建编辑器产物（已有缓存时可跳过）
 * @param {any} layout resolveLayout 的结果
 * @param {{force?: boolean}} [options] 是否强制重建
 * @returns {Promise<{outDir: string, files: number, bytes: number, rebuilt: boolean}>} 构建结果
 */
export async function buildEditor(layout, options = {}) {
  const outDir = layout.editorDir
  const indexPath = path.join(outDir, `index.html`)

  if (!options.force && fs.existsSync(indexPath)) {
    try {
      const cached = await verifyEditor(outDir)

      return { outDir, ...cached, rebuilt: false }
    }
    catch {
      // 缓存过期（比如站点前缀改了）就走重建，不把错误抛给用户
      console.log(`  > 缓存不可用，重新构建`)
    }
  }

  const appDir = path.join(layout.repoRoot, `apps`, `web`)
  const viteBin = path.join(appDir, `node_modules`, `vite`, `bin`, `vite.js`)

  if (!fs.existsSync(path.join(layout.repoRoot, `node_modules`))) {
    throw new Error(`仓库根还没有依赖，请先执行 pnpm install`)
  }

  if (!fs.existsSync(viteBin))
    throw new Error(`找不到 vite（${viteBin}），请先执行 pnpm install`)

  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })

  console.log(`  > vite build（base=${EDITOR_PREFIX}，首次约 1~2 分钟）`)

  await run(process.execPath, [
    viteBin,
    `build`,
    `--base=${EDITOR_PREFIX}`,
    `--outDir`,
    outDir,
    `--emptyOutDir`,
  ], {
    cwd: appDir,
    env: {
      ...process.env,
      SERVER_ENV: `UTOOLS`, // 关掉统计插件，并让上游把 MathJax 下载到本地
      ANALYZE: ``,
    },
  })

  const patched = await localizeMathJax(outDir)
  const verified = await verifyEditor(outDir)

  if (patched > 0)
    console.log(`  > MathJax 本地化：改写 ${patched} 个文件`)

  return { outDir, ...verified, rebuilt: true }
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith(`build-editor.mjs`)

if (invokedDirectly) {
  const layout = resolveLayout(import.meta.url)
  const force = process.argv.includes(`--force`)

  try {
    console.log(`> 构建 md 编辑器（${force ? `强制重建` : `有缓存则复用`}）`)
    const result = await buildEditor(layout, { force })

    console.log(`✔ 编辑器就绪${result.rebuilt ? `` : `（复用缓存，--force 可重建）`}`)
    console.log(`  ${path.relative(layout.repoRoot, result.outDir)}：${result.files} 个文件，${(result.bytes / 1024 / 1024).toFixed(1)} MB`)
  }
  catch (error) {
    console.error(`✖ 编辑器构建失败`)
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
