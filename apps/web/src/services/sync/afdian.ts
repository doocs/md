import { t } from '@/i18n/translate'

/** 爱发电 Pro 赞助方案（doocs 官方） */
export function getAfdianProPlans() {
  return [
    { label: t(`store.afdian.monthly`), planId: `81efdc48655711f18b6d52540025c377` },
    { label: t(`store.afdian.quarterly`), planId: `ced9acca655a11f1a7cc52540025c377` },
    { label: t(`store.afdian.yearly`), planId: `df5084a2655a11f1bea45254001e7c00` },
  ] as const
}

const ORDER_BASE = (import.meta.env.VITE_AFDIAN_ORDER_BASE ?? `https://ifdian.net`).replace(/\/$/, ``)

/** 生成带备注的爱发电下单链接（备注用于绑定 GitHub 账号） */
export function buildAfdianOrderUrl(planId: string, githubLogin: string): string {
  const params = new URLSearchParams({
    plan_id: planId,
    product_type: `0`,
    remark: githubLogin,
    affiliate_code: ``,
  })
  return `${ORDER_BASE}/order/create?${params.toString()}`
}
