#!/usr/bin/env node
/**
 * @description: 构建 + 自检 + 自动安装到 DeepSeek Harness（不用手动点插件页）
 *
 * 做的事：
 *   1. 构建编辑器：apps/web → apps/dsh/build/editor（有缓存则复用，--editor 强制重建）
 *   2. 构建插件：src/ → apps/dsh/dist（含编辑器产物与主题样式）
 *   3. 脱离 DSH 自检：加载产物、注册工具、渲染样例、检查客户端半片
 *   4. 调用 DSH 自带 CLI：dsh plugin --profile <profile> add <dist>，运行中的 DSH 会热加载
 *
 * dsh CLI 不在 PATH 上，脚本会按这个顺序自动找：
 *   --cli 参数 / DSH_CLI / PATH / DSH_NODE_EXECUTABLE / DSH_INSTALL_DIR /
 *   运行中的 DSH 桌面进程 / 卸载注册表 / 常见安装目录
 *
 * 用法：
 *   node apps/dsh/scripts/install.mjs               # 编辑器有缓存则复用
 *   node apps/dsh/scripts/install.mjs --editor      # 强制重建编辑器
 *   node apps/dsh/scripts/install.mjs --no-build    # 跳过全部构建，直接安装现有产物
 *   node apps/dsh/scripts/install.mjs --profile web # 装到 web profile
 *   node apps/dsh/scripts/install.mjs --cli "D:\\...\\resources\\runtime\\cli\\bin\\dsh.cmd"
 */

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { buildEditor } from './build-editor.mjs'
import { buildBundle, BUNDLE_PACKAGE_NAME, LEGACY_BUNDLE_PACKAGE_NAMES, resolveLayout } from './lib/build.mjs'
import { smokeTest } from './smoke.mjs'

/**
 * 读取命令行开关
 * @param {string[]} argv 去掉了 node 与脚本路径的参数
 * @returns {{build: boolean, editor: boolean, profile: string, cli: string}} 选项
 */
function parseArgs(argv) {
  const options = { build: true, editor: false, profile: process.env.DSH_PROFILE ?? `desktop`, cli: `` }

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]

    if (arg === `--no-build`)
      options.build = false
    else if (arg === `--editor`)
      options.editor = true
    else if (arg === `--profile`)
      options.profile = argv[++index] ?? options.profile
    else if (arg === `--cli`)
      options.cli = argv[++index] ?? ``
  }

  return options
}

/** CLI 文件名：Windows 是 dsh.cmd，其余平台是 dsh */
const CLI_NAMES = process.platform === `win32` ? [`dsh.cmd`, `dsh`] : [`dsh`]

/**
 * 在一个「安装根」下找 CLI，兼容桌面版 resources 与 macOS 的 Contents/Resources
 * @param {string} root 候选根目录
 * @returns {string|null} CLI 路径
 */
function cliInRoot(root) {
  if (!root)
    return null

  const bases = [root, path.join(root, `resources`), path.join(root, `Contents`, `Resources`)]

  for (const base of bases) {
    for (const name of CLI_NAMES) {
      const candidate = path.join(base, `runtime`, `cli`, `bin`, name)

      if (fs.existsSync(candidate))
        return candidate
    }
  }

  return null
}

/**
 * 跑一段 PowerShell 取 stdout（非 Windows、或没有 PowerShell 时返回空串）
 * @param {string} script 脚本内容
 * @returns {string} 输出
 */
function runPowerShell(script) {
  if (process.platform !== `win32`)
    return ``

  for (const shell of [`powershell`, `pwsh`]) {
    const result = spawnSync(shell, [`-NoProfile`, `-NonInteractive`, `-Command`, script], {
      encoding: `utf8`,
      windowsHide: true,
    })

    if (result.status === 0 && result.stdout)
      return result.stdout.trim()
  }

  return ``
}

/**
 * 正在运行的 DSH 桌面进程所在目录（用户一般先开着 DSH，这条最可靠）
 * @returns {string[]} 候选安装根
 */
function rootsFromRunningProcess() {
  const output = runPowerShell(
    `(Get-Process -Name 'DeepSeek Harness' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path)`,
  )

  return output ? [path.dirname(output.trim())] : []
}

/**
 * 从卸载注册表里找安装目录
 * @returns {string[]} 候选安装根
 */
function rootsFromRegistry() {
  const output = runPowerShell(
    `$paths = @('HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',`
    + `'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',`
    + `'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'); `
    + `Get-ItemProperty $paths -ErrorAction SilentlyContinue | `
    + `Where-Object { $_.DisplayName -like '*DeepSeek Harness*' } | `
    + `Select-Object -First 1 -ExpandProperty InstallLocation`,
  )

  return output ? [output.trim().replace(/[\\/]+$/, ``)] : []
}

/**
 * 常见安装位置
 * @returns {string[]} 候选安装根
 */
