export const MP_HOST = `https://api.weixin.qq.com`

export function jsonResponse(value: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(value), {
    headers: { 'Content-Type': `application/json`, ...init.headers },
    ...init,
  })
}
