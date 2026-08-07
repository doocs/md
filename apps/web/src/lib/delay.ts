/** Promise-based delay backed by window.setTimeout. */
export function delay(ms: number) {
  return new Promise<void>(resolve => window.setTimeout(resolve, ms))
}
