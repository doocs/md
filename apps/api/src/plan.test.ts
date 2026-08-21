import { describe, expect, it } from 'vitest'
import {
  extendPlanExpires,
  getEffectivePlan,
  MS_PER_SPONSOR_MONTH,
  parseGithubLoginFromRemark,
} from './plan'

describe(`getEffectivePlan`, () => {
  it(`returns pro only while the expiry is in the future`, () => {
    expect(getEffectivePlan(`pro`, Date.now() + 60_000)).toBe(`pro`)
    expect(getEffectivePlan(`pro`, Date.now() - 1)).toBe(`free`)
    expect(getEffectivePlan(`pro`, null)).toBe(`free`)
    expect(getEffectivePlan(`free`, Date.now() + 60_000)).toBe(`free`)
  })
})

describe(`extendPlanExpires`, () => {
  it(`extends from now when expired or missing`, () => {
    const now = Date.now()
    const expires = extendPlanExpires(now - 1000, 1)
    expect(expires).toBeGreaterThanOrEqual(now + MS_PER_SPONSOR_MONTH - 50)
    expect(expires).toBeLessThanOrEqual(now + MS_PER_SPONSOR_MONTH + 50)
  })

  it(`stacks months onto a still-valid expiry`, () => {
    const current = Date.now() + 10_000
    expect(extendPlanExpires(current, 2)).toBe(current + 2 * MS_PER_SPONSOR_MONTH)
  })
})

describe(`parseGithubLoginFromRemark`, () => {
  it(`parses plain and prefixed usernames`, () => {
    expect(parseGithubLoginFromRemark(`YangFong`)).toBe(`yangfong`)
    expect(parseGithubLoginFromRemark(`github:OctoCat`)).toBe(`octocat`)
    expect(parseGithubLoginFromRemark(`github：Doocs`)).toBe(`doocs`)
  })

  it(`returns null for empty or invalid remarks`, () => {
    expect(parseGithubLoginFromRemark(``)).toBeNull()
    expect(parseGithubLoginFromRemark(`!!!`)).toBeNull()
  })
})
