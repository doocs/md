import type { Env } from './types'
import { normalizeGithubLogin } from './plan'

/** Parse ADMIN_GITHUB_LOGINS (comma-separated) into a lowercase set. */
export function getAdminLogins(env: Env): Set<string> {
  const raw = env.ADMIN_GITHUB_LOGINS ?? ``
  const set = new Set<string>()
  for (const part of raw.split(`,`)) {
    const login = normalizeGithubLogin(part)
    if (login)
      set.add(login)
  }
  return set
}

export function isAdmin(env: Env, login: string | null | undefined): boolean {
  if (!login)
    return false
  return getAdminLogins(env).has(normalizeGithubLogin(login))
}
