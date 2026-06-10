/**
 * Smoke test for the VSCode extension rendering path.
 * Verifies initRenderer options used by the extension produce expected HTML.
 *
 * Run from repo root: pnpm vscode test
 */
import { initRenderer } from '@md/core/renderer'
import { modifyHtmlContent } from '@md/core/utils'

const markdown = `# Hello

Visit [Example Site](https://example.com) for details.

\`\`\`js
console.log('ok')
\`\`\`
`

function assert(condition, message) {
  if (!condition)
    throw new Error(message)
}

function runCase(name, opts, checks) {
  const renderer = initRenderer({ legend: `none`, ...opts })
  const html = modifyHtmlContent(markdown, renderer)

  for (const [label, fn] of checks) {
    assert(fn(html), `${name}: ${label}`)
  }

  console.log(`✓ ${name}`)
}

runCase(`default renderer`, {}, [
  [`contains heading`, html => html.includes(`Hello`)],
  [`contains external link`, html => html.includes(`example.com`)],
  [`cite disabled`, html => !html.includes(`<sup>[`)],
])

runCase(`citeStatus enabled`, { citeStatus: true }, [
  [`converts link to citation`, html => html.includes(`<sup>[`) && html.includes(`example.com`)],
])

runCase(`countStatus enabled`, { countStatus: true }, [
  [`includes reading stats`, html => /阅读|分钟|字/.test(html)],
])

runCase(`mac code block`, { isMacCodeBlock: true }, [
  [`enables mac-sign style`, html => html.includes(`.mac-sign`) && html.includes(`display: flex`)],
])

console.log(`\nAll VSCode extension smoke tests passed.`)
