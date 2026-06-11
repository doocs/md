import type { SyncUser } from '@/services/sync/types'
import { gotoLogin, isSyncConfigured, SyncApiError, SyncClient } from '@/services/sync/client'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

const TOKEN_KEY = addPrefix(`sync_token`)

/**
 * 云同步账户 Store
 * 负责管理登录态、JWT、当前用户信息
 */
export const useAuthStore = defineStore(`auth`, () => {
  // 持久化的 JWT（登录后由后端签发）
  const token = store.reactive(TOKEN_KEY, ``)

  // 当前用户信息（仅内存，每次启动通过 /me 拉取）
  const user = ref<SyncUser | null>(null)

  const isConfigured = computed(() => isSyncConfigured())
  const isLoggedIn = computed(() => Boolean(token.value))

  const client = new SyncClient(() => token.value || null)

  /**
   * 从 URL fragment 中捕获后端回跳的 token（#sync_token=xxx），
   * 捕获后清理地址栏，避免泄露。
   */
  function captureRedirectToken(): boolean {
    const hash = window.location.hash.replace(/^#/, ``)
    if (!hash.includes(`sync_token=`))
      return false

    const params = new URLSearchParams(hash)
    const t = params.get(`sync_token`)
    if (!t)
      return false

    token.value = t
    // 直接写入存储：此时 store.reactive 的持久化 watch 尚未注册
    // （它延迟到下一个微任务），仅靠赋值会导致刷新后丢失登录态。
    store.set(TOKEN_KEY, t).catch(() => {})

    params.delete(`sync_token`)
    const rest = params.toString()
    const newUrl = window.location.pathname + window.location.search + (rest ? `#${rest}` : ``)
    window.history.replaceState({}, ``, newUrl)
    return true
  }

  /** 拉取当前用户信息，仅在 token 确实失效（401/403）时登出 */
  async function fetchMe(): Promise<void> {
    if (!token.value)
      return
    try {
      const me = await client.me()
      user.value = {
        ...me,
        plan: me.plan ?? `free`,
        planExpiresAt: me.planExpiresAt ?? null,
      }
    }
    catch (e) {
      // 仅当鉴权失败时登出；网络/临时错误不应清除登录态
      if (e instanceof SyncApiError && (e.status === 401 || e.status === 403))
        logout()
    }
  }

  function login(): void {
    gotoLogin()
  }

  function logout(): void {
    token.value = ``
    user.value = null
    store.remove(TOKEN_KEY).catch(() => {})
  }

  return {
    token,
    user,
    isConfigured,
    isLoggedIn,
    client,
    captureRedirectToken,
    fetchMe,
    login,
    logout,
  }
})
