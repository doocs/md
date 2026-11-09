import assert from 'node:assert/strict'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const files = await readdir(dist, { recursive: true })
const ids = new Map()
for (const filename of files.filter(name => name.endsWith('.html'))) {
  const html = await readFile(join(dist, filename), 'utf8')
  const headings = [...html.matchAll(/<h1(?:\s|>)/g)]
  assert.equal(headings.length, 1, `${filename} must have one primary heading`)
  const values = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1])
  assert.equal(new Set(values).size, values.length, `${filename} has duplicate IDs`)
  assert.doesNotMatch(html, /%%[A-Z_]+%%/, `${filename} has an unfilled template`)
  ids.set(filename, new Set(values))
}
for (const filename of ids.keys()) {
  const html = await readFile(join(dist, filename), 'utf8')
  for (const [, value] of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
    const url = new URL(value.replaceAll('&amp;', '&'), `https://website.local/${filename}`)
    if (url.origin !== 'https://website.local')
      continue
    let path = decodeURIComponent(url.pathname).slice(1) || 'index.html'
    const info = await stat(join(dist, path)).catch(() => null)
    assert.ok(info, `${filename}: missing local target ${value}`)
    if (info.isDirectory())
      path = join(path, 'index.html')
    if (url.hash)
      assert.ok(ids.get(path)?.has(decodeURIComponent(url.hash.slice(1))), `${filename}: missing anchor ${value}`)
  }
}
console.log(`[website] Verified ${ids.size} static pages, local assets, links and anchors.`)
