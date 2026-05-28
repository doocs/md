/**
 * 格式化相对时间
 * @param date - 日期对象或日期字符串
 * @returns 相对时间中文描述
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 10)
    return `刚刚`
  if (seconds < 60)
    return `${seconds} 秒前`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)
    return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)
    return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30)
    return `${days} 天前`
  return d.toLocaleDateString(`zh-CN`)
}
