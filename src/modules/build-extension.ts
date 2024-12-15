import type * as vite from 'vite'
import type * as wxt from 'wxt'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseHTML } from 'linkedom'
import { murmurHash } from 'ohash'
import {
  addViteConfig,
  defineWxtModule,
} from 'wxt/modules'

interface FakeRollupOptions {
  manualChunks: (id: string) => string | undefined
}
export default defineWxtModule({
  async setup(wxt) {
    wxt.config.alias[`/src/main.ts`] = `./src/main.ts`
    wxt.config.manifest.options_page = `options.html`
    wxt.hook(`entrypoints:grouped`, (_, groups) => {
      groups.push([{
        type: `options`,
        name: `options`,
        options: { openInTab: true },
        inputPath: path.resolve(wxt.config.root, `./index.html`),
        outputDir: wxt.config.outDir,
        skipped: false,
      }])
    })
    wxt.hook(`vite:build:extendConfig`, (_, config) => {
      if (config.build?.rollupOptions?.input && config.build?.rollupOptions?.input) {
        const input = config.build?.rollupOptions.input as Record<string, string>
        if (input.options) {
          const output = config.build?.rollupOptions.output as FakeRollupOptions
          output.manualChunks = (id) => {
            if (id.includes(`prettier`)) {
              return `prettier-chunk`
            }
            if (id.includes(`highlight.js`)) {
              return `highlight-chunk`
            }
          }
        }
      }
    })
    addViteConfig(wxt, () => ({
      plugins: [
        htmlScriptToVirtual(wxt.config, () => wxt.server),
        vueDevtoolsHack(wxt.config, () => wxt.server),
        wxt.config.command === `build`
          ? htmlScriptToLocal(wxt)
          : undefined,
      ],
    }))
  },
})

// Stored outside the plugin to effect all instances of the htmlScriptToVirtual plugin.
const inlineScriptContents: Record<number, string> = {}
export function htmlScriptToVirtual(
  config: wxt.ResolvedConfig,
  getWxtDevServer: () => wxt.WxtDevServer | undefined,
): vite.PluginOption {
  const virtualInlineScript = `virtual:md-inline-script`
  const resolvedVirtualInlineScript = `\0${virtualInlineScript}`

  const server = getWxtDevServer?.()
  return [
    {
      name: `md:dev-html-prerender`,
      apply: `build`,
      async transform(code, id) {
        if (
          server == null
          || !id.endsWith(`.html`)
        ) {
          return
        }
        const { document } = parseHTML(code)
        // Replace inline script with virtual module served via dev server.
        // Extension CSP blocks inline scripts, so that's why we're pulling them out.
        const promises: Promise<void>[] = []
        const inlineScripts = document.querySelectorAll(`script[src^=http]`)
        inlineScripts.forEach(async (script) => {
          promises.push(new Promise<void>((resolve) => {
            const url = script.getAttribute(`src`) ?? ``
            doFetch(url).then((textContent) => {
              const hash = murmurHash(textContent)
              inlineScriptContents[hash] = textContent
              script.setAttribute(`src`, `${server.origin}/@id/${virtualInlineScript}?${hash}`)
              if (script.hasAttribute(`id`)) {
                script.setAttribute(`type`, `module`)
              }
              resolve()
            })
          }))
        })
        await Promise.all(promises)
        const newHtml = document.toString()
        config.logger.debug(`transform ${id}`)
        config.logger.debug(`Old HTML:\n${code}`)
        config.logger.debug(`New HTML:\n${newHtml}`)
        return newHtml
      },
    },
    {
      name: `md:virtualize-react-refresh`,
      apply: `serve`,
      resolveId(id) {
        // Resolve inline scripts
        if (id.startsWith(virtualInlineScript)) {
          return `\0${id}`
        }

        // Ignore chunks during HTML file pre-rendering
        if (id.startsWith(`/chunks/`)) {
          return `\0noop`
        }
      },
      load(id) {
        // Resolve virtualized inline scripts
        if (id.startsWith(resolvedVirtualInlineScript)) {
          // id="virtual:md-inline-script?<hash>"
          const hash = Number(id.substring(id.indexOf(`?`) + 1))
          return inlineScriptContents[hash]
        }

        // Ignore chunks during HTML file pre-rendering
        if (id === `\0noop`) {
          return ``
        }
      },
    },
  ]
}

