import type { AccountUser } from '@/services/account/types'
import { ApiError, MdApiClient } from '@/services/account/client'
import { gotoLogin, isAccountConfigured } from '@/services/account/config'
import { ACCOUNT_TOKEN_KEY, captureOAuthToken, migrateLegacyToken } from '@/services/account/oauth'
import { SyncClient } from '@/services/sync/client'
import { store } from '@/utils/storage'

/**
 * 全局账户 Store
 * 负责登录态、JWT、用户信息；云同步等云端能力共用同一账户
 */
export const useAuthStore = defineStore(`auth`, () => {
  const token = store.reactive(ACCOUNT_TOKEN_KEY, ``)
  const user = ref<AccountUser | null>(null)
  let bootstrapped = false

  const isConfigured = computed(() => isAccountConfigured())
  const isLoggedIn = computed(() => Boolean(token.value))

  const api = new MdApiClient(() => token.value || null)
  const syncClient = new SyncClient(() => token.value || null)

  /** 启动时迁移旧 token、捕获 OAuth 回跳、拉取用户信息 */
  async function bootstrap(): Promise<void> {
    if (!isConfigured.value || bootstrapped)
      return
    bootstrapped = true

    await migrateLegacyToken()
    captureOAuthToken((t) => {
      token.value = t
    })

    if (token.value)
      await fetchMe()
  }

  /** @deprecated 使用 bootstrap */
  function captureRedirectToken(): boolean {
    return captureOAuthToken((t) => {
      token.value = t
    })
  }

  async function fetchMe(): Promise<void> {
    if (!token.value)
      return
    try {
      const me = await api.me()
      user.value = {
        ...me,
        plan: me.plan ?? `free`,
        planExpiresAt: me.planExpiresAt ?? null,
      }
    }
    catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403))
        logout()
    }
  }

  function login(): void {
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
    /** @deprecated 使用 syncClient */
    client: syncClient,
    bootstrap,
    captureRedirectToken,
    fetchMe,
    login,
    logout,
  }
})
