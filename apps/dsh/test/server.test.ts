/**
 * @description: HTTP 层单测：编辑器静态站点 + 渲染接口
 *
 * 用假 req/res 直接调处理函数，不启动服务器、不占端口。
 * 编辑器产物指向 test/fixtures/editor，因此不依赖构建结果。
 */

import { Buffer } from 'node:buffer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(testDir, `..`, `..`, `..`)

process.env.MD_WECHAT_EDITOR_DIR = path.join(testDir, `fixtures`, `editor`)
// 渲染接口内部会读主题样式表：指向源码目录，测试不依赖构建产物
process.env.MD_WECHAT_THEME_DIR = path.join(repoRoot, `packages`, `shared`, `src`, `configs`, `theme-css`)

type Handler = (req: any, res: any) => Promise<void> | void

let editorHandler: Handler
let createApiHandler: (ctx: any) => Handler

beforeAll(async () => {
  const server = await import(`../src/server`)

  editorHandler = server.createEditorHandler() as unknown as Handler
  createApiHandler = server.createRouteHandler as unknown as (ctx: any) => Handler
})

/**
 * 造一个能收集响应的假 ServerResponse
 * @returns {any} 假响应
 */
function createResponse() {
  /** @type {Buffer[]} */
  const chunks: Buffer[] = []

  return {
    status: 0,
    headers: {} as Record<string, string>,
    headersSent: false,
    writeHead(status: number, headers?: Record<string, string>) {
      this.status = status
      this.headers = headers ?? {}
      this.headersSent = true
      return this
    },
    end(chunk?: unknown) {
      if (chunk)
        chunks.push(Buffer.from(chunk as string))
    },
    text: () => Buffer.concat(chunks).toString(`utf8`),
    bytes: () => Buffer.concat(chunks),
  }
}

/**
 * 调一次处理器
 * @param {Handler} handler 处理器
 * @param {string} url 路径
 * @param {{method?: string, body?: string}} [options] 选项
 * @returns {Promise<any>} 响应
 */
async function call(handler: Handler, url: string, options: { method?: string, body?: string } = {}) {
  const res = createResponse()
  const body = options.body
  const req: any = { method: options.method ?? `GET`, url, headers: { host: `127.0.0.1` } }

  if (body !== undefined) {
    req[Symbol.asyncIterator] = async function* iterate() {
      yield Buffer.from(body)
    }
  }

  await handler(req, res)

  return res
}

describe(`编辑器静态站点`, () => {
  it(`入口页返回 HTML 且带站点前缀`, async () => {
    const response = await call(editorHandler, `/md-wechat/editor/`)

    expect(response.status).toBe(200)
    expect(response.headers[`content-type`]).toContain(`text/html`)
    expect(response.text()).toContain(`/md-wechat/editor/static/`)
  })

  it(`静态资源按类型返回并带长缓存`, async () => {
    const response = await call(editorHandler, `/md-wechat/editor/static/app.js`)

    expect(response.status).toBe(200)
    expect(response.headers[`content-type`]).toContain(`javascript`)
    expect(response.headers[`cache-control`]).toContain(`immutable`)
    expect(response.text()).toContain(`__MD_WECHAT_FIXTURE__`)
  })

  it(`不存在的资源返回 404`, async () => {
    const response = await call(editorHandler, `/md-wechat/editor/static/nope.js`)

    expect(response.status).toBe(404)
  })

  it(`拒绝路径穿越`, async () => {
    const response = await call(editorHandler, `/md-wechat/editor/..%2fpackage.json`)

    expect(response.status).toBe(404)
  })

  it(`拒绝非 GET/HEAD 方法`, async () => {
    const response = await call(editorHandler, `/md-wechat/editor/`, { method: `POST` })

    expect(response.status).toBe(405)
  })
})

describe(`渲染接口`, () => {
  const allowed = { get: (name: string) => (name === `connection` ? { requestRejection: () => undefined } : undefined) }
  const denied = { get: (name: string) => (name === `connection` ? { requestRejection: () => 401 } : undefined) }
  const noConnection = { get: () => undefined }

  it(`没有连接服务时一律拒绝`, async () => {
    const response = await call(createApiHandler(noConnection), `/md-wechat/api/options`)

    expect(response.status).toBe(403)
  })

  it(`来源被拒时透传状态码`, async () => {
    const response = await call(createApiHandler(denied), `/md-wechat/api/options`)

    expect(response.status).toBe(401)
  })

  it(`放行后返回预设列表`, async () => {
    const response = await call(createApiHandler(allowed), `/md-wechat/api/options`)

    expect(response.status).toBe(200)

    const payload = JSON.parse(response.text())

    expect(payload.themes).toEqual(expect.arrayContaining([`default`, `grace`, `simple`]))
    expect(payload.colors.length).toBeGreaterThan(0)
  })

  it(`渲染接口返回 HTML 与统计`, async () => {
    const response = await call(createApiHandler(allowed), `/md-wechat/api/render`, {
      method: `POST`,
      body: JSON.stringify({ markdown: `# 标题\n\n正文`, theme: `grace` }),
    })

    expect(response.status).toBe(200)

    const payload = JSON.parse(response.text())

    expect(payload.html).toContain(`<style>`)
    expect(payload.theme).toBe(`grace`)
    expect(payload.words).toBeGreaterThan(0)
  })

  it(`非法 JSON 返回 400`, async () => {
    const response = await call(createApiHandler(allowed), `/md-wechat/api/render`, { method: `POST`, body: `{oops` })

    expect(response.status).toBe(400)
  })

  it(`空 markdown 返回 400`, async () => {
    const response = await call(createApiHandler(allowed), `/md-wechat/api/render`, {
      method: `POST`,
      body: JSON.stringify({ markdown: `   ` }),
    })

    expect(response.status).toBe(400)
  })

  it(`错误的方法返回 405`, async () => {
    const response = await call(createApiHandler(allowed), `/md-wechat/api/render`, { method: `GET` })

    expect(response.status).toBe(405)
  })

  it(`未知接口返回 404`, async () => {
    const response = await call(createApiHandler(allowed), `/md-wechat/api/nope`)

    expect(response.status).toBe(404)
  })
})
