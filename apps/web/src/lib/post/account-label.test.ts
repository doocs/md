import { describe, expect, it } from 'vitest'
import { accountHandle, isSignedInAccount } from './account-label'

describe(`accountHandle`, () => {
  it(`hides a display name that only repeats the platform title`, () => {
    expect(accountHandle({ title: `小红书（国内）`, displayName: `小红书（国内）` })).toBe(``)
  })

  it(`returns a real nickname`, () => {
    expect(accountHandle({ title: `小红书（国内）`, displayName: ` 小红书用户 ` })).toBe(`小红书用户`)
  })
})

describe(`isSignedInAccount`, () => {
  it(`rejects a cookie hit that only repeats the platform title`, () => {
    expect(isSignedInAccount({
      loggedIn: true,
      title: `小红书（国内）`,
      displayName: `小红书（国内）`,
    })).toBe(false)
  })

  it(`accepts a logged-in account with a nickname or avatar`, () => {
    expect(isSignedInAccount({
      loggedIn: true,
      title: `小红书（国内）`,
      displayName: `小红书用户`,
    })).toBe(true)
    expect(isSignedInAccount({
      loggedIn: true,
      title: `小红书（国内）`,
      displayName: `小红书（国内）`,
      avatar: `https://cdn.example/avatar.png`,
    })).toBe(true)
  })
})
