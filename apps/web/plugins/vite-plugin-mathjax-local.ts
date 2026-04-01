import type { Plugin } from 'vite'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

/**
 * Vite plugin: serve MathJax v4 component files and fonts from node_modules
 * instead of loading them from a CDN.
 *
 * - Dev: adds middleware to serve files under /static/mathjax/ and /static/mathjax-newcm-font/
 * - Build: copies the needed directories into the output folder.
 */
export function mathjaxLocalPlugin(): Plugin {
  const require = createRequire(import.meta.url)

  function resolveMathjaxDir() {
    const pkg = require.resolve('mathjax/package.json')
    return path.dirname(pkg)
  }

  function resolveFontDir() {
    const pkg = require.resolve('@mathjax/mathjax-newcm-font/package.json')
    return path.dirname(pkg)
  }

  let mathjaxDir: string
  let fontDir: string
  let outDir: string
  let base: string

  return {
    name: 'vite-plugin-mathjax-local',
    configResolved(config) {
      outDir = config.build.outDir
      base = config.base
      mathjaxDir = resolveMathjaxDir()
      fontDir = resolveFontDir()
    },

    // Dev server: serve mathjax and font files from node_modules
    configureServer(server) {
      const serveStatic = (prefix: string, root: string) => {
        server.middlewares.use((req, res, next) => {
          const url = req.url || ''
          const decodedUrl = decodeURIComponent(url)
          const fullPrefix = `${base}static/${prefix}/`.replace(/\/\//g, '/')
          if (!decodedUrl.startsWith(fullPrefix)) {
            return next()
          }
          const filePath = path.join(root, decodedUrl.slice(fullPrefix.length))
          if (!filePath.startsWith(root)) {
            res.statusCode = 403
            return res.end('Forbidden')
          }
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath)
            const contentType = ext === '.js' ? 'application/javascript' : 'application/octet-stream'
            res.setHeader('Content-Type', contentType)
            fs.createReadStream(filePath).pipe(res)
          }
          else {
            next()
          }
        })
      }

      serveStatic('mathjax', mathjaxDir)
      serveStatic('mathjax-newcm-font', fontDir)
    },

    // Build: copy mathjax and font directories to the output
    closeBundle() {
      const destMathjax = path.resolve(outDir, 'static/mathjax')
      const destFont = path.resolve(outDir, 'static/mathjax-newcm-font')

      // Only copy directories that are needed for SVG output (skip chtml, cjs, mjs, examples, etc.)
      fs.cpSync(mathjaxDir, destMathjax, {
        recursive: true,
        filter(src) {
          const name = path.basename(src)
          // Skip unnecessary top-level items
          if (src === mathjaxDir)
            return true
          const rel = path.relative(mathjaxDir, src)
          const topLevel = rel.split(path.sep)[0]
          // Skip node-only files and unnecessary files
          if (['node_modules', '.github', 'CONTRIBUTING.md', 'README.md', 'node-main.cjs', 'node-main.js', 'node-main.mjs', 'node-main-setup.cjs', 'require.mjs', 'package.json'].includes(topLevel)) {
            return false
          }
          // Skip mml-* and tex-mml-* combined components (we only need tex-svg)
          if (rel === topLevel && name.endsWith('.js') && !['tex-svg.js', 'startup.js', 'core.js', 'loader.js'].includes(name) && !['input', 'output', 'a11y', 'adaptors', 'sre', 'ui'].includes(topLevel)) {
            return false
          }
          return true
        },
      })

      // For fonts, only copy svg-related files (skip chtml, cjs, mjs, etc.)
      fs.cpSync(fontDir, destFont, {
        recursive: true,
        filter(src) {
          if (src === fontDir)
            return true
          const rel = path.relative(fontDir, src)
          const topLevel = rel.split(path.sep)[0]
          if (['svg', 'svg.js', 'package.json'].includes(topLevel)) {
            return true
          }
          return false
        },
      })
    },
  }
}
