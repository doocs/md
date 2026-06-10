/**
 * Verify packaged runtime deps resolve from dist/ like an installed vsix.
 */
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const vscodeRoot = path.resolve(__dirname, `..`)
const requireFromDist = createRequire(path.join(vscodeRoot, `dist`, `previewRenderer.js`))

requireFromDist(`../runtime/node_modules/isomorphic-dompurify`)
requireFromDist(`../runtime/node_modules/jsdom`)

console.log(`✓ vsix runtime deps resolve from dist/`)
