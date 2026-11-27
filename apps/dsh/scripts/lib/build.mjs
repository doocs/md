/**
 * @description: md-wechat 插件的构建工具集（构建产物 + 可移植性校验 + 打包）
 *
 * 一切都在本仓库内完成，不依赖额外安装：esbuild 从依赖它的包解析，@md/core 与
 * @md/shared 通过声明了它们的工作区包解析，zip 由 `lib/zip.mjs` 自己写。
 */

import fs from 'node:fs'
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { writeZip } from './zip.mjs'

/** 分发包的包名（与 apps/dsh/package.json、client.js、cordis.patch.yml 保持一致） */
export const BUNDLE_PACKAGE_NAME = `@doocs/dsh-md`

/** 覆盖安装前要卸掉的旧包名 */
export const LEGACY_BUNDLE_PACKAGE_NAMES = [`@local/md-wechat`, `@doocs/md-dsh`]

/** Loader 行 id（与 cordis.patch.yml 保持一致） */
export const BUNDLE_ROW_ID = `md-wechat`

/** 必须保持外部的原生可选依赖（jsdom / ws 用） */
const NODE_EXTERNALS = [`canvas`, `bufferutil`, `utf-8-validate`]

/** 构建产物的文本类扩展名：可移植性校验按文本读取 */
const TEXT_EXTENSIONS = new Set([
  `.css`,
  `.html`,
  `.js`,
  `.json`,
  `.md`,
  `.mjs`,
  `.svg`,
  `.txt`,
  `.yml`,
  `.yaml`,
])

/**
 * 定位仓库与插件目录：向上找到 pnpm workspace 根（本包位于 apps/dsh）
 * @param {string} metaUrl 调用脚本的 import.meta.url
 * @returns {{pluginDir: string, repoRoot: string, distDir: string, releaseDir: string, buildDir: string, editorDir: string, themeSourceDir: string, workspaceAnchor: string}} 路径集合
 */
export function resolveLayout(metaUrl) {
  let dir = path.dirname(fileURLToPath(metaUrl))
  let repoRoot = null

  while (repoRoot === null) {
    if (fs.existsSync(path.join(dir, `pnpm-workspace.yaml`)) && fs.existsSync(path.join(dir, `package.json`))) {
      repoRoot = dir
      break
    }

    const parent = path.dirname(dir)

    if (parent === dir) {
      throw new Error(`md-wechat: 未找到 pnpm workspace 根目录（起点 ${fileURLToPath(metaUrl)}）`)
    }

    dir = parent
  }

  const pluginDir = path.join(repoRoot, `apps`, `dsh`)

  if (!fs.existsSync(path.join(pluginDir, `cordis.patch.yml`))) {
    throw new Error(`md-wechat: 插件源码不在 ${pluginDir}`)
  }

  return {
    pluginDir,
    repoRoot,
    distDir: path.join(pluginDir, `dist`),
    releaseDir: path.join(pluginDir, `release`),
    buildDir: path.join(pluginDir, `build`),
    editorDir: path.join(pluginDir, `build`, `editor`),
    themeSourceDir: path.join(repoRoot, `packages`, `shared`, `src`, `configs`, `theme-css`),
    workspaceAnchor: path.join(repoRoot, `packages`, `mcp-server`, `package.json`),
  }
}

/**
 * 按绝对路径导入 CJS 或 ESM 模块
 * @param {string} file 模块绝对路径
 * @returns {Promise<any>} 模块导出
 */
async function importAbsolute(file) {
  const module = await import(pathToFileURL(file).href)

  return module.default && Object.keys(module).length === 1 ? module.default : module
}

/**
 * 解析 esbuild：它来自 web 应用的打包器依赖，不是本包的直连依赖
 * @param {string} repoRoot 仓库根目录
 * @returns {Promise<any>} esbuild 模块
 */
export async function loadEsbuild(repoRoot) {
  const anchors = [
    path.join(repoRoot, `package.json`),
    path.join(repoRoot, `apps`, `web`, `package.json`),
    path.join(repoRoot, `apps`, `web`, `node_modules`, `vite`, `package.json`),
    path.join(repoRoot, `packages`, `mcp-server`, `package.json`),
    path.join(repoRoot, `apps`, `vscode`, `package.json`),
  ]

  for (const anchor of anchors) {
    if (!fs.existsSync(anchor))
      continue

    try {
      // 通过真实路径解析：pnpm 用软链接摆包，从链接位置出发会找不到同级依赖
      const resolved = createRequire(fs.realpathSync(anchor)).resolve(`esbuild`)
      const esbuild = await importAbsolute(resolved)

      if (typeof esbuild.build === `function`)
        return esbuild
    }
    catch {
      // 该锚点没有 esbuild，继续试下一个
    }
  }

  throw new Error(`md-wechat: 当前仓库里找不到 esbuild，请先在仓库根目录执行 pnpm install`)
}

/**
 * 解析 `@md/*` 工作区包（经声明了它们的包转发）
 * @param {string} anchor 声明了工作区包的 package.json
 * @returns {{name: string, setup: (build: any) => void}} esbuild 插件
 */
