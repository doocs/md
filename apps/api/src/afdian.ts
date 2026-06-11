import type { Env } from './types'
import { createHash } from 'node:crypto'

const DEFAULT_API_BASE = `https://afdian.com/api/open`

export interface AfdianOrder {
  out_trade_no: string
  user_id: string
  plan_id: string
  month: number
  total_amount: string
  show_amount: string
  status: number
  remark: string
  product_type: number
  title?: string
}

interface AfdianApiResponse<T> {
  ec: number
  em: string
  data?: T
}

function apiBase(env: Env): string {
  return (env.AFDIAN_API_BASE ?? DEFAULT_API_BASE).replace(/\/$/, ``)
}

function sign(token: string, params: string, ts: number, userId: string): string {
  const kv = `params${params}ts${ts}user_id${userId}`
  return createHash(`md5`).update(token + kv).digest(`hex`)
}

async function afdianRequest<T>(
  env: Env,
  endpoint: string,
  paramsObj: Record<string, unknown>,
): Promise<AfdianApiResponse<T>> {
  const userId = env.AFDIAN_USER_ID
  const token = env.AFDIAN_API_TOKEN
  if (!userId || !token)
    throw new Error(`afdian_not_configured`)

  const params = JSON.stringify(paramsObj)
  const ts = Math.floor(Date.now() / 1000)
  const body = {
    user_id: userId,
    params,
    ts,
    sign: sign(token, params, ts, userId),
  }

  const res = await fetch(`${apiBase(env)}/${endpoint}`, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify(body),
  })

  return res.json() as Promise<AfdianApiResponse<T>>
}

export async function queryOrder(env: Env, outTradeNo: string): Promise<AfdianOrder | null> {
  const res = await afdianRequest<{ list: AfdianOrder[] }>(env, `query-order`, {
    out_trade_no: outTradeNo,
  })
  if (res.ec !== 200 || !res.data?.list?.length)
    return null
  return res.data.list[0] ?? null
}

export function isAfdianConfigured(env: Env): boolean {
  return Boolean(env.AFDIAN_USER_ID && env.AFDIAN_API_TOKEN)
}

/** 是否为可开通 Pro 的赞助方案订单（product_type=0 为常规方案） */
export function isProEligibleOrder(env: Env, order: AfdianOrder): boolean {
  if (order.status !== 2)
    return false
  // 售卖商品（一次性）也允许开通，按 month 字段折算天数
  if (order.product_type !== 0 && order.product_type !== 1)
    return false

  const planIds = (env.AFDIAN_PRO_PLAN_IDS ?? ``)
    .split(`,`)
    .map(s => s.trim())
    .filter(Boolean)

  if (planIds.length === 0)
    return true

  return planIds.includes(order.plan_id)
}
