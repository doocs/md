/** Suppress noisy Pinia devtools "store installed/disposed" messages in development. */
export function silenceDevLogs(): void {
  if (!import.meta.env.DEV)
    return

  const isPiniaStoreLifecycleNoise = (value: unknown) =>
    typeof value === `string`
    && (value.includes(`store installed`) || value.includes(`store 🗑`))

  for (const method of [`log`, `info`] as const) {
    const original = console[method].bind(console)
    console[method] = (...args: unknown[]) => {
      if (isPiniaStoreLifecycleNoise(args[0]))
        return
      original(...args)
    }
  }
}
