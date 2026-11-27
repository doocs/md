#!/usr/bin/env node
/**
 * Smoke-test a built bundle without DeepSeek Harness: load the generated
 * `index.js`, register its tools on a stub context, render a document, and
 * assert the produced article looks like real md output.
 *
 * This is what makes `pack.mjs` trustworthy: a bundle that cannot render is
 * reported here instead of inside the Harness.
 */

import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import vm from 'node:vm'

const SAMPLE_MARKDOWN = [
  `# md-wechat 自检`,
  ``,
  `段落包含 **粗体**、[链接](https://md.doocs.org) 与行内公式 $E = mc^2$。`,
  ``,
  `> [!NOTE] 提示`,
  `> 这是 callout 提示块。`,
  ``,
  '```js',
  'console.log(`hello`)',
  '```',
  ``,
  `- 列表项 A`,
  `- 列表项 B`,
].join(`\n`)

/**
 * Load the bundle and return `{ tools, plugin }`.
 * @param {string} distDir absolute path of the built bundle.
 * @returns {Promise<{ tools: Map<string, any>, plugin: any }>} the registered tools and the module.
 */
async function loadBundle(distDir) {
  const entry = path.join(distDir, `index.js`)
  if (!fs.existsSync(entry))
    throw new Error(`bundle entry not found: ${entry} (run scripts/build.mjs first)`)

  const plugin = await import(pathToFileURL(entry).href)
  /** @type {Map<string, any>} */
  const tools = new Map()
  const ctx = {
    // 真正的 Harness 里由 Cordis 提供；自检环境只要不炸即可
    get: () => undefined,
    effect: (/** @type {() => (() => void) | undefined} */ callback) => callback() ?? (() => {}),
    // 可选注入（webServer）：自检里视为不可用，路由用 check-routes.mjs 单独验证
    inject: () => () => {},
    tools: {
      /**
       * 收集工具定义，模拟 ctx.tools.register
       * @param {{ name: string }} definition 工具定义
       * @returns {() => void} 注销函数
       */
      register(definition) {
        tools.set(definition.name, definition)
        return () => tools.delete(definition.name)
      },
    },
  }

  if (typeof plugin.apply !== `function`)
    throw new TypeError(`bundle does not export apply(): ${Object.keys(plugin).join(`, `)}`)
  plugin.apply(ctx)
  return { tools, plugin }
}

/**
 * Validate one tool result against the keys the tool promises, shallowly.
 * @param {string} name 工具名
 * @param {unknown} value 工具返回值
 * @param {string[]} requiredKeys 必须存在的字段
 * @returns {void}
 */
function assertShape(name, value, requiredKeys) {
  if (typeof value !== `object` || value === null)
    throw new Error(`${name} returned ${typeof value} instead of an object`)
  for (const key of requiredKeys) {
    if (!(key in value))
      throw new Error(`${name} result is missing "${key}"`)
  }
}

/**
 * 检查 Web UI 半片：清单声明 + client.js 真的能注册出侧边栏入口与主面板
 *
 * 侧边栏菜单不出来，通常就是这里缺东西：要么清单没有 `./client` / `dsh.client`，
 * 要么 client.js 没注册 `sidebar.panellist`。这里用 vm 跑一遍工厂函数，
 * 用一个最小的 React 桩，不需要浏览器。
 * @param {string} distDir 产物目录
 * @returns {Promise<void>}
 */
