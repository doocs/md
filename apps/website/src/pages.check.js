import assert from 'node:assert/strict'
import { test } from 'node:test'
import { generatePages } from '../scripts/generate-pages.mjs'

test('static pages use video previews without the retired article demo', async () => {
  const pages = await generatePages({ refresh: false })
  assert.equal(pages.has('demo/index.html'), false)
  const home = pages.get('index.html')
  for (const name of ['workflow', 'themes', 'market', 'ai'])
    assert.ok(home.includes(`/videos/${name}-dark.mp4`))
  for (const html of pages.values())
    assert.doesNotMatch(html, /article-frame|\/demo\/|data-demo-controls|theme-tryout/)
})
