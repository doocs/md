/**
 * Dark-mode CSS variables for built-in components.
 *
 * Injected as <style id="md-comp-dark">; not read by getThemeStyles(), so clipboard
 * HTML copied to WeChat stays unpolluted.
 *
 * Vars activate under .dark (Tailwind on <html>), covering #output and component preview.
 *
 * Inline styles use var(--md-comp-xxx, lightFallback):
 *   - Editor dark: .dark sets dark vars
 *   - WeChat paste (no style tag): undefined vars → light fallbacks
 */

const COMP_DARK_VARS_CSS = `.dark {
  --md-comp-bg: #1e1e1e;
  --md-comp-bg-secondary: #2d2d2d;
  --md-comp-bg-stripe: #2a2a2a;
  --md-comp-text-primary: #e0e0e0;
  --md-comp-text-secondary: #b0b0b0;
  --md-comp-text-tertiary: #888;
  --md-comp-border-default: #404040;
  --md-comp-border-light: #333;
}`

/** Inject component dark vars once on page load (<style id="md-comp-dark">). */
export function initComponentDarkVars(): void {
  if (typeof document === `undefined`)
    return
  if (document.getElementById(`md-comp-dark`))
    return
  const style = document.createElement(`style`)
  style.id = `md-comp-dark`
  style.textContent = COMP_DARK_VARS_CSS
  document.head.appendChild(style)
}
