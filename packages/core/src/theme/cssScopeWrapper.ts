/**
 * Scope CSS selectors to a prefix so styles apply only in the preview area.
 */

import { SELECTOR_MAPPING } from './selectorMapping'

/** Add scope prefix and map legacy selectors via SELECTOR_MAPPING */
export function wrapCSSWithScope(css: string, scope: string = `#output`): string {
  return css.replace(
    /([^{}]+)\{([^}]*)\}/g,
    (match, selectors, properties) => {
      const trimmedSelectors = selectors.trim()
      if (trimmedSelectors.startsWith(`@`) || trimmedSelectors.startsWith(`:root`)) {
        return match
      }

      const wrappedSelectors = selectors
        .split(`,`)
        .map((selector: string) => {
          let trimmed = selector.trim()

          if (trimmed.startsWith(scope)) {
            return trimmed
          }

          if (!trimmed) {
            return trimmed
          }

          trimmed = trimmed.replace(/\.md-container\b/g, `.container`)

          const baseSelector = trimmed.split(/[\s>+~:[]/, 1)[0].trim()

          if (baseSelector && SELECTOR_MAPPING[baseSelector]) {
            trimmed = trimmed.replace(baseSelector, `.${SELECTOR_MAPPING[baseSelector]}`)
          }

          // Prefix h1–h6 with section to match preset heading selector specificity
          const headingMatch = trimmed.match(/^(h[1-6])(\s|$|::|[:[])/)
          if (headingMatch) {
            return `${scope} section ${trimmed}`
          }

          return `${scope} ${trimmed}`
        })
        .filter(Boolean)
        .join(`,\n`)

      return `${wrappedSelectors} {${properties}}`
    },
  )
}
