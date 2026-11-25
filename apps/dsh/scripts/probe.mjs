#!/usr/bin/env node
/**
 * @description: 探一下正在运行的 DSH 里插件路由是否就绪（不用翻日志）
 *
 * 用法：node apps/dsh/scripts/probe.mjs [http://127.0.0.1:端口]
 * 不给地址时会依次试环境变量 DSH_WEB_URL 和常见端口。
 */

import { Buffer } from 'node:buffer'
import process from 'node:process'

/** 默认候选地址 */
const CANDIDATES = [
  process.argv[2],
  process.env.DSH_WEB_URL,
].filter(Boolean)

/**
 * 探测一条路由
 * @param {string} base 站点根地址
 * @param {string} pathname 路径
 * @returns {Promise<{pathname: string, status: number, bytes: number, note: string}>} 结果
 */
async function probe(base, pathname) {
  try {
    const response = await fetch(new URL(pathname, base), { headers: { accept: `text/html,application/json` } })
    const body = await response.text()

    return {
      pathname,
      status: response.status,
      bytes: Buffer.byteLength(body),
      note: body.includes(`/md-wechat/editor/static/`)
        ? `入口页带站点前缀`
        : (body.includes(`资源不存在`) ? `路由在，但产物缺失` : ``),
    }
  }
  catch (error) {
    return { pathname, status: 0, bytes: 0, note: error instanceof Error ? error.message : String(error) }
  }
}

const base = CANDIDATES[0]

if (!base) {
  console.error(`用法：node apps/dsh/scripts/probe.mjs http://127.0.0.1:<端口>`)
  console.error(`（DSH 页面地址最后一段就是端口，也可以在 DSH 里设置环境变量 DSH_WEB_URL）`)
  process.exitCode = 2
}
else {
  console.log(`探测 ${base}`)

  for (const pathname of [`/md-wechat/editor/`, `/md-wechat/editor/static/libs/mathjax/tex-svg.js`, `/md-wechat/api/options`]) {
    const result = await probe(base, pathname)

    console.log(`  ${pathname} → ${result.status || `连接失败`}${result.bytes ? ` (${result.bytes} 字节)` : ``}${result.note ? ` · ${result.note}` : ``}`)
  }

  console.log(`\n编辑器入口 200 表示 Host 已加载新模块；404 说明还是旧模块，重启一次 DSH。`)
}
