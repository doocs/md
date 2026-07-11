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
 * Afdian order webhook.
 *
 * Security (this service is publicly hosted; callback URL and logic are discoverable):
 * 1. Optional path token `AFDIAN_WEBHOOK_TOKEN` to block arbitrary calls / abuse.
 * 2. **Never trust order fields in the callback body**: read only `out_trade_no`, then
 *    re-fetch the order via the Afdian Open API and treat that response as authoritative.
 *    Forged callbacks cannot grant Pro.
 */
export async function afdianWebhookHandler(c: WebhookContext) {
  const expectedToken = c.env.AFDIAN_WEBHOOK_TOKEN
  if (expectedToken) {
    const token = c.req.param(`token`)
    if (token !== expectedToken)
      return c.json({ ec: 403, em: `forbidden` }, 403)
  }

  // Cannot verify orders without Afdian API config; return 200 to avoid platform retries
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

  const order = await queryOrder(c.env, outTradeNo)
  if (!order || order.status !== 2)
    return c.json({ ec: 200, em: `` })

  const githubLogin = parseGithubLoginFromRemark(order.remark ?? ``)
  if (!githubLogin) {
    // No GitHub login in remark; return 200 to avoid platform retries
    return c.json({ ec: 200, em: `` })
  }

  await activateProFromOrder(c.env, order, githubLogin)
  return c.json({ ec: 200, em: `` })
}
