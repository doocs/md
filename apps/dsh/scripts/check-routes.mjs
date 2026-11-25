#!/usr/bin/env node
/**
 * @description: 路由自检：不启动 DSH、不占端口，直接拿假 req/res 跑插件注册的处理器
 *
 * 覆盖：
 *   - `/md-wechat/editor/`            编辑器入口（200 + 带站点前缀）
 *   - `/md-wechat/editor/static/...`  静态资源（200）
 *   - 不存在的资源、路径穿越          404
 *   - `/md-wechat/api/options`        拒绝未授权请求（没有 connection 服务时 403）
 *
 * 用法：node apps/dsh/scripts/check-routes.mjs
 */

import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { resolveLayout } from './lib/build.mjs'

const layout = resolveLayout(import.meta.url)

/**
 * 断言
 * @param {boolean} condition 条件
 * @param {string} message 失败信息
 * @returns {void}
 */
function assert(condition, message) {
  if (!condition)
    throw new Error(`✖ ${message}`)

  console.log(`✔ ${message}`)
}

/**
 * 造一个最小响应对象
 * @returns {any} 假 ServerResponse
 */
function createResponse() {
  /** @type {Buffer[]} */
  const chunks = []

  return {
    status: 0,
    headers: /** @type {Record<string, string>} */ ({}),
    headersSent: false,
    /**
     * 写响应头
     * @param {number} status 状态码
     * @param {Record<string, string>} [headers] 头部
     * @returns {any} 自身
     */
    writeHead(status, headers) {
      this.status = status
      this.headers = headers ?? {}
      this.headersSent = true
      return this
    },
    /**
     * 结束响应
     * @param {any} [chunk] 响应体
     * @returns {void}
     */
    end(chunk) {
      if (chunk)
        chunks.push(Buffer.from(chunk))
    },
    text() {
      return Buffer.concat(chunks).toString(`utf8`)
    },
    bytes() {
      return Buffer.concat(chunks)
    },
  }
}

/**
 * 调一次处理器
 * @param {Function} handler 处理器
 * @param {string} url 请求路径
 * @param {{method?: string, body?: string, headers?: Record<string, string>}} [options] 选项
 * @returns {Promise<any>} 响应
 */
async function call(handler, url, options = {}) {
  const res = createResponse()
  const body = options.body
  /** @type {any} */
  const req = {
    method: options.method ?? `GET`,
    url,
    headers: { host: `127.0.0.1`, ...options.headers },
  }

  if (body !== undefined) {
    req[Symbol.asyncIterator] = async function* iterate() {
      yield Buffer.from(body)
    }
  }

  await handler(req, res)

  return res
}

const entry = path.join(layout.distDir, `index.js`)
const plugin = await import(pathToFileURL(entry).href)

/** @type {Array<{path: string, handler: Function}>} */
const routes = []
const ctx = {
  get: (/** @type {string} */ name) => (name === `webServer`
    ? {
        /**
         * 收集路由注册
         * @param {{path: string, handler: Function}} route 路由
         * @returns {() => void} 注销函数
         */
        register: (route) => {
          routes.push(route)
          return () => {}
        },
      }
    : undefined),
  effect: (/** @type {() => any} */ callback) => callback() ?? (() => {}),
  inject: (/** @type {string[]} */ _names, /** @type {(ctx: any) => void} */ callback) => {
    callback(ctx)
    return () => {}
  },
  tools: { register: () => () => {} },
}

plugin.apply(ctx)

assert(routes.length === 1 && routes[0].path === `/md-wechat`, `注册了一个 /md-wechat 前缀路由（实际 ${routes.map(r => r.path).join(`, `)}）`)

const handler = routes[0].handler

/* ---------- 编辑器 ---------- */

const index = await call(handler, `/md-wechat/editor/`)

assert(index.status === 200, `编辑器入口返回 200（实际 ${index.status}）`)
assert(String(index.headers[`content-type`]).startsWith(`text/html`), `编辑器入口 content-type 是 text/html`)
assert(index.text().includes(`/md-wechat/editor/static/`), `编辑器入口带 /md-wechat/editor/ 站点前缀`)

const mathjax = await call(handler, `/md-wechat/editor/static/libs/mathjax/tex-svg.js`)

assert(mathjax.status === 200, `本地 MathJax 可访问（实际 ${mathjax.status}）`)
assert(mathjax.bytes().length > 1000, `本地 MathJax 有内容（${mathjax.bytes().length} 字节）`)

const missing = await call(handler, `/md-wechat/editor/static/js/not-here.js`)

assert(missing.status === 404, `不存在的资源返回 404（实际 ${missing.status}）`)

const traversal = await call(handler, `/md-wechat/editor/..%2fpackage.json`)

assert(traversal.status === 404, `路径穿越被拒绝（实际 ${traversal.status}）`)

/* ---------- API ---------- */

const optionsRes = await call(handler, `/md-wechat/api/options`)

assert(optionsRes.status === 403, `没有 connection 服务时 API 拒绝未授权请求（实际 ${optionsRes.status}）`)

/* ---------- 产物完整性 ---------- */

const manifest = JSON.parse(await readFile(path.join(layout.distDir, `package.json`), `utf8`))

assert(manifest.dsh?.client?.platform === `web`, `清单声明了 dsh.client.platform = "web"`)
assert(manifest.files?.includes(`editor/**/*`), `清单的 files 覆盖编辑器产物`)

console.log(`\n[dsh] 路由自检通过`)
