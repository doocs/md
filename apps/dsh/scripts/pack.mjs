#!/usr/bin/env node
/**
 * @description: 打包 md-wechat（DSH 插件）为可移植分发物
 *
 * 流程：构建编辑器 -> 构建插件 -> 脱离 DSH 自检 -> 可移植性校验 -> 生成 zip。
 * 用法：node apps/dsh/scripts/pack.mjs [--editor]
 *   --editor  强制重建编辑器（默认复用 apps/dsh/build/editor 缓存）
 */

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

import { buildEditor } from './build-editor.mjs'
import { buildBundle, resolveLayout, zipBundle } from './lib/build.mjs'
import { smokeTest } from './smoke.mjs'

const layout = resolveLayout(import.meta.url)
const forceEditor = process.argv.includes(`--editor`)

try {
  console.log(`> 1/4 编辑器产物（apps/web → build/editor${forceEditor ? `，强制重建` : `，有缓存则复用`}）`)
  const editor = await buildEditor(layout, { force: forceEditor })
  console.log(`  ${editor.files} 个文件 · ${(editor.bytes / 1024 / 1024).toFixed(1)} MB${editor.rebuilt ? ` · 本次重建` : ` · 复用缓存`}`)

  console.log(`> 2/4 构建插件（自包含 index.js + 主题 + 编辑器）`)
  const built = await buildBundle(layout)
  console.log(`  版本 ${built.version} · index.js ${(built.bundleBytes / 1024 / 1024).toFixed(1)} MB · 主题 ${built.themeFiles.join(`, `)}`)

  console.log(`> 3/4 自检（工具 + 客户端半片 + HTTP 路由）`)
  const smoke = await smokeTest(layout.distDir)
  console.log(`  ${smoke.tools.join(`, `)} · 样例渲染 ${(smoke.renderedBytes / 1024).toFixed(1)} KB · 侧边栏/面板注册正常`)

  const routes = spawnSync(process.execPath, [path.join(layout.pluginDir, `scripts`, `check-routes.mjs`)], { stdio: `inherit` })

  if (routes.status !== 0)
    throw new Error(`路由自检失败（exit ${routes.status}）`)

  console.log(`> 4/4 打包 zip（零依赖，无绝对路径）`)
  const packed = await zipBundle(layout, built.version)

  console.log(`\n✔ md-wechat 打包完成`)
  console.log(`  分发目录: ${path.relative(layout.repoRoot, layout.distDir)}（${built.files} 个文件，${(built.bytes / 1024 / 1024).toFixed(1)} MB）`)
  console.log(`  压缩包:   ${path.relative(layout.repoRoot, packed.zipPath)}（${(packed.size / 1024 / 1024).toFixed(1)} MB）`)
  console.log(`\n把 zip 发给别人：解压后在 DSH「插件」→「添加插件」选择该目录即可安装。`)
  console.log(`装好后刷新页面，侧边栏「doocs/md」就是完整的 md 编辑器。`)
}
catch (error) {
  console.error(`✖ md-wechat 打包失败`)
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
