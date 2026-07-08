/// <reference path="../mathjax.d.ts" />

export const MATHJAX_CDN_URL = `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/mathjax@3/es5/tex-svg.js`
export const MATHJAX_LOCAL_URL = `./static/libs/mathjax/tex-svg.js`

const MATHJAX_SCRIPT_ID = `MathJax-script`

function getMathJaxScriptUrl(): string {
  if (typeof window !== `undefined` && window.__MD_UTOOLS__)
    return MATHJAX_LOCAL_URL
  return MATHJAX_CDN_URL
}

export const MATHJAX_READY_EVENT = `md:mathjax-ready`

let loadPromise: Promise<void> | null = null
let readyEventDispatched = false

export function isMathJaxReady(): boolean {
  return typeof window !== `undefined` && typeof window.MathJax?.tex2svg === `function`
}

function waitForMathJaxStartup(): Promise<void> {
  const startup = window.MathJax?.startup?.promise
  return startup ?? Promise.resolve()
}

function removeMathJaxScript() {
  document.getElementById(MATHJAX_SCRIPT_ID)?.remove()
}

function appendMathJaxScript(): HTMLScriptElement {
  removeMathJaxScript()

  const script = document.createElement(`script`)
  script.id = MATHJAX_SCRIPT_ID
  script.src = getMathJaxScriptUrl()
  document.head.appendChild(script)
  return script
}

export function loadMathJax(): Promise<void> {
  if (typeof window === `undefined`)
    return Promise.resolve()

  if (isMathJaxReady())
    return Promise.resolve()

  if (loadPromise)
    return loadPromise

  loadPromise = new Promise<void>((resolve, reject) => {
    Object.assign(window, {
      MathJax: {
        tex: { tags: `ams` },
        svg: { fontCache: `none` },
        // 仅通过 tex2svg 在预览区渲染；禁止扫描整页 DOM，否则会改写 CodeMirror 编辑区内的 $$...$$
        startup: {
          typeset: false,
        },
        options: {
          ignoreHtmlClass: `mathjax-ignore`,
        },
      },
    })

    const script = appendMathJaxScript()
    script.onload = () => {
      waitForMathJaxStartup().then(resolve).catch((error) => {
        removeMathJaxScript()
        loadPromise = null
        reject(error)
      })
    }
    script.onerror = () => {
      removeMathJaxScript()
      loadPromise = null
      reject(new Error(`Failed to load MathJax`))
    }
  })

  return loadPromise
}

export function ensureMathJaxLoaded(): Promise<void> {
  const wasReady = isMathJaxReady()
  return loadMathJax().then(() => {
    if (typeof window === `undefined` || wasReady || readyEventDispatched)
      return
    readyEventDispatched = true
    window.dispatchEvent(new CustomEvent(MATHJAX_READY_EVENT))
  })
}
