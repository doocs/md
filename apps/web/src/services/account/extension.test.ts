// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
  extractOAuthTokenFromUrl,
  isExtensionContext,
} from './extension'

describe(`isExtensionContext`, () => {
  it(`returns false for http(s) pages`, () => {
    Object.defineProperty(window, `location`, {
      value: { protocol: `https:` },
      configurable: true,
    })
    expect(isExtensionContext()).toBe(false)
  })

  it(`returns false for extension protocol without runtime id`, () => {
    Object.defineProperty(window, `location`, {
      value: { protocol: `chrome-extension:` },
      configurable: true,
    })
    expect(isExtensionContext()).toBe(false)
  })

  it(`returns true for extension protocol with runtime id`, () => {
    Object.defineProperty(window, `location`, {
      value: { protocol: `chrome-extension:` },
      configurable: true,
    })
    ;(globalThis as { chrome?: { runtime?: { id?: string } } }).chrome = {
      runtime: { id: `test-extension-id` },
    }
    expect(isExtensionContext()).toBe(true)
    delete (globalThis as { chrome?: unknown }).chrome
  })
})

describe(`extractOAuthTokenFromUrl`, () => {
  it(`reads account_token from hash`, () => {
    expect(extractOAuthTokenFromUrl(`https://abc.chromiumapp.org/#account_token=jwt-token`))
      .toBe(`jwt-token`)
  })

  it(`returns null when token is missing`, () => {
    expect(extractOAuthTokenFromUrl(`https://abc.chromiumapp.org/#other=value`))
      .toBeNull()
  })
})