function workspacePackagesResolver(anchor) {
  const requireFromWorkspace = createRequire(fs.realpathSync(anchor))

  return {
    name: `md-workspace-packages`,
    setup(build) {
      build.onResolve({ filter: /^@md\/(?:core|shared)(?:\/.*)?$/ }, (/** @type {{ path: string }} */ args) => {
        try {
          return { path: requireFromWorkspace.resolve(args.path) }
        }
        catch (error) {
          const message = error instanceof Error ? error.message : String(error)

          return { errors: [{ text: `无法解析 ${args.path}：${message}` }] }
        }
      })
    },
  }
}

/**
 * 把插件源码打成单个自包含 ESM 文件
 * @param {any} layout 路径集合
 * @param {boolean} [minify] 是否压缩（默认压缩，分发包体积减半）
 * @returns {Promise<{outfile: string, size: number}>} 产物路径与体积
 */
export async function bundlePlugin(layout, minify = true) {
  const esbuild = await loadEsbuild(layout.repoRoot)
  const outfile = path.join(layout.distDir, `index.js`)

  await esbuild.build({
    entryPoints: [path.join(layout.pluginDir, `src`, `index.ts`)],
    outfile,
    bundle: true,
    platform: `node`,
    format: `esm`,
    target: `node22`,
    external: NODE_EXTERNALS,
    legalComments: `none`,
    minify,
    logLevel: `warning`,
    plugins: [workspacePackagesResolver(layout.workspaceAnchor)],
    banner: {
      js: [
        `// md-wechat bundle: doocs/md renderer for DeepSeek Harness.`,
        `import { createRequire as __mdWechatRequire } from 'node:module'`,
        `const require = __mdWechatRequire(import.meta.url)`,
      ].join(`\n`),
    },
  })

  const { size } = await fs.promises.stat(outfile)

  return { outfile, size }
}

/**
 * 复制渲染器运行时需要的上游样式表
 * @param {any} layout 路径集合
 * @returns {Promise<string[]>} 复制的文件名
 */
async function copyThemeCSS(layout) {
  const target = path.join(layout.distDir, `theme`)

  await mkdir(target, { recursive: true })

  const files = (await readdir(layout.themeSourceDir)).filter(file => file.endsWith(`.css`))

  if (!files.includes(`base.css`))
    throw new Error(`md-wechat: ${layout.themeSourceDir} 缺少 base.css`)

  for (const file of files) await cp(path.join(layout.themeSourceDir, file), path.join(target, file))

  return files
}

/**
 * jsdom 加载时会 require.resolve 同目录的同步 XHR worker；同步 XHR 从不使用，
 * 放一个占位文件让解析通过即可。
 * @param {any} layout 路径集合
 * @returns {Promise<void>}
 */
async function writeWorkerStub(layout) {
  const stub = `// jsdom 同步 XHR worker 的占位文件；md-wechat 不使用同步 XHR。\nmodule.exports = {}\n`

  await writeFile(path.join(layout.distDir, `xhr-sync-worker.js`), stub, `utf-8`)
}

/**
 * 写分发包清单。字段来自 apps/dsh/package.json，去掉只在仓库里有意义的 scripts，
 * 并拿掉 publishConfig.directory（发布时 changesets 已经切到 dist/，清单里再带一次会指到 dist/dist）。
 * @param {any} layout 路径集合
 * @param {string} version 版本号
 * @returns {Promise<void>}
 */
async function writeBundleManifest(layout, version) {
  const sourcePath = path.join(layout.pluginDir, `package.json`)
  const source = JSON.parse(await readFile(sourcePath, `utf8`))

  if (source.name !== BUNDLE_PACKAGE_NAME) {
    throw new Error(`md-wechat: ${sourcePath} 的 name 是 ${source.name}，必须是 ${BUNDLE_PACKAGE_NAME}`)
  }

  if (source.private)
    throw new Error(`md-wechat: ${BUNDLE_PACKAGE_NAME} 的 package.json 不能是 private，否则发不了 npm`)

  if (source.version !== version)
    throw new Error(`md-wechat: 清单版本 ${version} 与 ${sourcePath} 的 ${source.version} 不一致`)

  const publishConfig = { ...(source.publishConfig ?? {}) }

  delete publishConfig.directory

  if (publishConfig.access !== `public`)
    throw new Error(`md-wechat: publishConfig.access 必须是 public`)

  for (const key of [`exports`, `files`, `dsh`]) {
    if (source[key] == null)
      throw new Error(`md-wechat: package.json 缺少 ${key}`)
  }

  const manifest = {
    name: source.name,
    version: source.version,
    type: source.type ?? `module`,
    description: source.description,
    license: source.license,
    author: source.author,
    homepage: source.homepage,
    repository: source.repository,
    bugs: source.bugs,
    keywords: source.keywords,
    engines: source.engines,
    exports: source.exports,
    files: source.files,
    publishConfig,
    dsh: source.dsh,
  }

  await writeFile(path.join(layout.distDir, `package.json`), `${JSON.stringify(manifest, null, 2)}\n`, `utf-8`)
}

