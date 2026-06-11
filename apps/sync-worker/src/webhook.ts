import type { Context } from 'hono'
import type { AfdianOrder } from './afdian'
import type { Env } from './types'
import { activateProFromOrder, parseGithubLoginFromRemark } from './plan'

interface WebhookBody {
  ec?: number
  em?: string
  data?: {
    type?: string
    order?: AfdianOrder
  }
}

type WebhookContext = Context<{ Bindings: Env }>

export async function afdianWebhookHandler(c: WebhookContext) {
  let body: WebhookBody
  try {
    body = await c.req.json<WebhookBody>()
  }
  catch {
    return c.json({ ec: 400, em: `invalid_body` }, 400)
  }

  if (body.data?.type !== `order` || !body.data.order)
    return c.json({ ec: 200, em: `` })

  const order = body.data.order
  if (order.status !== 2)
    return c.json({ ec: 200, em: `` })

  const githubLogin = parseGithubLoginFromRemark(order.remark ?? ``)
  if (!githubLogin) {
    // 无备注无法自动绑定，仍返回 200 避免平台重试
    return c.json({ ec: 200, em: `` })
  }

  await activateProFromOrder(c.env, order, githubLogin)
  return c.json({ ec: 200, em: `` })
}
