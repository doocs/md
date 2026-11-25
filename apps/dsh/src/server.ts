/**
 * @description: 浏览器半片用的 HTTP 接口与编辑器静态站点
 *
 *   GET  /md-wechat/editor/...    → 随包分发的 doocs/md 编辑器（面板用 iframe 打开）
 *   GET  /md-wechat/api/options   → 主题、配色、字号等预设
 *   POST /md-wechat/api/render    → { markdown, ...样式参数 } → { html, words, minutes, warnings }
 *
 * 编辑器是 `apps/web` 的原样构建产物（见 scripts/build-editor.mjs），
 * 渲染接口则在 Host 进程里跑 md 渲染管线，浏览器只负责展示与复制。
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { colorOptions, fontSizeOptions, legendOptions, lineHeightOptions } from './presets'
import { listThemes, renderArticle } from './render'

/** API 前缀（与 client.js 里的常量保持一致） */
export const ROUTE_PREFIX = `/md-wechat`

/** 编辑器 iframe 的前缀（scripts/build-editor.mjs 用同一个值） */
export const EDITOR_PREFIX = `/md-wechat/editor`

/** 编辑器产物目录：与打包后的 index.js 同级；测试可用环境变量指向 fixture */
const EDITOR_ROOT = process.env.MD_WECHAT_EDITOR_DIR ?? path.join(import.meta.dirname, `editor`)

/** 常见静态资源的 content-type */
const MIME_TYPES: Record<string, string> = {
  '.css': `text/css; charset=utf-8`,
  '.html': `text/html; charset=utf-8`,
  '.ico': `image/x-icon`,
  '.jpeg': `image/jpeg`,
  '.jpg': `image/jpeg`,
  '.js': `text/javascript; charset=utf-8`,
  '.json': `application/json; charset=utf-8`,
  '.map': `application/json; charset=utf-8`,
  '.mjs': `text/javascript; charset=utf-8`,
  '.png': `image/png`,
  '.svg': `image/svg+xml`,
  '.ttf': `font/ttf`,
  '.txt': `text/plain; charset=utf-8`,
  '.wasm': `application/wasm`,
  '.webp': `image/webp`,
  '.woff': `font/woff`,
  '.woff2': `font/woff2`,
}

/** 请求体上限：一篇文章远用不到 2 MB */
const MAX_BODY_BYTES = 2 * 1024 * 1024

/** 只描述用到的 webServer 能力 */
interface WebServerLike {
  register: (route: {
    kind: `prefix`
    path: string
    handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
  }) => () => void
}

/** 只描述用到的 connection 能力 */
interface ConnectionLike {
  requestRejection?: (init: { headers: IncomingMessage[`headers`] }) => number | undefined
}

/** 插件上下文里用到的部分 */
interface RouteContext {
  get: (name: string) => unknown
}

/**
 * 写出 JSON 响应
 * @param {ServerResponse} res 响应
 * @param {number} status 状态码
 * @param {unknown} body 响应体
 * @returns {void}
 */
function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body)

  res.writeHead(status, {
    'content-type': `application/json; charset=utf-8`,
    'cache-control': `no-store`,
    'content-length': Buffer.byteLength(payload),
  })
  res.end(payload)
}

/**
 * 读取请求体（带体积上限）
 * @param {IncomingMessage} req 请求
 * @returns {Promise<string>} UTF-8 文本
 */
async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  let size = 0

  for await (const chunk of req) {
    const buffer = Buffer.from(chunk as Buffer)

    size += buffer.length

    if (size > MAX_BODY_BYTES)
      throw new Error(`请求体超过 ${MAX_BODY_BYTES} 字节`)

    chunks.push(buffer)
  }

  return Buffer.concat(chunks).toString(`utf-8`)
}

/**
 * 校验请求来源：拿不到连接服务时一律拒绝
 * @param {RouteContext} ctx 插件上下文
 * @param {IncomingMessage} req 请求
 * @returns {number} 拒绝时返回状态码，放行时为 0
 */
function rejectionOf(ctx: RouteContext, req: IncomingMessage): number {
  const connection = ctx.get(`connection`) as ConnectionLike | undefined

  if (typeof connection?.requestRejection !== `function`)
    return 403

  return connection.requestRejection({ headers: req.headers }) ?? 0
}

/** GET /api/options 的返回：面板下拉框需要的预设 */
function optionsPayload() {
  return {
    themes: listThemes(),
    colors: colorOptions,
    fontSizes: fontSizeOptions,
    lineHeights: lineHeightOptions,
    legends: legendOptions,
  }
}

/**
 * 创建 `/md-wechat` 路由处理器
 * @param {RouteContext} ctx 插件上下文
 * @returns {(req: IncomingMessage, res: ServerResponse) => Promise<void>} 处理器
 */
