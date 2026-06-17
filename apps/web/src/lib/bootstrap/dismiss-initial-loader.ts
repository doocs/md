const INITIAL_LOADER_ID = `app-initial-loader`
const DISMISS_FALLBACK_MS = 25_000

let dismissed = false
let fallbackTimer: ReturnType<typeof setTimeout> | undefined

/** 兜底：避免预览初始化异常导致启动屏一直不消失 */
export function scheduleInitialLoaderFallback() {
  if (fallbackTimer)
    return

  fallbackTimer = setTimeout(() => {
    dismissInitialLoader()
  }, DISMISS_FALLBACK_MS)
}

/** 移除 index.html 中的静态启动屏（预览就绪后调用） */
export function dismissInitialLoader() {
  if (dismissed)
    return
  dismissed = true

  if (fallbackTimer) {
    clearTimeout(fallbackTimer)
    fallbackTimer = undefined
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const loader = document.getElementById(INITIAL_LOADER_ID)
      if (!(loader instanceof HTMLElement))
        return

      loader.style.transition = `opacity 0.3s ease`
      loader.style.opacity = `0`
      window.setTimeout(() => loader.remove(), 300)
    })
  })
}
