import type { Env } from './types'
import { describe, expect, it } from 'vitest'
import {
  allowedPatterns,
  defaultOrigin,
  isAllowedOrigin,
  isBrowserExtensionOrigin,
  matchPattern,
  resolveRedirect,
} from './origin'

function env(appUrl: string): Env {
  return { APP_URL: appUrl } as Env
}

describe(`isBrowserExtensionOrigin`, () => {
  it(`accepts chrome and firefox extension origins`, () => {
    expect(isBrowserExtensionOrigin(`chrome-extension://abcdef`)).toBe(true)
    expect(isBrowserExtensionOrigin(`moz-extension://abcdef`)).toBe(true)
  })

  it(`rejects http origins and empty values`, () => {
    expect(isBrowserExtensionOrigin(`https://md.doocs.org`)).toBe(false)
    expect(isBrowserExtensionOrigin(``)).toBe(false)
    expect(isBrowserExtensionOrigin(null)).toBe(false)
  })
})

describe(`matchPattern`, () => {
  it(`matches exact origins`, () => {
    expect(matchPattern(`https://md.doocs.org`, `https://md.doocs.org`)).toBe(true)
  })

  it(`matches single-label wildcards`, () => {
    expect(matchPattern(`https://abc--doocs-md.netlify.app`, `https://*--doocs-md.netlify.app`)).toBe(true)
    expect(matchPattern(`http://localhost:5173`, `http://localhost:*`)).toBe(true)
    expect(matchPattern(`https://evil.com`, `https://*--doocs-md.netlify.app`)).toBe(false)
  })
})

describe(`origin helpers`, () => {
  const e = env(`https://md.doocs.org, https://*--doocs-md.netlify.app`)

  it(`parses allowed patterns`, () => {
    expect(allowedPatterns(e)).toEqual([
      `https://md.doocs.org`,
      `https://*--doocs-md.netlify.app`,
    ])
  })

  it(`checks whitelist membership`, () => {
    expect(isAllowedOrigin(e, `https://md.doocs.org`)).toBe(true)
    expect(isAllowedOrigin(e, `https://preview--doocs-md.netlify.app`)).toBe(true)
    expect(isAllowedOrigin(e, `https://evil.example`)).toBe(false)
  })

  it(`picks a non-wildcard default origin`, () => {
    expect(defaultOrigin(e)).toBe(`https://md.doocs.org`)
  })

  it(`resolves redirect URLs against the whitelist`, () => {
    expect(resolveRedirect(e, `https://md.doocs.org/editor`)).toBe(`https://md.doocs.org/editor`)
    expect(resolveRedirect(e, `https://evil.example/x`)).toBe(`https://md.doocs.org`)
    expect(resolveRedirect(e, null)).toBe(`https://md.doocs.org`)
  })
})
