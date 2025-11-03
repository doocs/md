#!/usr/bin/env node
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { cp, mkdir, readFile, rm, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import archiver from 'archiver'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, `..`)
const utoolsDir = path.join(rootDir, `apps`, `utools`)
const distDir = path.join(utoolsDir, `dist`)
const releaseDir = path.join(utoolsDir, `release`)
const iconSource = path.join(rootDir, `public`, `mpmd`, `icon-256.png`)
const iconTarget = path.join(utoolsDir, `logo.png`)
const manifestPath = path.join(utoolsDir, `plugin.json`)

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const spawnOptions = {
      stdio: `inherit`,
      shell: true,
      ...options,
    }
    const child = spawn(command, args, spawnOptions)
    child.on(`close`, (code) => {
      if (code === 0)
        resolve(code)
      else
        reject(new Error(`${[command, ...args].join(` `)} exited with code ${code}`))
    })
    child.on(`error`, reject)
  })
}

async function ensureFileExists(filePath, friendlyName) {
  try {
    await access(filePath, fs.constants.F_OK)
  }
  catch (error) {
    throw new Error(`${friendlyName ?? filePath} 不存在，请确认路径是否正确。`)
  }
}

async function main() {
  const pkg = JSON.parse(await readFile(path.join(rootDir, `package.json`), `utf8`))
  const version = pkg.version

  console.log(`> 下载 uTools 插件所需的本地资源`)
  await run(`node`, [path.join(__dirname, `download-utools-libs.mjs`)], { cwd: rootDir })

  console.log(`> 构建 uTools 前端资源（version: ${version}）`)
  await run(`pnpm`, [`--filter`, `@md/web`, `run`, `build:utools`], { cwd: rootDir })

  await ensureFileExists(distDir, `apps/utools/dist`)
  await ensureFileExists(manifestPath, `apps/utools/plugin.json`)
  await ensureFileExists(iconSource, `public/mpmd/icon-256.png`)

  const manifest = JSON.parse(await readFile(manifestPath, `utf8`))
  manifest.version = version
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + `\n`, `utf8`)

  await cp(iconSource, iconTarget)

  await rm(releaseDir, { recursive: true, force: true })
  await mkdir(releaseDir, { recursive: true })

  const packageName = `md-utools-v${version}`
  const packageRoot = path.join(releaseDir, packageName)
  await rm(packageRoot, { recursive: true, force: true })
  await mkdir(packageRoot, { recursive: true })

  await cp(distDir, path.join(packageRoot, `dist`), { recursive: true })

  for (const file of [`plugin.json`, `preload.js`, `logo.png`, `README.md`, `package.json`]) {
    const source = path.join(utoolsDir, file)
    await ensureFileExists(source, `apps/utools/${file}`)
    await cp(source, path.join(packageRoot, file), { recursive: true })
  }

  const zipPath = path.join(releaseDir, `${packageName}.zip`)
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath)
    const archive = archiver(`zip`, { zlib: { level: 9 } })

    output.on(`close`, resolve)
    archive.on(`error`, reject)

    archive.pipe(output)
    archive.directory(packageRoot, false)
    archive.finalize()
  })

  console.log(`✔ uTools 插件打包完成 => ${path.relative(rootDir, zipPath)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
