import { onUnmounted, ref } from 'vue'

/**
 * 定时刷新 composable，页面不可见时暂停
 * @param intervalMs - 刷新间隔（毫秒），默认 10 秒
 * @returns 响应式 key，每次刷新自增
 */
export function useRefreshTimer(intervalMs = 10_000) {
  const key = ref(0)

  const timer = setInterval(() => {
    if (!document.hidden)
      key.value++
  }, intervalMs)

  onUnmounted(() => clearInterval(timer))

  return key
}
