type AnyFn = (...args: any[]) => any

type DebouncedFn<T extends AnyFn> = ((
  ...args: Parameters<T>
) => void) & {
  cancel: () => void
  flush: () => void
}

/**
 * Lightweight debounce with cancel/flush (VueUse 14's useDebounceFn no longer exposes these).
 */
export function debounce<T extends AnyFn>(fn: T, ms: number): DebouncedFn<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  let lastArgs: Parameters<T> | undefined

  const wrapped = ((...args: Parameters<T>) => {
    lastArgs = args
    if (timer)
      clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      const pending = lastArgs
      lastArgs = undefined
      if (pending)
        void fn(...pending)
    }, ms)
  }) as DebouncedFn<T>

  wrapped.cancel = () => {
    if (timer)
      clearTimeout(timer)
    timer = undefined
    lastArgs = undefined
  }

  wrapped.flush = () => {
    if (!timer)
      return
    clearTimeout(timer)
    timer = undefined
    const pending = lastArgs
    lastArgs = undefined
    if (pending)
      void fn(...pending)
  }

  return wrapped
}
