export interface ThemeState {
  isDark: boolean
  primaryColor: string
  backgroundColor: string
}

export type ThemeListener = (state: ThemeState) => void

const listeners = new Set<ThemeListener>()
let lastState: ThemeState | null = null
let rootObserver: MutationObserver | null = null
let headObserver: MutationObserver | null = null
let themeStyleObserver: MutationObserver | null = null
let themeStyleTarget: Element | null = null

function toHSLString(variant: string) {
  const vars = variant.split(' ')
  if (vars.length === 3)
    return `hsl(${vars.join(', ')})`
  if (vars.length === 4)
    return `hsla(${vars.join(', ')})`
  return ''
}

export function getThemeState(): ThemeState {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { isDark: false, primaryColor: '', backgroundColor: '' }
  }

  const root = document.documentElement

  const getColorOf = (name: string, formatter = (value: string) => value) => {
    return formatter(getComputedStyle(root)
      .getPropertyValue(name)
      .trim())
  }

  const primaryColor = getColorOf('--md-primary-color')
  const backgroundColor = getColorOf('--background', toHSLString)
  const isDark = root.classList.contains('dark')

  return { isDark, primaryColor, backgroundColor }
}

function emitIfChanged() {
  const next = getThemeState()
  if (
    !lastState
    || next.isDark !== lastState.isDark
    || next.primaryColor !== lastState.primaryColor
    || next.backgroundColor !== lastState.backgroundColor
  ) {
    lastState = next
    listeners.forEach(listener => listener(next))
  }
}

function attachThemeStyleObserver(target: Element) {
  if (themeStyleTarget === target)
    return

  themeStyleObserver?.disconnect()
  themeStyleTarget = target
  themeStyleObserver = new MutationObserver(emitIfChanged)
  themeStyleObserver.observe(target, {
    childList: true,
    subtree: true,
    characterData: true,
  })
}

function setupObservers() {
  if (typeof MutationObserver === 'undefined')
    return

  if (!lastState)
    lastState = getThemeState()

  const root = document.documentElement
  rootObserver = new MutationObserver(emitIfChanged)
  rootObserver.observe(root, { attributes: true, attributeFilter: ['class'] })

  headObserver = document.head
    ? new MutationObserver(() => {
        const styleEl = document.getElementById('md-theme')
        if (styleEl)
          attachThemeStyleObserver(styleEl)
      })
    : null

  if (headObserver)
    headObserver.observe(document.head, { childList: true })

  const styleEl = document.getElementById('md-theme')
  if (styleEl)
    attachThemeStyleObserver(styleEl)
}

function teardownObservers() {
  rootObserver?.disconnect()
  headObserver?.disconnect()
  themeStyleObserver?.disconnect()
  rootObserver = null
  headObserver = null
  themeStyleObserver = null
  themeStyleTarget = null
}

export function subscribeTheme(
  listener: ThemeListener,
  options: { immediate?: boolean } = {},
): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    if (options.immediate !== false)
      listener(getThemeState())
    return () => {}
  }

  listeners.add(listener)
  if (listeners.size === 1)
    setupObservers()

  const snapshot = getThemeState()
  if (!lastState)
    lastState = snapshot

  if (options.immediate !== false)
    listener(snapshot)

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0)
      teardownObservers()
  }
}
