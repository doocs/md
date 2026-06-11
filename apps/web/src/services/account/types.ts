/** 用户套餐（后续可扩展更多高级能力） */
export type UserPlan = `free` | `pro`

/** 账户用户信息（与 md-api /me 一致） */
export interface AccountUser {
  id: string
  login: string
  name: string | null
  avatar: string | null
  plan: UserPlan
  planExpiresAt: number | null
}
