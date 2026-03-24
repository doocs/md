import { v4 as uuidv4 } from 'uuid'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

export interface MpAccount {
  /** UUID — internal store identifier */
  id: string
  /** WeChat public account base64 ID, e.g. "MzIxNjA5ODQ0OQ==" */
  mpId: string
  name: string
  logo: string
  desc: string
  /**
   * 1: 公众号
   * 2: 服务号
   */
  serviceType: `1` | `2`
  /**
   * 0: 无标识
   * 1: 个人认证
   * 2: 企业认证
   */
  verify: `0` | `1` | `2`
}

export const useMpAccountsStore = defineStore(`mpAccounts`, () => {
  const accounts = store.reactive<MpAccount[]>(addPrefix(`mp-accounts`), [])
  const currentAccountId = store.reactive<string>(addPrefix(`mp-current-account-id`), ``)

  // ── 迁移旧数据（MD__mp-profile → accounts 数组）──────────────────────────
  if (accounts.value.length === 0) {
    try {
      const oldRaw = localStorage.getItem(addPrefix(`mp-profile`))
      if (oldRaw) {
        const old = JSON.parse(oldRaw)
        if (old && (old.name || old.id)) {
          const migrated: MpAccount = {
            id: uuidv4(),
            mpId: old.id ?? ``,
            name: old.name ?? ``,
            logo: old.logo ?? ``,
            desc: old.desc ?? ``,
            serviceType: old.serviceType ?? `1`,
            verify: old.verify ?? `0`,
          }
          accounts.value.push(migrated)
          currentAccountId.value = migrated.id
        }
      }
    }
    catch {
      // ignore parse errors
    }
  }

  // ── 计算属性 ─────────────────────────────────────────────────────────────
  const currentAccount = computed<MpAccount | null>(() => {
    return (
      accounts.value.find(a => a.id === currentAccountId.value)
      ?? accounts.value[0]
      ?? null
    )
  })

  // ── 操作 ─────────────────────────────────────────────────────────────────
  function addAccount(data?: Partial<Omit<MpAccount, 'id'>>): MpAccount {
    const newAccount: MpAccount = {
      id: uuidv4(),
      mpId: data?.mpId ?? ``,
      name: data?.name ?? `新账号`,
      logo: data?.logo ?? ``,
      desc: data?.desc ?? ``,
      serviceType: data?.serviceType ?? `1`,
      verify: data?.verify ?? `0`,
    }
    accounts.value.push(newAccount)
    currentAccountId.value = newAccount.id
    return newAccount
  }

  function updateAccount(id: string, data: Partial<Omit<MpAccount, 'id'>>) {
    const index = accounts.value.findIndex(a => a.id === id)
    if (index !== -1) {
      accounts.value[index] = { ...accounts.value[index], ...data }
    }
  }

  function deleteAccount(id: string) {
    const index = accounts.value.findIndex(a => a.id === id)
    if (index === -1)
      return
    accounts.value.splice(index, 1)
    if (currentAccountId.value === id) {
      currentAccountId.value = accounts.value[0]?.id ?? ``
    }
  }

  function setCurrentAccount(id: string) {
    currentAccountId.value = id
  }

  return {
    accounts,
    currentAccountId,
    currentAccount,
    addAccount,
    updateAccount,
    deleteAccount,
    setCurrentAccount,
  }
})
