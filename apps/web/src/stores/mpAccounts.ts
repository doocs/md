import { t } from '@/i18n/translate'
import { store } from '@/storage'
import { addPrefix } from '@/storage/prefix'

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

  const currentAccount = computed<MpAccount | null>(() => {
    return (
      accounts.value.find(a => a.id === currentAccountId.value)
      ?? accounts.value[0]
      ?? null
    )
  })

  function addAccount(data?: Partial<Omit<MpAccount, 'id'>>): MpAccount {
    const newAccount: MpAccount = {
      id: crypto.randomUUID(),
      mpId: data?.mpId ?? ``,
      name: data?.name ?? t('store.mpAccount.newAccount'),
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
    if (index !== -1)
      accounts.value[index] = { ...accounts.value[index], ...data }
  }

  function deleteAccount(id: string) {
    const index = accounts.value.findIndex(a => a.id === id)
    if (index === -1)
      return
    accounts.value.splice(index, 1)
    if (currentAccountId.value === id)
      currentAccountId.value = accounts.value[0]?.id ?? ``
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
