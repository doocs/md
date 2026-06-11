import type { UserPlan } from './types'

/** 暂时关闭 Pro 能力与升级入口 */
export const SYNC_PRO_ENABLED = false

/** Pro 实时云同步防抖间隔（毫秒） */
export const SYNC_DEBOUNCE_MS_PRO = 3000

export function isProPlan(plan: UserPlan | undefined): boolean {
  return SYNC_PRO_ENABLED && plan === `pro`
}
