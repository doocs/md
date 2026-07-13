import type { AccountUser } from '@/services/account/types'
import { t } from '@/i18n/translate'
import { ApiError, MdApiClient } from '@/services/account/client'
import { gotoLogin, isAccountConfigured } from '@/services/account/config'
import {
  canLoginInExtension,
  isExtensionContext,
  loginViaExtensionIdentity,
} from '@/services/account/extension'
import { ACCOUNT_TOKEN_KEY, captureOAuthToken } from '@/services/account/oauth'
import { SyncClient } from '@/services/sync/client'
import { store } from '@/storage'

/**
 * Global account store: auth token, JWT, user profile.
 * Cloud sync and other cloud features share this account.
 */
export const useAuthStore = defineStore(`auth`, () => {
  const token = store.reactive(ACCOUNT_TOKEN_KEY, ``)
  const user = ref<AccountUser | null>(null)
  let bootstrapped = false

  const isConfigured = computed(() => isAccountConfigured())
  const isLoggedIn = computed(() => Boolean(token.value))

  const api = new MdApiClient(() => token.value || null)
  const syncClient = new SyncClient(() => token.value || null)

  /** On startup: capture OAuth redirect token and fetch user profile. */
  async function bootstrap(): Promise<void> {
    if (!isConfigured.value || bootstrapped)
      return
    bootstrapped = true

    captureOAuthToken((t) => {
      token.value = t
    })

    if (token.value)
      await fetchMe()
  }

  async function fetchMe(): Promise<boolean> {
    if (!token.value)
      return false
    try {
      const me = await api.me()
      user.value = {
        ...me,
        plan: me.plan ?? `free`,
        planExpiresAt: me.planExpiresAt ?? null,
        isAdmin: Boolean(me.isAdmin),
      }
      return true
    }
    catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403))
        logout()
      return false
    }
  }

  async function login(): Promise<void> {
    if (isExtensionContext()) {
      if (!canLoginInExtension()) {
        toast.error(t(`account.extensionLoginUnavailable`))
        return
      }

      const result = await loginViaExtensionIdentity()
      if (!result.ok) {
        if (result.reason !== `cancelled`)
          toast.error(t(`account.loginFailed`))
        return
      }

      token.value = result.token
      await store.set(ACCOUNT_TOKEN_KEY, result.token)

      const ok = await fetchMe()
      if (!ok) {
        logout()
        toast.error(t(`account.loginFailed`))
      }
      return
    }

    gotoLogin()
  }

  function logout(): void {
    token.value = ``
    user.value = null
    store.remove(ACCOUNT_TOKEN_KEY).catch(() => {})
  }

  return {
    token,
    user,
    isConfigured,
    isLoggedIn,
    api,
    syncClient,
    bootstrap,
    fetchMe,
    login,
    logout,
  }
})
