import type { UserPlan } from './types'

/** Pro features and upgrade entry temporarily disabled. */
export const SYNC_PRO_ENABLED = false

/** Pro live cloud sync debounce interval (ms). */
export const SYNC_DEBOUNCE_MS_PRO = 3000

export function isProPlan(plan: UserPlan | undefined): boolean {
  return SYNC_PRO_ENABLED && plan === `pro`
}
