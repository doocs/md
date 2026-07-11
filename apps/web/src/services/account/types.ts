/** User plan (extensible for future premium features). */
export type UserPlan = `free` | `pro`

/** Account user profile (matches md-api /me). */
export interface AccountUser {
  id: string
  login: string
  name: string | null
  avatar: string | null
  plan: UserPlan
  planExpiresAt: number | null
}