function rootsFromCommonDirs() {
  const roots = []
  const { LOCALAPPDATA = ``, ProgramFiles = ``, PROGRAMFILES = ``, HOME = `` } = process.env

  if (LOCALAPPDATA)
    roots.push(path.join(LOCALAPPDATA, `Programs`, `DeepSeek Harness`))
  if (ProgramFiles)
    roots.push(path.join(ProgramFiles, `DeepSeek Harness`))
  if (PROGRAMFILES && PROGRAMFILES !== ProgramFiles)
    roots.push(path.join(PROGRAMFILES, `DeepSeek Harness`))
  if (HOME)
    roots.push(path.join(HOME, `Applications`, `DeepSeek Harness.app`))

  return roots
}

/**
 * PATH 上的 dsh
 * @returns {string|null} CLI 路径
 */
function cliFromPath() {
  const command = process.platform === `win32` ? `where dsh` : `which dsh`
  const result = spawnSync(command, { shell: true, encoding: `utf8`, windowsHide: true })

  if (result.status !== 0 || !result.stdout)
    return null

  return result.stdout.split(/\r?\n/).map(line => line.trim()).find(Boolean) ?? null
}

/**
 * 从 DSH_INSTALL_DIR 逐级向上找（它指向 .../resources/app.asar/dsh/node_modules/@deepseek-ai/dsh）
 * @returns {string[]} 候选安装根
 */
function rootsFromInstallDir() {
  const installDir = process.env.DSH_INSTALL_DIR

  if (!installDir)
    return []

  const roots = []
  let current = installDir

  for (let depth = 0; depth < 8; depth++) {
    const parent = path.dirname(current)

    if (parent === current)
      break

    current = parent
    roots.push(current)
  }

  return roots
}

/**
 * 找到 DSH 自带的 dsh CLI
 * @param {string} explicit `--cli` 传入的路径（可以是 CLI，也可以是 DSH 可执行文件/安装目录）
 * @returns {{path: string, source: string}} CLI 路径与来源
 */
function resolveDshCli(explicit) {
  /** @type {Array<[string, string]>} */
  const found = []

  /**
   * 登记一个「可能是 CLI、也可能是安装根」的路径
   * @param {string | null | undefined} candidate 路径（可能来自未设置的环境变量）
   * @param {string} source 来源说明
   * @returns {void}
   */
  const register = (candidate, source) => {
    if (!candidate)
      return

    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      found.push([candidate, source])

      return
    }

    const cli = cliInRoot(candidate)

    if (cli)
      found.push([cli, source])
  }

  register(explicit, `--cli`)
  register(process.env.DSH_CLI, `DSH_CLI`)
  register(cliFromPath(), `PATH`)

  if (process.env.DSH_NODE_EXECUTABLE)
    register(path.dirname(process.env.DSH_NODE_EXECUTABLE), `DSH_NODE_EXECUTABLE`)

  for (const root of rootsFromInstallDir()) register(root, `DSH_INSTALL_DIR`)
  for (const root of rootsFromRunningProcess()) register(root, `运行中的 DSH 进程`)
  for (const root of rootsFromRegistry()) register(root, `卸载注册表`)
  for (const root of rootsFromCommonDirs()) register(root, `常见安装目录`)

  if (found.length > 0)
    return { path: found[0][0], source: found[0][1] }

  throw new Error(
    `找不到 DSH 自带的 dsh CLI。\n`
    + `  - 显式指定（最快）：\n`
    + `      node apps/dsh/scripts/install.mjs --cli "X:\\...\\resources\\runtime\\cli\\bin\\dsh.cmd"\n`
    + `  - 或者设置环境变量 DSH_CLI 指向同一个文件。\n`
    + `  - 脚本已尝试：--cli / DSH_CLI / PATH / DSH_NODE_EXECUTABLE / DSH_INSTALL_DIR / 运行中的 DSH 进程 / 卸载注册表 / 常见安装目录。`,
  )
}

/**
 * 拼出一条 cmd 命令行（含空格的参数加引号）
 * @param {string} cli CLI 路径
 * @param {string[]} args 子命令与参数
 * @returns {string} 命令行
 */
function toCommandLine(cli, args) {
  return [cli, ...args].map(token => (/\s/.test(token) ? `"${token}"` : token)).join(` `)
}

/**
 * 调用 dsh CLI
 * @param {string} cli CLI 路径
 * @param {string[]} args 子命令与参数
 * @param {boolean} allowFailure 失败时是否继续
 * @returns {number} 退出码
 */
function runDshCli(cli, args, allowFailure = false) {
  const commandLine = toCommandLine(cli, args)
  const result = spawnSync(commandLine, {
    // 先移除再添加会把 pnpm 的「依赖不存在」当成错误输出，这里静音即可
    stdio: allowFailure ? `ignore` : `inherit`,
    shell: true,
    windowsHide: true,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: `1` },
  })
  const status = result.status ?? 1

  if (status !== 0 && !allowFailure)
    throw new Error(`命令失败（exit ${status}）：${commandLine}`)

  return status
}

/**
 * 读取 profile 的 package.json，确认依赖与 bundle 列表状态
 * @param {string} profile profile 名
 * @returns {{dep: string, bundled: boolean, legacy: string[]}} 安装结果
 */
