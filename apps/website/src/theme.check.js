import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { applyDemoView, applyPreviewTheme, nextAppearance, themes } from './theme.js'

test('appearance switches between dark and light, starting in dark mode', () => {
  assert.equal(nextAppearance(undefined), 'light')
  assert.equal(nextAppearance('dark'), 'light')
  assert.equal(nextAppearance('light'), 'dark')
})

test('appearance bootstrap accepts saved choices and tolerates unavailable storage', () => {
  const script = readFileSync(new URL('../public/appearance.js', import.meta.url), 'utf8')
  for (const saved of ['light', 'dark', null, 'invalid']) {
    const document = { documentElement: { dataset: {} } }
    runInNewContext(script, { document, localStorage: { getItem: () => saved } })
    assert.equal(document.documentElement.dataset.theme, saved === 'light' || saved === 'dark' ? saved : undefined)
  }
  const document = { documentElement: { dataset: {} } }
  runInNewContext(script, { document, localStorage: { getItem() { throw new Error('blocked') } } })
  assert.equal(document.documentElement.dataset.theme, undefined)
})

test('mobile demo switches source and preview with matching pressed states', () => {
  const editor = { dataset: { view: 'preview' } }
  const buttons = ['source', 'preview'].map(view => ({
    dataset: { demoView: view },
    setAttribute(name, value) { this[name] = value },
  }))
  for (const view of ['source', 'preview']) {
    applyDemoView(editor, buttons, view)
    assert.equal(editor.dataset.view, view)
    assert.deepEqual(buttons.map(button => button['aria-pressed']), buttons.map(button => String(button.dataset.demoView === view)))
  }
  applyDemoView(editor, buttons, 'invalid')
  assert.equal(editor.dataset.view, 'preview')
})

test('preview selection updates the article and all pressed states', () => {
  const preview = { dataset: {} }
  const buttons = themes.map(theme => ({
    dataset: { previewTheme: theme },
    setAttribute(name, value) { this[name] = value },
  }))
  for (const theme of themes) {
    applyPreviewTheme(preview, buttons, theme)
    assert.equal(preview.dataset.theme, theme)
    assert.deepEqual(buttons.map(button => button['aria-pressed']), themes.map(value => String(value === theme)))
  }
  applyPreviewTheme(preview, buttons, 'invalid')
  assert.equal(preview.dataset.theme, 'purple')
})
