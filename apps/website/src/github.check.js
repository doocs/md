import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatStars, loadGithubStars } from './github.js'

test('Star counts keep compact labels without rounding small repos to thousands', () => {
  assert.equal(formatStars(0), '0')
  assert.equal(formatStars(987), '987')
  assert.equal(formatStars(1000), '1k')
  assert.equal(formatStars(13487), '13.5k')
  assert.equal(formatStars(1200000), '1.2m')
})

test('GitHub data is validated and failures preserve the HTML snapshot', async (context) => {
  const mock = context.mock.method(globalThis, 'fetch')
  for (const count of [0, 13487, -1, 1.2, '13487', null, Number.MAX_SAFE_INTEGER + 1]) {
    mock.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ stargazers_count: count }) }))
    assert.equal(await loadGithubStars(), Number.isSafeInteger(count) && count >= 0 ? count : null)
  }
  mock.mock.mockImplementation(async () => ({ ok: false }))
  assert.equal(await loadGithubStars(), null)
  mock.mock.mockImplementation(async () => ({ ok: true, json: async () => { throw new Error('invalid JSON') } }))
  assert.equal(await loadGithubStars(), null)
  mock.mock.mockImplementation(async () => { throw new Error('network unavailable') })
  assert.equal(await loadGithubStars(), null)
})
