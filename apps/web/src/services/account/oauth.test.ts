import { describe, expect, it } from 'vitest'
import { parseOAuthHash, stripOAuthHashParams } from './oauth'

describe(`parseOAuthHash`, () => {
  it(`reads the account token`, () => {
    expect(parseOAuthHash(`#account_token=jwt-token`)).toEqual({
      token: `jwt-token`,
      error: null,
    })
  })

  it(`reads a cancelled-login error`, () => {
    expect(parseOAuthHash(`oauth_error=access_denied`)).toEqual({
      token: null,
      error: `access_denied`,
    })
  })

  it(`returns empty values when the hash has neither token nor error`, () => {
    expect(parseOAuthHash(``)).toEqual({ token: null, error: null })
  })
})

describe(`stripOAuthHashParams`, () => {
  it(`removes token and error while keeping unrelated params`, () => {
    expect(stripOAuthHashParams(`#account_token=jwt&foo=1&oauth_error=access_denied`))
      .toBe(`foo=1`)
  })

  it(`returns an empty string when only oauth params are present`, () => {
    expect(stripOAuthHashParams(`account_token=jwt`)).toBe(``)
  })
})