/**
 * 复制与源码同级的静态分发资源
 * @param {any} layout 路径集合
 * @returns {Promise<void>}
 */
async function copyStaticResources(layout) {
  for (const entry of [`cordis.patch.yml`, `icon.svg`, `client.js`]) {
    const source = path.join(layout.pluginDir, entry)

    if (!fs.existsSync(source))
      throw new Error(`md-wechat: ${layout.pluginDir} 缺少分发资源 ${entry}`)

    await cp(source, path.join(layout.distDir, entry))
  }

  const readme = path.join(layout.pluginDir, `README.npm.md`)

  if (!fs.existsSync(readme))
    throw new Error(`md-wechat: ${layout.pluginDir} 缺少 README.npm.md（发布到 npm 的说明）`)

  await cp(readme, path.join(layout.distDir, `README.md`))
  await cp(path.join(layout.pluginDir, `locale`), path.join(layout.distDir, `locale`), { recursive: true })
}

/**
 * 递归列举目录下所有文件
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
 * 把编辑器构建产物复制进分发目录（面板用 iframe 打开它）
 * @param {any} layout 路径集合
 * @returns {Promise<number>} 复制的文件数
 */
async function copyEditor(layout) {
  const source = layout.editorDir

  if (!fs.existsSync(path.join(source, `index.html`))) {
    throw new Error(
      `编辑器产物不存在：${source}\n`
      + `  先执行：pnpm dsh:editor（首次约 1~2 分钟；需要联网下载本地 MathJax）`,
    )
  }

  const target = path.join(layout.distDir, `editor`)
  const files = await listFiles(source)

  await cp(source, target, { recursive: true })

  return files.length
}

/**
 * 可移植性校验：分发物里不能出现本机绝对路径，也不能有 link:/file: 依赖
 *
 * 「发给别人安装」的前提是产物只描述自己：包名、相对导出、相对补丁路径。
 * @param {any} layout 路径集合
 * @returns {Promise<{files: number, bytes: number}>} 校验结果
 */
export async function assertPortable(layout) {
  const files = await listFiles(layout.distDir)
  const repoRootPosix = layout.repoRoot.split(path.sep).join(`/`)
  const problems = []
  let bytes = 0

  for (const file of files) {
    const relative = path.relative(layout.distDir, file)

    bytes += (await fs.promises.stat(file)).size

    if (!TEXT_EXTENSIONS.has(path.extname(file)))
      continue

    const text = await readFile(file, `utf-8`)

    if (text.includes(layout.repoRoot) || text.includes(repoRootPosix)) {
      problems.push(`${relative}: 含有本机绝对路径 ${layout.repoRoot}`)
    }

    if (/\.(?:json|ya?ml)$/.test(file) && /"(?:link:|file:)/.test(text)) {
      problems.push(`${relative}: 含有 link:/file: 形式的本地依赖`)
    }
  }

  if (fs.existsSync(path.join(layout.distDir, `node_modules`))) {
    problems.push(`dist/node_modules 不应随包分发`)
  }

  if (problems.length > 0)
    throw new Error(`md-wechat 产物不可移植：\n- ${problems.join(`\n- `)}`)

  return { files: files.length, bytes }
}

/**
 * 构建完整的分发目录
 * @param {any} layout 路径集合
 * @returns {Promise<{version: string, bundleBytes: number, themeFiles: string[], editorFiles: number, files: number, bytes: number}>} 构建结果
 */
export async function buildBundle(layout) {
  const pluginManifest = JSON.parse(await readFile(path.join(layout.pluginDir, `package.json`), `utf-8`))
  const version = pluginManifest.version

  await rm(layout.distDir, { recursive: true, force: true })
  await mkdir(layout.distDir, { recursive: true })

  const bundled = await bundlePlugin(layout)

  // esbuild 会把被打包依赖里的 CSS 抽成同名文件；文章自带 <style>，无需分发它
  await rm(path.join(layout.distDir, `index.css`), { force: true })

  const themeFiles = await copyThemeCSS(layout)

  await copyStaticResources(layout)
  await writeWorkerStub(layout)
  await writeBundleManifest(layout, version)

  const editorFiles = await copyEditor(layout)
  const portable = await assertPortable(layout)

  return {
    version,
    bundleBytes: bundled.size,
    themeFiles,
    editorFiles,
    files: portable.files,
    bytes: portable.bytes,
  }
}

/**
 * 把分发目录打成 zip（零依赖，路径全部使用 /）
 * @param {any} layout 路径集合
 * @param {string} version 版本号
 * @returns {Promise<{zipPath: string, size: number}>} 压缩包路径与体积
 */
export async function zipBundle(layout, version) {
  await mkdir(layout.releaseDir, { recursive: true })

  const zipPath = path.join(layout.releaseDir, `md-wechat-v${version}.zip`)
  const files = await listFiles(layout.distDir)
  const entries = []

  for (const file of files) {
    entries.push({
      name: path.relative(layout.distDir, file).split(path.sep).join(`/`),
      data: await readFile(file),
    })
  }

  await rm(zipPath, { force: true })

  const { size } = await writeZip(zipPath, entries)

  return { zipPath, size }
}