function readProfileState(profile) {
  const home = process.env.DSH_HOME ?? path.join(process.env.USERPROFILE ?? process.env.HOME ?? ``, `.dsh`)
  const manifestPath = path.join(home, `profiles`, profile, `package.json`)

  if (!fs.existsSync(manifestPath))
    return { dep: ``, bundled: false, legacy: [] }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, `utf8`))
  const dependencies = manifest.dependencies ?? {}
  const dep = dependencies[BUNDLE_PACKAGE_NAME] ?? ``
  const bundles = manifest.dsh?.profile?.bundles ?? []
  const legacy = LEGACY_BUNDLE_PACKAGE_NAMES.filter(name => dependencies[name])

  return { dep, bundled: bundles.includes(BUNDLE_PACKAGE_NAME), legacy }
}

/**
 * `dsh plugin remove` 会改 profile 依赖，但同目录的 junction 有时会留下。
 * 只删除符号链接本身，不跟随链接，避免把构建目录删掉。
 * @param {string} profile profile 名
 * @returns {void}
 */
function removeLegacyLinks(profile) {
  const home = process.env.DSH_HOME ?? path.join(process.env.USERPROFILE ?? process.env.HOME ?? ``, `.dsh`)
  const modulesDir = path.join(home, `profiles`, profile, `node_modules`)

  for (const name of LEGACY_BUNDLE_PACKAGE_NAMES) {
    const link = path.join(modulesDir, ...name.split(`/`))

    if (!fs.existsSync(link))
      continue

    if (!fs.lstatSync(link).isSymbolicLink())
      continue

    fs.unlinkSync(link)
    console.log(`  已删除残留链接 ${name}`)

    const scopeDir = path.dirname(link)
    if (fs.existsSync(scopeDir) && fs.readdirSync(scopeDir).length === 0)
      fs.rmdirSync(scopeDir)
  }
}

const options = parseArgs(process.argv.slice(2))
const layout = resolveLayout(import.meta.url)

try {
  if (options.build) {
    console.log(`> 1/4 编辑器（apps/web → build/editor${options.editor ? `，强制重建` : `，有缓存则复用`}）`)
    const editor = await buildEditor(layout, { force: options.editor })
    console.log(`  ${editor.files} 个文件 · ${(editor.bytes / 1024 / 1024).toFixed(1)} MB${editor.rebuilt ? ` · 本次重建` : ` · 复用缓存`}`)

    console.log(`> 2/4 构建插件（源码 -> ${path.relative(layout.repoRoot, layout.distDir)}）`)
    const built = await buildBundle(layout)
    console.log(`  版本 ${built.version} · index.js ${(built.bundleBytes / 1024 / 1024).toFixed(1)} MB · 主题 ${built.themeFiles.join(`, `)}`)

    console.log(`> 3/4 自检（不依赖 DSH，先在这里把错误挡住）`)
    const smoke = await smokeTest(layout.distDir)
    console.log(`  工具 ${smoke.tools.join(`, `)} · 样例渲染 ${(smoke.renderedBytes / 1024).toFixed(1)} KB`)
  }
  else {
    console.log(`> 跳过构建与自检（--no-build），直接安装现有产物`)
  }

  const cli = resolveDshCli(options.cli)
  const before = readProfileState(options.profile)

  console.log(`> 4/4 安装到 DSH（profile: ${options.profile}，CLI 来自：${cli.source}）`)

  // 只有已安装时才 remove，避免 pnpm 报「依赖不存在」。旧包名一并卸掉。
  const removals = [...(before.dep ? [BUNDLE_PACKAGE_NAME] : []), ...before.legacy]

  for (const name of removals) {
    console.log(`  卸掉已安装的 ${name}`)
    runDshCli(cli.path, [`plugin`, `--profile`, options.profile, `remove`, name], true)
  }

  removeLegacyLinks(options.profile)

  runDshCli(cli.path, [`plugin`, `--profile`, options.profile, `add`, layout.distDir])

  const state = readProfileState(options.profile)

  if (!state.dep)
    throw new Error(`安装后 ${BUNDLE_PACKAGE_NAME} 不在 profile 依赖里，请检查上面的输出`)

  console.log(`\n✔ 已装好`)
  console.log(`  profile:  ${options.profile}`)
  console.log(`  CLI:      ${cli.path}`)
  console.log(`  依赖:     ${state.dep}`)
  console.log(`  bundle:   ${state.bundled ? `已加入 dsh.profile.bundles` : `未加入（重启 DSH 后再看一次）`}`)
  console.log(`\n接下来：`)
  console.log(`  · 刷新页面（Ctrl+R），侧边栏出现「doocs/md」，点开就是完整编辑器`)
  console.log(`  · 也可以直接让 Agent 用 md_wechat_render 出稿`)
  console.log(`  · Host 代码有改动时（不是首次安装），重启一次 DSH 才会加载新模块；`)
  console.log(`    只刷新页面会看到旧的接口，编辑器 iframe 会提示未加载。`)
}
catch (error) {
  console.error(`\n✖ 安装失败`)
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
