interface AccountIdentity {
  loggedIn?: boolean
  type?: string
  home?: string
  title?: string
  displayName?: string
  avatar?: string
}

/** Logged-in handle for the publish list. Platform titles are not account names. */
export function accountHandle(account: AccountIdentity): string {
  const name = account.displayName?.trim() ?? ``
  if (!name || name === account.title?.trim())
    return ``
  return name
}

/**
 * The extension can report a login from a visitor cookie and then reuse the
 * platform title as the account name. That is not a signed-in account.
 */
export function isSignedInAccount(account: AccountIdentity): boolean {
  if (!account.loggedIn)
    return false
  if (account.type === `substack`)
    return Boolean(account.home)
  if (account.avatar?.trim())
    return true
  return accountHandle(account) !== ``
}
