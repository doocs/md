import type { PostAccount } from '@md/shared/types'

/** Platform row returned by the doocs/cose extension before login checks. */
export type CosePlatform = Omit<PostAccount, `checked` | `loggedIn` | `isChecking`> & {
  checked?: boolean
  loggedIn?: boolean
  isChecking?: boolean
}

export interface CosePublishPost {
  title: string
  content: string
  markdown: string
  thumb: string
  desc: string
}

export interface CoseTaskAccountStatus {
  uid: string
  type: string
  title: string
  displayName?: string
  home?: string
  icon?: string
  status?: `uploading` | `failed` | `done` | string
  msg?: string
  error?: string
  editResp?: {
    draftLink?: string
  }
}

export interface CoseTaskStatus {
  accounts: CoseTaskAccountStatus[]
}

export interface CoseAddTaskData {
  post: CosePublishPost
  accounts: PostAccount[]
}

/** Window API injected by https://github.com/doocs/cose */
export interface CoseApi {
  getPlatforms?: () => CosePlatform[]
  getAccounts?: (cb: (accounts: PostAccount[]) => void) => void
  getAccountsProgressive?: (
    onAccount: (account: PostAccount, completed: number, total: number) => void,
    onComplete: () => void,
  ) => void
  addTask?: (
    data: CoseAddTaskData,
    onProgress: (status: CoseTaskStatus) => void,
    onComplete: () => void,
  ) => void
}
