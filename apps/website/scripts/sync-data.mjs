import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { refreshGithubData } from '../src/data.js'

const cache = new URL('../content/data/github.json', import.meta.url)

export async function loadSiteData(options = {}) {
  let previous = { schemaVersion: 1 }
  try {
    previous = JSON.parse(await readFile(cache, 'utf8'))
  }
  catch {
    // The site can still render source links on a first build without a snapshot.
  }
  const { snapshot, failures } = await refreshGithubData(previous, {
    offline: process.env.WEBSITE_OFFLINE === '1',
    ...options,
  })
  if (failures.length)
    console.warn(`[website] GitHub unavailable (${failures.join(', ')}); keeping the last valid snapshot.`)
  if (JSON.stringify(snapshot) !== JSON.stringify(previous)) {
    await mkdir(new URL('../content/data/', import.meta.url), { recursive: true })
    const temporary = new URL('github.tmp.json', cache)
    await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`)
    await rename(temporary, cache)
  }
  return snapshot
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  await loadSiteData({ force: process.argv.includes('--force') })
