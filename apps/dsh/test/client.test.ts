/**
 * @description: 浏览器半片单测：模块 id、slot 注册、key 对应关系
 *
 * 用 vm 跑 client.js（它靠 window.__ModuleLoader__.load 注册），React 用最小桩，
 * 只验证注册逻辑，不渲染组件。
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { describe, expect, it } from 'vitest'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(testDir, `..`, `client.js`)

interface SlotRegistration { name: string, key?: string, id?: string, label?: () => string }

/**
 * 加载 client.js 并返回它注册的模块定义
 * @returns {Promise<any>} 模块定义
 */
async function loadClientDefinition() {
  const source = await readFile(clientPath, `utf8`)
  const capture: { definition?: any } = {}

  vm.runInNewContext(source, {
    window: {
      __ModuleLoader__: {
        load: (definition: any) => {
          capture.definition = definition
        },
      },
    },
  })

  return capture.definition
}

/**
 * 最小 React 桩：只提供 client.js 用到的 API
 * @returns {any} React 桩
 */
function createReactStub() {
  return {
    createElement: () => null,
    useState: (initial: unknown) => [initial, () => {}],
    useEffect: () => {},
    useCallback: (callback: unknown) => callback,
    useRef: (initial: unknown) => ({ current: initial }),
  }
}

/**
 * 执行模块工厂并跑 apply，收集 slot 注册
 * @param {any} definition 模块定义
 * @returns {SlotRegistration[]} 注册列表
 */
function applyClient(definition: any) {
  const react = createReactStub()
  const clientModule = definition.factory((name: string) => {
    if (name === `react`)
      return react
    throw new Error(`unexpected module: ${name}`)
  })
  const registered: SlotRegistration[] = []
  const ctx = {
    get: () => undefined,
    effect: (callback: () => unknown) => callback() ?? (() => {}),
    slots: {
      inject: (_name: string, callback: () => void) => callback(),
      register: (options: SlotRegistration) => {
        registered.push(options)
        return () => {}
      },
    },
  }

  expect(clientModule.inject).toContain(`slots`)
  clientModule.apply(ctx)

  return registered
}

describe(`client half`, () => {
  it(`模块 id 与包名一致`, async () => {
    const definition = await loadClientDefinition()
    const pkg = JSON.parse(await readFile(path.join(testDir, `..`, `package.json`), `utf8`))
    const patch = await readFile(path.join(testDir, `..`, `cordis.patch.yml`), `utf8`)

    expect(pkg.name).toBe(`@doocs/dsh-md`)
    expect(pkg.private).toBeUndefined()
    expect(pkg.publishConfig?.directory).toBe(`dist`)
    expect(definition?.id).toBe(pkg.name)
    expect(patch).toContain(`name: '${pkg.name}'`)
    expect(typeof definition?.factory).toBe(`function`)
  })

  it(`注册侧边栏入口与主面板`, async () => {
    const registered = applyClient(await loadClientDefinition())
    const slots = registered.map(item => item.name)

    expect(slots).toEqual(expect.arrayContaining([`main`, `sidebar.panellist`]))
  })

  it(`主面板 key 与侧边栏 id 一致（点击图标才能切过去）`, async () => {
    const registered = applyClient(await loadClientDefinition())
    const panel = registered.find(item => item.name === `main`)
    const entry = registered.find(item => item.name === `sidebar.panellist`)

    expect(panel?.key).toBeTruthy()
    expect(entry?.id).toBe(panel?.key)
    expect(entry?.label?.()).toBe(`doocs/md`)
  })
})
