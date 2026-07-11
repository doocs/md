import { WorkerEntrypoint } from 'cloudflare:workers'

const MP_HOST = `https://api.weixin.qq.com`

export default class extends WorkerEntrypoint {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // e.g. /cgi-bin/stable_token → https://api.weixin.qq.com/cgi-bin/stable_token
    const targetUrl = `${MP_HOST}${url.pathname}${url.search}`

    const headers = new Headers(request.headers)

    headers.delete(`host`)
    headers.delete(`content-length`)
    headers.delete(`cf-connecting-ip`)
    headers.delete(`x-forwarded-for`)

    const init: RequestInit = {
      method: request.method,
      headers,
      redirect: `follow`,
    }

    if (request.method !== `GET` && request.method !== `HEAD`) {
      init.body = request.body
    }

    try {
      const resp = await fetch(targetUrl, init)

      const respHeaders = new Headers(resp.headers)
      respHeaders.set(`Access-Control-Allow-Origin`, `*`)
      respHeaders.set(`Access-Control-Allow-Headers`, `*`)

      return new Response(resp.body, {
        status: resp.status,
        headers: respHeaders,
      })
    }
    catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': `application/json` },
      })
    }
  }
}
