/**
 * @typedef {object} Env
 * @property
 */

export default {
  /**
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} ctx
   * @returns {Promise<Response>}
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const targetUrl = `https://api.weixin.qq.com`
    const proxyRequest = new Request(targetUrl + url.pathname + url.search, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    })
    const response = await fetch(proxyRequest)
    const proxyResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
    setCorsHeaders(proxyResponse.headers)
    return proxyResponse
  },
}
// 设置 CORS 头部
function setCorsHeaders(headers) {
  headers.set(`Access-Control-Allow-Origin`, `*`)
  headers.set(`Access-Control-Allow-Methods`, `GET, POST, PUT, DELETE`)
  headers.set(`Access-Control-Allow-Headers`, `*`)
}
