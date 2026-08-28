import { describe, expect, it } from 'vitest'
import { readAIJSONResponse, resolveEndpointUrl } from './useAIFetch'

describe(`resolveEndpointUrl`, () => {
  it(`appends chat completions to a versioned base URL`, () => {
    expect(resolveEndpointUrl(`https://api.openai.com/v1`, `chat`))
      .toBe(`https://api.openai.com/v1/chat/completions`)
  })

  it(`appends image generations to a versioned base URL`, () => {
    expect(resolveEndpointUrl(`https://api.openai.com/v1/`, `image`))
      .toBe(`https://api.openai.com/v1/images/generations`)
  })

  it(`builds /models from a versioned base URL`, () => {
    expect(resolveEndpointUrl(`https://api.openai.com/v1`, `models`))
      .toBe(`https://api.openai.com/v1/models`)
  })

  it(`does not duplicate an existing /models path`, () => {
    expect(resolveEndpointUrl(`https://api.openai.com/v1/models`, `models`))
      .toBe(`https://api.openai.com/v1/models`)
  })

  it(`strips chat completions before appending /models`, () => {
    expect(resolveEndpointUrl(`https://api.openai.com/v1/chat/completions`, `models`))
      .toBe(`https://api.openai.com/v1/models`)
  })

  it(`strips image generations before appending /models`, () => {
    expect(resolveEndpointUrl(`https://api.openai.com/v1/images/generations`, `models`))
      .toBe(`https://api.openai.com/v1/models`)
  })
})

describe(`readAIJSONResponse`, () => {
  it(`parses JSON success bodies`, async () => {
    const res = new Response(`{"ok":true}`, { status: 200, statusText: `OK` })
    await expect(readAIJSONResponse<{ ok: boolean }>(res)).resolves.toEqual({
      ok: true,
      status: 200,
      statusText: `OK`,
      data: { ok: true },
      errorText: ``,
    })
  })

  it(`returns the raw body when JSON parsing fails`, async () => {
    const res = new Response(`<html>nope</html>`, { status: 200, statusText: `OK` })
    await expect(readAIJSONResponse(res)).resolves.toEqual({
      ok: false,
      status: 200,
      statusText: `OK`,
      data: null,
      errorText: `<html>nope</html>`,
    })
  })
})