async function assertClientHalf(distDir) {
  const manifest = JSON.parse(await readFile(path.join(distDir, `package.json`), `utf-8`))

  if (manifest.exports?.[`./client`] === undefined)
    throw new Error(`package.json 缺少 "./client" 导出`)
  if (manifest.dsh?.client?.platform !== `web`)
    throw new Error(`package.json 缺少 dsh.client.platform = "web"`)
  if (!manifest.files?.includes(`client.js`))
    throw new Error(`package.json 的 files 里缺少 client.js`)
  if (manifest.private)
    throw new Error(`分发包不能标记 private`)
  if (manifest.publishConfig?.access !== `public`)
    throw new Error(`分发包 publishConfig.access 必须是 public`)
  if (manifest.publishConfig?.directory)
    throw new Error(`分发包不能包含 publishConfig.directory`)

  const source = await readFile(path.join(distDir, `client.js`), `utf-8`)

  /** @type {{ definition?: { id?: string, factory?: Function } }} */
  const capture = {}
  const sandbox = {
    window: {
      __ModuleLoader__: {
        /**
         * 截获模块定义
         * @param {{id: string, factory: Function}} definition 模块定义
         * @returns {void}
         */
        load(definition) {
          capture.definition = definition
        },
      },
    },
  }

  vm.runInNewContext(source, sandbox, { filename: `client.js` })

  const definition = capture.definition

  if (!definition)
    throw new Error(`client.js 没有调用 window.__ModuleLoader__.load`)
  if (definition.id !== manifest.name)
    throw new Error(`client 模块 id (${definition.id}) 与包名 ${manifest.name} 不一致`)
  if (typeof definition.factory !== `function`)
    throw new TypeError(`client.js 的模块定义没有 factory`)

  // 最小 React 桩：只执行工厂与 apply，不渲染组件
  const reactStub = {
    createElement: () => null,
    useState: (/** @type {unknown} */ initial) => [initial, () => {}],
    useEffect: () => {},
    useCallback: (/** @type {Function} */ callback) => callback,
    useRef: (/** @type {unknown} */ initial) => ({ current: initial }),
  }

  /** @type {(name: string) => unknown} */
  const requireStub = (name) => {
    if (name === `react`)
      return reactStub
    throw new Error(`client.js 需要未预期的模块：${name}`)
  }

  const clientModule = definition.factory(requireStub)

  if (!Array.isArray(clientModule.inject) || !clientModule.inject.includes(`slots`)) {
    throw new Error(`client 模块没有声明 inject: ['slots']`)
  }

  /** @type {Array<{slot: string, key: string}>} */
  const registered = []
  const ctx = {
    get: () => undefined,
    effect: (/** @type {() => unknown} */ callback) => callback() ?? (() => {}),
    slots: {
      inject: (/** @type {string} */ _name, /** @type {() => void} */ callback) => callback(),
      register: (/** @type {{name: string, key?: string, id?: string}} */ options) => {
        registered.push({ slot: options.name, key: options.key ?? options.id ?? `` })
        return () => {}
      },
    },
  }

  clientModule.apply(ctx)

  const slots = registered.map(entry => entry.slot)
  for (const expected of [`main`, `sidebar.panellist`]) {
    if (!slots.includes(expected))
      throw new Error(`client.js 没有注册 ${expected}（已注册：${slots.join(`, `)}）`)
  }

  const panel = registered.find(entry => entry.slot === `main`)
  const icon = registered.find(entry => entry.slot === `sidebar.panellist`)

  if (!panel?.key)
    throw new Error(`main 面板缺少 key`)
  if (panel.key !== icon?.key)
    throw new Error(`main 的 key (${panel.key}) 与侧边栏 id (${icon?.key}) 不一致，点图标切不过去`)
}

/**
 * Run the smoke test against a built bundle.
 * @param {string} distDir absolute path of the built bundle.
 * @returns {Promise<{ renderedBytes: number, tools: string[] }>} the rendered size and registered tool names.
 */
export async function smokeTest(distDir) {
  const { tools } = await loadBundle(distDir)
  const names = [...tools.keys()]

  await assertClientHalf(distDir)

  for (const expected of [`md_wechat_render`, `md_wechat_options`]) {
    if (!tools.has(expected))
      throw new Error(`tool ${expected} was not registered (registered: ${names.join(`, `)})`)
  }

  const options = await tools.get(`md_wechat_options`).execute({})
  assertShape(`md_wechat_options`, options, [`text`])
  const parsed = JSON.parse(options.text)
  if (!Array.isArray(parsed.themes) || parsed.themes.length === 0)
    throw new Error(`md_wechat_options reported no themes`)

  const workDir = await mkdtemp(path.join(os.tmpdir(), `md-wechat-smoke-`))
  const output = path.join(workDir, `article.html`)
  try {
    const value = await tools.get(`md_wechat_render`).execute({ markdown: SAMPLE_MARKDOWN, output })
    assertShape(`md_wechat_render`, value, [`path`, `bytes`, `theme`, `words`])
    if (value.path !== output)
      throw new Error(`md_wechat_render wrote ${value.path} instead of ${output}`)

    const html = await readFile(output, `utf-8`)
    for (const marker of [`<style>`, `<h1`, `--md-primary-color`]) {
      if (!html.includes(marker))
        throw new Error(`rendered HTML does not contain ${marker}`)
    }
    if (html.includes(`[!NOTE]`))
      throw new Error(`callout alert was not transformed`)

    const rendered = tools.get(`md_wechat_render`).output.render({}, value)
    if (!Array.isArray(rendered) || rendered[0]?.type !== `text`)
      throw new Error(`md_wechat_render output.render did not return a text content block`)

    return { renderedBytes: Buffer.byteLength(html, `utf-8`), tools: names }
  }
  finally {
    await rm(workDir, { recursive: true, force: true })
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? ``).href) {
  const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), `..`, `dist`)
  try {
    const result = await smokeTest(distDir)
    console.log(`✔ 自检通过: ${result.tools.join(`, `)} · 渲染 ${(result.renderedBytes / 1024).toFixed(1)} KB`)
  }
  catch (error) {
    console.error(`✖ 自检失败`)
    console.error(error)
    process.exitCode = 1
  }
}
