/**
 * Verify bundled previewRenderer.js can render HTML in Node.
 */
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const { buildPreviewHtml } = require(path.join(__dirname, `..`, `dist`, `previewRenderer.js`))

const html = buildPreviewHtml({
  markdown: `# Test\n\n[link](https://example.com)`,
  primaryColor: `#000000`,
  fontFamily: `sans-serif`,
  fontSize: `16px`,
  theme: `default`,
  countStatus: false,
  isMacCodeBlock: false,
  citeStatus: false,
})

if (!html.includes(`Test`) || !html.includes(`example.com`)) {
  throw new Error(`previewRenderer output missing expected content`)
}

console.log(`✓ previewRenderer.js renders HTML in Node`)
