import { afterEach, describe, expect, it, vi } from 'vitest'
import fetch from './fetch'

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    ...init,
    headers: { 'content-type': `application/json`, ...init?.headers },
  })
}

function stubFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  const mock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => Promise.resolve(handler(String(input), init)))
  vi.stubGlobal(`fetch`, mock)
  return mock
}

describe(`fetch utils`, () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it(`parses application/json responses`, async () => {
    stubFetch(() => jsonResponse({ url: `https://example.com/a.png` }))

    const res = await fetch<any, { url: string }>(`https://api.example.com/upload`, { method: `POST` })
    expect(res.url).toBe(`https://example.com/a.png`)
  })

  // Regression test for doocs/md#1877: WeChat media/uploadimg answers a JSON
  // body with Content-Type text/plain, which must still be parsed as JSON
  it(`parses JSON bodies returned with a text/plain Content-Type`, async () => {
    stubFetch(() => new Response(JSON.stringify({ url: `https://mmbiz.qpic.cn/pic` }), {
      status: 200,
      headers: { 'content-type': `text/plain` },
    }))

    const res = await fetch<any, { url: string }>(`https://api.weixin.qq.com/cgi-bin/media/uploadimg`, { method: `POST` })
    expect(res.url).toBe(`https://mmbiz.qpic.cn/pic`)
  })

  it(`returns non-JSON text bodies as strings`, async () => {
    stubFetch(() => new Response(`plain text`, {
      status: 200,
      headers: { 'content-type': `text/plain` },
    }))

    const res = await fetch(`https://api.example.com/raw`)
    expect(res).toBe(`plain text`)
  })

  it(`keeps malformed JSON-looking text as a string`, async () => {
    stubFetch(() => new Response(`{broken`, {
      status: 200,
      headers: { 'content-type': `text/plain` },
    }))

    const res = await fetch(`https://api.example.com/raw`)
    expect(res).toBe(`{broken`)
  })

  it(`rejects on empty response bodies`, async () => {
    stubFetch(() => new Response(``, {
      status: 200,
      headers: { 'content-type': `text/plain` },
    }))

    await expect(fetch(`https://api.example.com/empty`)).rejects.toThrow(`Empty response`)
  })

  it(`rejects with the status code on non-OK responses`, async () => {
    stubFetch(() => jsonResponse({ errcode: 40013 }, { status: 401 }))

    await expect(fetch(`https://api.example.com/fail`)).rejects.toThrow(`Request failed with status 401`)
  })

  it(`serializes object bodies as JSON with a Content-Type header`, async () => {
    const mock = stubFetch(() => jsonResponse({ ok: true }))

    await fetch(`https://api.example.com/post`, { method: `POST`, data: { a: 1 } })

    const init = mock.mock.calls[0][1]
    expect(init?.body).toBe(JSON.stringify({ a: 1 }))
    expect((init?.headers as Record<string, string>)[`Content-Type`]).toBe(`application/json`)
  })

  it(`passes FormData bodies through without a manual Content-Type`, async () => {
    const mock = stubFetch(() => jsonResponse({ ok: true }))

    const form = new FormData()
    form.append(`media`, new Blob([`x`]), `a.png`)
    await fetch(`https://api.example.com/upload`, {
      method: `POST`,
      headers: { 'content-type': `multipart/form-data` },
      data: form,
    })

    const init = mock.mock.calls[0][1]
    expect(init?.body).toBe(form)
    expect((init?.headers as Record<string, string>)[`content-type`]).toBeUndefined()
  })
})
