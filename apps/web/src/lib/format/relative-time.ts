import { getLocale, t } from '@/i18n/translate'

export function formatRelativeTime(date: Date | string) {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 10)
    return t('store.relativeTime.justNow')
  if (seconds < 60)
    return t('store.relativeTime.secondsAgo', { seconds })
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)
    return t('store.relativeTime.minutesAgo', { minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24)
    return t('store.relativeTime.hoursAgo', { hours })
  const days = Math.floor(hours / 24)
  if (days < 30)
    return t('store.relativeTime.daysAgo', { days })
  return d.toLocaleDateString(getLocale())
}
