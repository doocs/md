// Preload polyfill for Node.js environment (CJS format for --require)
// Must be loaded via --require BEFORE the main entry point
'use strict'
function noop() {}
globalThis.MathJax = {
  texReset() {},
  tex2svg(latex) {
    const svgStyle = {}
    const styleProxy = new Proxy(svgStyle, {
      set(_, prop, value) { svgStyle[prop] = value; return true },
      get(_, prop) {
        if (prop === 'setProperty')
          return (p, v) => { svgStyle[p] = v }
        if (prop === 'display')
          return svgStyle[prop] || ''
        return svgStyle[prop]
      },
    })
    return {
      firstChild: {
        outerHTML: `<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>${latex.replace(/</g, '&lt;')}</mi></math>`,
        style: styleProxy,
        getAttribute: () => null,
        removeAttribute: noop,
      },
    }
  },
}
globalThis.window = {
  MathJax: globalThis.MathJax,
  addEventListener: noop,
  removeEventListener: noop,
  dispatchEvent: () => true,
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  requestAnimationFrame: typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : cb => setTimeout(cb, 16),
  matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
}
globalThis.document = {
  getElementById: () => null,
  documentElement: { getAttribute: () => null, style: {} },
  createDocumentFragment: () => ({ appendChild: noop, childNodes: [] }),
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: tag => ({
    tagName: tag.toUpperCase(),
    setAttribute: noop,
    appendChild: noop,
    innerHTML: '',
    style: {},
  }),
  createTextNode: text => ({ textContent: text, data: text }),
  body: { appendChild: noop },
  head: { appendChild: noop },
}
