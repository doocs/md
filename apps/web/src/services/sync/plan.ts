import type { SyncPlan } from './types'

/** Pro：3 秒实时防抖；免费：5 分钟低频防抖 */
export const SYNC_DEBOUNCE_MS: Record<SyncPlan, number> = {
  pro: 3000,
  free: 5 * 60 * 1000,
}

export function isProPlan(plan: SyncPlan | undefined): boolean {
  return plan === `pro`
}
