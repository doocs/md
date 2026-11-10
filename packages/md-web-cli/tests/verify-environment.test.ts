import { describe, expect, it } from 'vitest'
import { findSystemChrome, isCiEnvironment, systemChromeCandidates } from '../../../scripts/verify/environment.mjs'

/**
 * The verify gate changes browser selection based on these helpers, so the
 * detection rules are pinned independently of any browser launch.
 */
describe(`isCiEnvironment`, () => {
  it(`is local with an empty environment`, () => {
    expect(isCiEnvironment({})).toBe(false)
  })

  it(`honours the CI convention`, () => {
    expect(isCiEnvironment({ CI: `true` })).toBe(true)
    expect(isCiEnvironment({ CI: `1` })).toBe(true)
    expect(isCiEnvironment({ CI: `woodpecker` })).toBe(true)
  })

  it(`treats explicit false values as local`, () => {
    expect(isCiEnvironment({ CI: `0` })).toBe(false)
    expect(isCiEnvironment({ CI: `false` })).toBe(false)
    expect(isCiEnvironment({ CI: `` })).toBe(false)
  })

  it(`falls back to vendor markers when CI is absent`, () => {
    expect(isCiEnvironment({ GITHUB_ACTIONS: `true` })).toBe(true)
    expect(isCiEnvironment({ TF_BUILD: `True` })).toBe(true)
    expect(isCiEnvironment({ TEAMCITY_VERSION: `2025.11` })).toBe(true)
    expect(isCiEnvironment({ GITHUB_ACTIONS: `false` })).toBe(false)
  })

  it(`lets MD_WEB_CLI_CI override the environment in both directions`, () => {
    expect(isCiEnvironment({ CI: `true`, MD_WEB_CLI_CI: `0` })).toBe(false)
    expect(isCiEnvironment({ CI: `0`, MD_WEB_CLI_CI: `1` })).toBe(true)
  })
})

describe(`findSystemChrome`, () => {
  const macOSChrome = `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`

  it(`finds macOS Chrome at the documented path`, () => {
    expect(findSystemChrome({ platform: `darwin`, exists: path => path === macOSChrome })).toBe(macOSChrome)
  })

  it(`finds a Linux Chrome candidate`, () => {
    expect(systemChromeCandidates({}, `linux`)).toContain(`/usr/bin/google-chrome`)
    expect(findSystemChrome({ platform: `linux`, exists: path => path === `/usr/bin/chromium` })).toBe(`/usr/bin/chromium`)
  })

  it(`returns null when no candidate exists`, () => {
    expect(findSystemChrome({ platform: `darwin`, exists: () => false })).toBeNull()
  })
})
