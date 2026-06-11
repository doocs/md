import type { Context } from 'hono'
import type { Env } from './types'
import { isAfdianConfigured, queryOrder } from './afdian'
import { activateProFromOrder, parseGithubLoginFromRemark } from './plan'

interface WebhookBody {
  ec?: number
  em?: string
  data?: {
    type?: string
    order?: { out_trade_no?: string }
  }
}

type WebhookContext = Context<{ Bindings: Env }>

/**
 * 爱发电订单 Webhook。
 *
 * 安全要点（本服务代码公开托管，回调地址与逻辑均可被获知）：
 * 1. 可选路径密钥 `AFDIAN_WEBHOOK_TOKEN`，防止公开端点被任意调用 / 刷量。
 * 2. **绝不信任回调 body 中的订单内容**：仅取 `out_trade_no`，再用爱发电
 *    Open API 反查真实订单，以服务端返回为准。这样伪造回调无法开通 Pro。
 */
export async function afdianWebhookHandler(c: WebhookContext) {
  // 1. 可选共享密钥校验（通过 URL 路径段传入，配置在爱发电后台的回调地址中）
  const expectedToken = c.env.AFDIAN_WEBHOOK_TOKEN
  if (expectedToken) {
    const token = c.req.param(`token`)
    if (token !== expectedToken)
      return c.json({ ec: 403, em: `forbidden` }, 403)
  }

  // 未配置爱发电 API 则无法验单，直接忽略（返回 200 避免平台重试）
  if (!isAfdianConfigured(c.env))
    return c.json({ ec: 200, em: `` })

  let body: WebhookBody
  try {
    body = await c.req.json<WebhookBody>()
  }
  catch {
    return c.json({ ec: 400, em: `invalid_body` }, 400)
  }

  if (body.data?.type !== `order` || !body.data.order)
    return c.json({ ec: 200, em: `` })

  const outTradeNo = body.data.order.out_trade_no?.trim()
  if (!outTradeNo)
    return c.json({ ec: 200, em: `` })

  // 2. 关键：以爱发电服务端查询结果为准，杜绝伪造回调
  const order = await queryOrder(c.env, outTradeNo)
  if (!order || order.status !== 2)
    return c.json({ ec: 200, em: `` })

  const githubLogin = parseGithubLoginFromRemark(order.remark ?? ``)
  if (!githubLogin) {
    // 无备注无法自动绑定，仍返回 200 避免平台重试
    return c.json({ ec: 200, em: `` })
  }

  await activateProFromOrder(c.env, order, githubLogin)
  return c.json({ ec: 200, em: `` })
}
