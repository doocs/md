/** Detect uTools and tag root element (sync during setup for early effect). */
export function usePlatformEnv() {
  if (window.__MD_UTOOLS__)
    document.documentElement.classList.add(`is-utools`)
}
