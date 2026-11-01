import { mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { generatePages } from './scripts/generate-pages.mjs'

const root = fileURLToPath(new URL('.', import.meta.url))
const generated = `${root}.generated`

export default defineConfig(async () => {
  const pages = await generatePages()
  await rm(generated, { recursive: true, force: true })
  async function writePages(nextPages) {
    for (const [filename, source] of nextPages) {
      const path = `${generated}/${filename}`
      await mkdir(path.slice(0, path.lastIndexOf('/')), { recursive: true })
      await writeFile(path, source)
    }
  }
  await writePages(pages)
  return {
    root: generated,
    appType: 'mpa',
    publicDir: `${root}public`,
    resolve: { alias: { '/src': `${root}src` } },
    server: { fs: { allow: [fileURLToPath(new URL('../../', import.meta.url))] } },
    build: { outDir: `${root}dist`, emptyOutDir: true, rollupOptions: { input: [...pages.keys()].map(path => `${generated}/${path}`) } },
    plugins: [{
      name: 'md-static-content',
      configureServer(server) {
        server.watcher.add([`${root}content`, `${root}index.html`, `${root}src/pages.js`, `${root}src/content.js`])
        let updating = Promise.resolve()
        server.watcher.on('all', (event, path) => {
          if ((!path.startsWith(`${root}content/`) && path !== `${root}index.html`) || path.endsWith('.tmp.json'))
            return
          updating = updating.then(async () => {
            const next = await generatePages({ refresh: false })
            for (const filename of pages.keys()) {
              if (!next.has(filename))
                await rm(`${generated}/${filename}`, { force: true })
            }
            pages.clear()
            for (const entry of next)
              pages.set(...entry)
            await writePages(pages)
            server.ws.send({ type: 'full-reload' })
          }).catch(error => server.config.logger.error(error.message))
        })
        server.middlewares.use(async (request, response, next) => {
          const path = new URL(request.url, 'http://localhost').pathname
          if (request.method !== 'GET' || path.includes('.') || path.startsWith('/@') || path.startsWith('/src/'))
            return next()
          const filename = `${path.replace(/^\//, '').replace(/\/$/, '')}${path === '/' ? '' : '/'}index.html`
          if (pages.has(filename))
            return next()
          const html = await server.transformIndexHtml('/404.html', pages.get('404.html'))
          response.statusCode = 404
          response.setHeader('Content-Type', 'text/html; charset=utf-8')
          response.end(html)
        })
      },
    }],
  }
})
