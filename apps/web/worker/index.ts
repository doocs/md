import { WorkerEntrypoint } from 'cloudflare:workers'

const MP_HOST = `https://api.weixin.qq.com`

export default class extends WorkerEntrypoint {
  async fetch(request: Request): Promise<Response> {
    // 1️⃣ 获取原请求 URL 与路径
    const url = new URL(request.url)

    // 拼接转发目标，例如请求 /cgi-bin/stable_token 就会转发到
    // https://api.weixin.qq.com/cgi-bin/stable_token
    const targetUrl = `${MP_HOST}${url.pathname}${url.search}`

    // 2️⃣ 克隆请求头
    const headers = new Headers(request.headers)

    // 可选：删除或修改一些可能引起冲突的头
    headers.delete(`host`)
    headers.delete(`content-length`)
    headers.delete(`cf-connecting-ip`)
    headers.delete(`x-forwarded-for`)

    // 3️⃣ 构造新的请求
    const init: RequestInit = {
      method: request.method,
      headers,
      redirect: `follow`,
    }

    // ⚙️ 特别处理带 body 的请求（POST/PUT 等）
    if (request.method !== `GET` && request.method !== `HEAD`) {
      // 对文件上传、JSON、表单都可直接转发
      init.body = request.body
    }

    try {
      // 4️⃣ 发起转发请求
      const resp = await fetch(targetUrl, init)

      // 5️⃣ 克隆返回的响应头
      const respHeaders = new Headers(resp.headers)
      // 可选：允许跨域访问（如果你需要在网页端调用）
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
