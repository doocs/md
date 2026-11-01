import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

const source = readFileSync(new URL('./github.js', import.meta.url), 'utf8').replaceAll('export ', '')
const key = 'md-website-github-repository'
const now = Date.now()
const cached = { stars: 14000, forks: 2300, fetchedAt: new Date(now - 1000).toISOString() }

function setup({ cache = null, status = 200, raw = { full_name: 'doocs/md', stargazers_count: 14001, forks_count: 2301 }, storageBlocked = false, networkError = false } = {}) {
  let requests = 0
  let saved
  const headerCount = { textContent: 'snapshot' }
  const header = { querySelector: () => headerCount, setAttribute(name, value) { this[name] = value } }
  const nodes = Object.fromEntries(['stars', 'forks', 'updated', 'stats'].map(name => [`[data-github-${name}]`, [{ textContent: 'snapshot', hidden: true }]]))
  const api = runInNewContext(`${source}\n;({ loadGithubRepository, refreshGithubStats })`, {
    Date,
    Intl,
    AbortSignal,
    localStorage: {
      getItem() {
        if (storageBlocked)
          throw new Error('blocked')
        return cache
      },
      setItem(name, value) {
        if (storageBlocked)
          throw new Error('blocked')
        assert.equal(name, key)
        saved = JSON.parse(value)
      },
    },
    async fetch(url, options) {
      requests++
      assert.equal(url, 'https://api.github.com/repos/doocs/md')
      assert.equal(options.headers.Accept, 'application/vnd.github+json')
      if (networkError)
        throw new Error('offline')
      return { ok: status === 200, json: async () => raw }
    },
    document: { querySelector: () => header, querySelectorAll: selector => nodes[selector] },
  })
  return { ...api, header, headerCount, nodes, requests: () => requests, saved: () => saved }
}

test('fresh cache updates header, community counts and time without a request', async () => {
  const app = setup({ cache: JSON.stringify(cached) })
  await app.refreshGithubStats()
  assert.equal(app.requests(), 0)
  assert.equal(app.headerCount.textContent, '14k')
  assert.match(app.header['aria-label'], /14,000 Stars/)
  assert.equal(app.nodes['[data-github-stars]'][0].textContent, '14,000')
  assert.equal(app.nodes['[data-github-forks]'][0].textContent, '2,300')
  assert.equal(app.nodes['[data-github-updated]'][0].dateTime, cached.fetchedAt)
  assert.notEqual(app.nodes['[data-github-updated]'][0].textContent, 'snapshot')
  assert.equal(app.nodes['[data-github-stats]'][0].hidden, false)
})

test('expired, malformed, future and invalid caches fetch and save fresh counts', async () => {
  for (const cache of [null, '{', JSON.stringify({ ...cached, fetchedAt: new Date(now - 30 * 60 * 1000).toISOString() }), JSON.stringify({ ...cached, fetchedAt: new Date(now + 3600000).toISOString() }), JSON.stringify({ ...cached, stars: -1 }), JSON.stringify({ ...cached, fetchedAt: 'invalid' })]) {
    const app = setup({ cache })
    const stats = await app.loadGithubRepository()
    assert.equal(app.requests(), 1)
    assert.equal(stats.stars, 14001)
    assert.equal(stats.forks, 2301)
    assert.equal(app.saved().fetchedAt, stats.fetchedAt)
  }
})

test('blocked storage still allows fresh counts to update the page', async () => {
  const app = setup({ storageBlocked: true })
  await app.refreshGithubStats()
  assert.equal(app.requests(), 1)
  assert.equal(app.headerCount.textContent, '14k')
  assert.equal(app.nodes['[data-github-stars]'][0].textContent, '14,001')
})

test('network failures, rate limits and invalid responses preserve the HTML snapshot', async () => {
  for (const options of [{ networkError: true }, { status: 403 }, { status: 429 }, { raw: null }, { raw: { full_name: 'other/repo', stargazers_count: 1, forks_count: 2 } }, { raw: { full_name: 'doocs/md', stargazers_count: 1, forks_count: -2 } }]) {
    const app = setup(options)
    await app.refreshGithubStats()
    assert.equal(app.headerCount.textContent, 'snapshot')
    assert.equal(app.nodes['[data-github-stars]'][0].textContent, 'snapshot')
    assert.equal(app.nodes['[data-github-updated]'][0].textContent, 'snapshot')
    assert.equal(app.nodes['[data-github-stats]'][0].hidden, true)
    assert.equal(app.saved(), undefined)
  }
})
