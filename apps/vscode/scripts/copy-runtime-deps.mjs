import { execSync } from 'node:child_process'
import fs from 'node:fs'
/**
 * Install production runtime deps into runtime/ for self-contained vsix packaging.
 * Webpack externals resolve isomorphic-dompurify from this folder.
 */
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const vscodeRoot = path.resolve(__dirname, `..`)
const runtimeDir = path.join(vscodeRoot, `runtime`)
const runtimePkg = path.join(runtimeDir, `package.json`)
const lockFile = path.join(runtimeDir, `package-lock.json`)

function resolveDompurifyVersion() {
  const requireFromVscode = createRequire(path.join(vscodeRoot, `package.json`))
  let dir = path.dirname(requireFromVscode.resolve(`isomorphic-dompurify`))

  for (let depth = 0; depth < 6; depth++) {
    const candidate = path.join(dir, `package.json`)
    if (fs.existsSync(candidate)) {
      const pkg = JSON.parse(fs.readFileSync(candidate, `utf8`))
      if (pkg.name === `isomorphic-dompurify`)
        return pkg.version
    }
    dir = path.dirname(dir)
  }

  throw new Error(`could not resolve isomorphic-dompurify version from workspace install`)
}

const dompurifyVersion = resolveDompurifyVersion()

const runtimePackage = {
  name: `doocs-md-runtime`,
  private: true,
  type: `commonjs`,
  dependencies: {
    'isomorphic-dompurify': dompurifyVersion,
  },
}

fs.mkdirSync(runtimeDir, { recursive: true })
fs.writeFileSync(runtimePkg, `${JSON.stringify(runtimePackage, null, 2)}\n`)

const installedDompurifyPkg = path.join(runtimeDir, `node_modules`, `isomorphic-dompurify`, `package.json`)
const needsInstall = !fs.existsSync(installedDompurifyPkg)
  || JSON.parse(fs.readFileSync(installedDompurifyPkg, `utf8`)).version !== dompurifyVersion

if (needsInstall || process.env.FORCE_RUNTIME_INSTALL === `1`) {
  if (fs.existsSync(lockFile))
    fs.rmSync(lockFile)
  if (fs.existsSync(path.join(runtimeDir, `node_modules`)))
    fs.rmSync(path.join(runtimeDir, `node_modules`), { recursive: true })
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

const installedVersion = JSON.parse(fs.readFileSync(dompurifyPkg, `utf8`)).version
if (installedVersion !== dompurifyVersion) {
  throw new Error(
    `runtime isomorphic-dompurify version mismatch: expected ${dompurifyVersion}, got ${installedVersion}`,
  )
}

if (!fs.existsSync(jsdomPkg)) {
  throw new Error(`runtime install failed: jsdom missing (required by isomorphic-dompurify)`)
}

console.log(`✓ runtime deps ready at ${path.join(runtimeDir, `node_modules`)} (isomorphic-dompurify@${dompurifyVersion})`)