export function htmlScriptToLocal(
  wxt: wxt.Wxt,
): vite.Plugin {
  return {
    name: `md:build-html-prerender`,
    apply: `build`,
    transformIndexHtml: {
      order: `pre`,
      async handler(html) {
        const { document } = parseHTML(html)
        const promises: Promise<void>[] = []
        const httpScripts = document.querySelectorAll(`script[src^=http]`)
        if (httpScripts.length > 0) {
          httpScripts.forEach(async (script) => {
            /* eslint-disable no-async-promise-executor */
            promises.push(new Promise<void>(async (resolve) => {
              const url = script.getAttribute(`src`) ?? ``
              if (url?.startsWith(`http://localhost`)) {
                resolve()
                return
              }
              const textContent = await doFetch(url)
              const hash = murmurHash(textContent)
              const jsName = url.match(/\/([^/]+)\.js$/)?.[1] ?? `.js`
              const fileName = `${jsName.split(`.`)[0]}-${hash}.js`
              // write to file
              const outFile = path.resolve(wxt.config.outDir, `./${fileName}`)
              await writeFile(outFile, textContent, `utf8`)
              script.setAttribute(`src`, `/${fileName}`)
              // script.setAttribute(`type`, `module`)
              resolve()
            }))
          })
        }

        // Replace inline script with virtual module served via dev server.
        // Extension CSP blocks inline scripts, so that's why we're pulling them
        // out.
        const inlineScripts = document.querySelectorAll(`script:not([src])`)
        if (inlineScripts.length > 0) {
          inlineScripts.forEach(async (script) => {
            promises.push(new Promise<void>(async (resolve) => {
              // Save the text content for later
              const textContent = script.textContent ?? ``
              const hash = murmurHash(textContent)
              const fileName = `md-inline-${hash}.js`
              // write to file
              const outFile = path.resolve(wxt.config.outDir, `./${fileName}`)
              await writeFile(outFile, textContent, `utf8`)
              // Replace unsafe inline script
              const virtualScript = document.createElement(`script`)
              // virtualScript.type = `module`
              virtualScript.src = `/${fileName}`
              script.replaceWith(virtualScript)
              resolve()
            }),
            )
          })
        }
        await Promise.all(promises)
        const newHtml = document.toString()
        wxt.config.logger.debug(`Old HTML:\n${html}`)
        wxt.config.logger.debug(`New HTML:\n${newHtml}`)
        return newHtml
      },
    },
  }
}
export function vueDevtoolsHack(
  config: wxt.ResolvedConfig,
  getWxtDevServer: () => wxt.WxtDevServer | undefined,
): vite.Plugin {
  const server = getWxtDevServer?.()
  return {
    name: `md:vue-devtools-hack`,
    apply: `build`,
    transformIndexHtml: {
      order: `post`,
      handler(html) {
        const { document } = parseHTML(html)
        const inlineScripts = document.querySelectorAll(`script[src^='/@id/virtual:']`)
        inlineScripts.forEach((script) => {
          const src = script.getAttribute(`src`)
          const newSrc = `${server?.origin}${src}`
          script.setAttribute(`src`, newSrc)
        })
        const newHtml = document.toString()
        config.logger.debug(`Old HTML:\n${html}`)
        config.logger.debug(`New HTML:\n${newHtml}`)

        return newHtml
      },
    },
  }
}

async function doFetch(
  url: string,
): Promise<string> {
  let content: string = ``
  const res = await fetch(url)
  if (res.status < 300) {
    content = await res.text()
  }
  else {
    throw new Error(
      `Failed to fetch "${url}". `,
    )
  }
  return content
}
