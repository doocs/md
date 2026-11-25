#!/usr/bin/env node
/**
 * @description: 跑单元测试（vitest 从 packages/core 解析，本插件不需要自己的 node_modules）
 *
 * 用法：node apps/dsh/scripts/test.mjs [--watch]
 */

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'

import { resolveLayout } from './lib/build.mjs'

const layout = resolveLayout(import.meta.url)
const anchor = path.join(layout.repoRoot, `packages`, `core`, `package.json`)

if (!fs.existsSync(anchor))
  throw new Error(`找不到 ${anchor}，无法解析 vitest`)

const vitestManifest = createRequire(fs.realpathSync(anchor)).resolve(`vitest/package.json`)
const cli = path.join(path.dirname(vitestManifest), `vitest.mjs`)

if (!fs.existsSync(cli))
  throw new Error(`找不到 vitest CLI：${cli}（先在仓库根 pnpm install）`)

const watching = process.argv.includes(`--watch`)
const args = watching ? [] : [`run`]
const result = spawnSync(process.execPath, [cli, ...args, `--config`, path.join(layout.pluginDir, `vitest.config.mjs`)], {
  stdio: `inherit`,
  cwd: layout.pluginDir,
})

process.exitCode = result.status ?? 1