export function createRouteHandler(ctx: RouteContext) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
      const rejection = rejectionOf(ctx, req)

      if (rejection) {
        sendJson(res, rejection, { error: `未授权` })

        return
      }

      const url = new URL(req.url ?? `/`, `http://127.0.0.1`)
      const rest = url.pathname.slice(ROUTE_PREFIX.length)

      if (rest === `/api/options`) {
        if (req.method !== `GET`) {
          sendJson(res, 405, { error: `只支持 GET` })

          return
        }

        sendJson(res, 200, optionsPayload())

        return
      }

      if (rest === `/api/render`) {
        if (req.method !== `POST`) {
          sendJson(res, 405, { error: `只支持 POST` })

          return
        }

        const raw = await readBody(req)

        let input: Record<string, unknown>
        try {
          input = JSON.parse(raw) as Record<string, unknown>
        }
        catch {
          sendJson(res, 400, { error: `请求体不是合法 JSON` })

          return
        }

        const markdown = typeof input.markdown === `string` ? input.markdown : ``

        if (markdown.trim().length === 0) {
          sendJson(res, 400, { error: `markdown 不能为空` })

          return
        }

        const result = await renderArticle({
          markdown,
          theme: typeof input.theme === `string` ? input.theme : undefined,
          primaryColor: typeof input.primaryColor === `string` ? input.primaryColor : undefined,
          fontSize: typeof input.fontSize === `string` ? input.fontSize : undefined,
          lineHeight: typeof input.lineHeight === `string` ? input.lineHeight : undefined,
          legend: typeof input.legend === `string` ? input.legend : undefined,
          isUseIndent: input.isUseIndent === true,
          isUseJustify: input.isUseJustify === true,
          countStatus: input.countStatus === true,
          themeMode: input.themeMode === `dark` ? `dark` : `light`,
        })

        sendJson(res, 200, {
          html: result.html,
          words: result.readingTime.words,
          minutes: result.readingTime.minutes,
          theme: typeof input.theme === `string` ? input.theme : `default`,
          warnings: result.warnings,
        })

        return
      }

      sendJson(res, 404, { error: `接口不存在` })
    }
    catch (error) {
      if (res.headersSent) {
        res.end()

        return
      }

      sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) })
    }
  }
}

/**
 * 静态响应一个文件
 * @param {ServerResponse} res 响应
 * @param {string} file 文件绝对路径
 * @param {string} relative 相对路径（用于判断缓存策略）
 * @returns {Promise<void>}
 */
async function sendFile(res: ServerResponse, file: string, relative: string): Promise<void> {
  const body = await readFile(file).catch(() => null)

  if (!body) {
    sendJson(res, 404, { error: `资源不存在` })

    return
  }

  const extension = path.extname(file).toLowerCase()
  const immutable = /(?:^|\/)static\//.test(relative)

  res.writeHead(200, {
    'content-type': MIME_TYPES[extension] ?? `application/octet-stream`,
    'cache-control': immutable ? `public, max-age=31536000, immutable` : `no-cache`,
    'content-length': body.length,
  })
  res.end(body)
}

/**
 * 创建编辑器静态站点的处理器
 *
 * 只读静态资源，不碰任何仓库数据；跨站请求由浏览器的同源策略与本插件的页面结构约束。
 * @returns {(req: IncomingMessage, res: ServerResponse) => Promise<void>} 处理器
 */
export function createEditorHandler() {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== `GET` && req.method !== `HEAD`) {
      sendJson(res, 405, { error: `只支持 GET/HEAD` })

      return
    }

    try {
      const url = new URL(req.url ?? `/`, `http://127.0.0.1`)
      let relative = decodeURIComponent(url.pathname.slice(EDITOR_PREFIX.length))

      // 防穿越：规范化后不允许跳出产物目录
      relative = path.posix.normalize(relative).replace(/^\/+/, ``)

      if (relative.startsWith(`..`)) {
        sendJson(res, 404, { error: `资源不存在` })

        return
      }

      const rootWithSep = `${EDITOR_ROOT}${path.sep}`
      let target = path.join(EDITOR_ROOT, relative)

      if (relative === `` || relative === `.`)
        target = EDITOR_ROOT

      if (target !== EDITOR_ROOT && !target.startsWith(rootWithSep)) {
        sendJson(res, 404, { error: `资源不存在` })

        return
      }

      const stats = await readFile(target).then(
        () => ({ kind: `file` }),
        error => (error.code === `EISDIR` ? { kind: `dir` } : null),
      )

      if (stats?.kind === `dir`) {
        await sendFile(res, path.join(target, `index.html`), `index.html`)

        return
      }

      if (stats?.kind === `file`) {
        await sendFile(res, target, relative)

        return
      }

      // 没有扩展名的前端路由 → 回落到入口页
      if (!path.extname(relative)) {
        await sendFile(res, path.join(EDITOR_ROOT, `index.html`), `index.html`)

        return
      }

      sendJson(res, 404, { error: `资源不存在` })
    }
    catch (error) {
      if (res.headersSent) {
        res.end()

        return
      }

      sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) })
    }
  }
}

/** 类型导出，供 index.ts 使用 */
export type { WebServerLike }
