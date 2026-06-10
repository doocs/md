/**
 * Install production runtime deps into runtime/ for self-contained vsix packaging.
 * Webpack externals resolve isomorphic-dompurify from this folder.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const vscodeRoot = path.resolve(__dirname, `..`)
const runtimeDir = path.join(vscodeRoot, `runtime`)
const runtimePkg = path.join(runtimeDir, `package.json`)
const lockFile = path.join(runtimeDir, `package-lock.json`)

const runtimePackage = {
  name: `doocs-md-runtime`,
  private: true,
  type: `commonjs`,
  dependencies: {
    'isomorphic-dompurify': `^3.16.0`,
  },
}

fs.mkdirSync(runtimeDir, { recursive: true })
fs.writeFileSync(runtimePkg, `${JSON.stringify(runtimePackage, null, 2)}\n`)

const needsInstall = !fs.existsSync(
  path.join(runtimeDir, `node_modules`, `isomorphic-dompurify`, `package.json`),
)

if (needsInstall || process.env.FORCE_RUNTIME_INSTALL === `1`) {
  if (fs.existsSync(lockFile))
    fs.rmSync(lockFile)
  execSync(`npm install --omit=dev --no-package-lock`, {
    cwd: runtimeDir,
    stdio: `inherit`,
  })
}

const dompurifyPkg = path.join(runtimeDir, `node_modules`, `isomorphic-dompurify`, `package.json`)
const jsdomPkg = path.join(runtimeDir, `node_modules`, `jsdom`, `package.json`)

if (!fs.existsSync(dompurifyPkg)) {
  throw new Error(`runtime install failed: isomorphic-dompurify missing`)
}

if (!fs.existsSync(jsdomPkg)) {
  throw new Error(`runtime install failed: jsdom missing (required by isomorphic-dompurify)`)
}

console.log(`✓ runtime deps ready at ${path.join(runtimeDir, `node_modules`)}`)
