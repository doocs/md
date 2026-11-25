#!/usr/bin/env node
/**
 * Build the installable md-wechat bundle into `plugins/dsh/dist`.
 * The directory it produces is what DeepSeek Harness installs ("Add plugin" or
 * `plugin_manager` `install_bundle`), and what `pack.mjs` zips.
 */

import path from 'node:path'
import process from 'node:process'
import { buildBundle, resolveLayout } from './lib/build.mjs'

const layout = resolveLayout(import.meta.url)

try {
  const result = await buildBundle(layout)
  const megabytes = (result.bundleBytes / 1024 / 1024).toFixed(1)
  console.log(`✔ md-wechat 已构建 (version ${result.version})`)
  console.log(`  ${path.relative(layout.repoRoot, layout.distDir)}/index.js  ${megabytes} MB`)
  console.log(`  themes: ${result.themeFiles.join(`, `)}`)
  console.log(`  下一步: node apps/dsh/scripts/pack.mjs（打包 zip）或把该目录安装到 DSH`)
}
catch (error) {
  console.error(`✖ md-wechat 构建失败`)
  console.error(error)
  process.exitCode = 1
}
