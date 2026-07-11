const INITIAL_LOADER_ID = `app-initial-loader`
const DISMISS_FALLBACK_MS = 25_000

let dismissed = false
let fallbackTimer: ReturnType<typeof setTimeout> | undefined

/** Fallback so a broken preview init cannot leave the splash screen forever. */
export function scheduleInitialLoaderFallback() {
  if (fallbackTimer)
    return

  fallbackTimer = setTimeout(() => {
    dismissInitialLoader()
  }, DISMISS_FALLBACK_MS)
}

/** Remove the static splash from index.html (call when preview is ready). */
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
