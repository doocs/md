import type { Env } from './types'
import { describe, expect, it } from 'vitest'
import { getAdminLogins, isAdmin } from './marketplace-admin'
import {
  bumpMarketplaceVersion,
  compareMarketplaceVersions,
  INITIAL_MARKETPLACE_VERSION,
  validatePublishComponent,
  validatePublishTheme,
  validateThemeCss,
  validateUpdate,
} from './marketplace-validate'

function envWithAdmins(logins: string): Env {
  return { ADMIN_GITHUB_LOGINS: logins } as Env
}

describe(`marketplace-admin`, () => {
  it(`parses comma-separated admin logins case-insensitively`, () => {
    const set = getAdminLogins(envWithAdmins(`Alice, Bob ,`))
    expect(set.has(`alice`)).toBe(true)
    expect(set.has(`bob`)).toBe(true)
    expect(isAdmin(envWithAdmins(`Alice`), `alice`)).toBe(true)
    expect(isAdmin(envWithAdmins(`Alice`), `carol`)).toBe(false)
    expect(isAdmin(envWithAdmins(``), `alice`)).toBe(false)
  })
})

describe(`validateThemeCss`, () => {
  it(`accepts plain css`, () => {
    const result = validateThemeCss(`h1 { color: red; }`)
    expect(result.ok).toBe(true)
  })

  it(`rejects @import and external url()`, () => {
    expect(validateThemeCss(`@import url("x.css");`).ok).toBe(false)
    expect(validateThemeCss(`.a { background: url(https://evil.test/x.png); }`).ok).toBe(false)
  })
})

describe(`validatePublishTheme`, () => {
  it(`requires slug, name and css`, () => {
    expect(validatePublishTheme({}).ok).toBe(false)
    expect(validatePublishTheme({ slug: `My Theme`, name: `x`, css: `a{}` }).ok).toBe(false)
    const ok = validatePublishTheme({
      slug: `my-theme`,
      name: `My Theme`,
      css: `h2 { color: blue; }`,
      primaryColor: `#0F4C81`,
      version: `9.9.9`,
    })
    expect(ok.ok).toBe(true)
    if (ok.ok) {
      expect(ok.value.type).toBe(`theme`)
      expect(ok.value.slug).toBe(`my-theme`)
      expect(ok.value.version).toBe(INITIAL_MARKETPLACE_VERSION)
    }
  })
  it(`stores custom sample markdown and treats empty as null`, () => {
    const withSample = validatePublishTheme({
      slug: `my-theme`,
      name: `My Theme`,
      css: `h2 { color: blue; }`,
      primaryColor: `#0F4C81`,
      sampleMarkdown: `# Hello\n\nWorld`,
    })
    expect(withSample.ok).toBe(true)
    if (withSample.ok)
      expect(withSample.value.sampleMarkdown).toBe(`# Hello\n\nWorld`)

    const emptySample = validatePublishTheme({
      slug: `my-theme`,
      name: `My Theme`,
      css: `h2 { color: blue; }`,
      primaryColor: `#0F4C81`,
      sampleMarkdown: `   `,
    })
    expect(emptySample.ok).toBe(true)
    if (emptySample.ok)
      expect(emptySample.value.sampleMarkdown).toBeNull()
  })
})

describe(`validatePublishComponent`, () => {
  it(`requires PascalCase name and safe template`, () => {
    const bad = validatePublishComponent({
      slug: `tip`,
      name: `Tip`,
      component: {
        name: `bad-name`,
        template: `<div>x</div>`,
        props: [],
      },
    })
    expect(bad.ok).toBe(false)

    const unsafe = validatePublishComponent({
      slug: `tip`,
      name: `Tip`,
      component: {
        name: `TipBlock`,
        template: `<script>alert(1)</script>`,
        props: [],
      },
    })
    expect(unsafe.ok).toBe(false)

    const ok = validatePublishComponent({
      slug: `tip-block`,
      name: `Tip`,
      component: {
        name: `TipBlock`,
        template: `<section>{{text}}</section>`,
        props: [{ name: `text`, type: `string` }],
      },
    })
    expect(ok.ok).toBe(true)
    if (ok.ok)
      expect(ok.value.version).toBe(INITIAL_MARKETPLACE_VERSION)
  })
})

describe(`validateUpdate`, () => {
  it(`rejects empty patch`, () => {
    expect(validateUpdate(`theme`, {}).ok).toBe(false)
  })

  it(`accepts css update for themes`, () => {
    const result = validateUpdate(`theme`, { css: `p { margin: 0; }` })
    expect(result.ok).toBe(true)
    if (result.ok)
      expect(result.value.payload).toContain(`margin`)
  })

  it(`auto-bumps version and ignores client version`, () => {
    const ok = validateUpdate(`theme`, {
      version: `9.9.9`,
      css: `p { color: red; }`,
    }, { currentVersion: `1.0.0` })
    expect(ok.ok).toBe(true)
    if (ok.ok)
      expect(ok.value.version).toBe(`1.0.1`)
  })
})

describe(`bumpMarketplaceVersion`, () => {
  it(`increments by 0.0.1 with base-10 carry`, () => {
    expect(bumpMarketplaceVersion()).toBe(`1.0.0`)
    expect(bumpMarketplaceVersion(`1.0.0`)).toBe(`1.0.1`)
    expect(bumpMarketplaceVersion(`1.0.9`)).toBe(`1.1.0`)
    expect(bumpMarketplaceVersion(`1.9.9`)).toBe(`2.0.0`)
    expect(compareMarketplaceVersions(`1.1.0`, `1.0.9`)).toBeGreaterThan(0)
  })
})
