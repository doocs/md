/**
 * @description: 单元测试配置（vitest）
 *
 * 本插件没有自己的 node_modules：vitest 由 `scripts/test.mjs` 从 packages/core 里解析后启动，
 * 因此这里只导出普通对象，不 import `vitest/config`，避免模板解析不到依赖。
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const pluginDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(pluginDir, `..`, `..`)

export default {
  root: pluginDir,
  resolve: {
    // 与 scripts/lib/build.mjs 的解析策略一致：直接指向源码，不经过 workspace 链接
    alias: {
      '@md/core': path.join(repoRoot, `packages`, `core`, `src`),
      '@md/shared': path.join(repoRoot, `packages`, `shared`, `src`),
    },
  },
  test: {
    include: [`test/**/*.test.ts`],
    environment: `node`,
    testTimeout: 30_000,
  },
}
