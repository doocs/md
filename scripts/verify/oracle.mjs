/**
 * Oracle capability: browser-rendered ground truth for the md-web-cli gate.
 *
 * Serves the built web application, drives Chromium through the app's real
 * WeChat copy pipeline, and returns the captured clipboard HTML. This is a
 * capability, not an artifact: every write is confined to a caller-supplied
 * directory outside the repository, and repeated runs against the same build
 * return byte-identical HTML.
 *
 * The capability builds nothing. The caller must have built the app first;
 * a missing build fails loudly instead of producing partial output.
 */

import { createReadStream, existsSync, statSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright'
import { findSystemChrome, isCiEnvironment } from './environment.mjs'
import { assertOutsideRepository, REPO_ROOT } from './paths.mjs'

const WEB_DIST = resolve(REPO_ROOT, `apps/web/dist`)
const BUILD_COMMAND = `pnpm --filter @md/web build:only`

const NAV_TIMEOUT_MS = 60_000
const PREVIEW_TIMEOUT_MS = 60_000
const COPY_TIMEOUT_MS = 30_000
const STABILITY_POLLS = 6
const POLL_INTERVAL_MS = 250

const MIME = {
  '.html': `text/html; charset=utf-8`,
  '.js': `text/javascript; charset=utf-8`,
  '.mjs': `text/javascript; charset=utf-8`,
  '.css': `text/css; charset=utf-8`,
  '.json': `application/json`,
  '.png': `image/png`,
  '.jpg': `image/jpeg`,
  '.jpeg': `image/jpeg`,
  '.gif': `image/gif`,
  '.svg': `image/svg+xml`,
  '.ico': `image/x-icon`,
  '.woff': `font/woff`,
  '.woff2': `font/woff2`,
  '.ttf': `font/ttf`,
  '.map': `application/json`,
  '.txt': `text/plain; charset=utf-8`,
}

function assertBuilt(distDir) {
  const indexPath = join(distDir, `index.html`)
  if (!existsSync(indexPath)) {
    throw new Error(
      `The web application has not been built (missing ${indexPath}). `
      + `Build it first: \`${BUILD_COMMAND}\`. The Oracle capability builds nothing itself.`,
    )
  }
}

function startStaticServer(rootDir) {
  return new Promise((resolvePromise, reject) => {
    const server = createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent(new URL(req.url, `http://localhost`).pathname)
        // The build uses base `/md/`; strip the prefix before resolving.
        const relative = urlPath.replace(/^\/md\/?/, ``) || `index.html`
        const filePath = normalize(join(rootDir, relative))
        if (!filePath.startsWith(rootDir)) {
          res.writeHead(403)
          res.end(`forbidden`)
          return
        }
        const target = existsSync(filePath) && statSync(filePath).isFile()
          ? filePath
          : join(rootDir, `index.html`) // SPA fallback
        if (!existsSync(target)) {
          res.writeHead(404)
          res.end(`not found: ${urlPath}`)
          return
        }
        res.writeHead(200, { 'content-type': MIME[extname(target)] ?? `application/octet-stream` })
        createReadStream(target).pipe(res)
      }
      catch (error) {
        res.writeHead(500)
        res.end(`server error: ${error.message}`)
      }
    })
    server.on(`error`, reject)
    // Port 0 asks the OS for a free port: concurrent captures never collide.
    server.listen(0, `127.0.0.1`, () => resolvePromise(server))
  })
}

function launchOptions() {
  const executablePath = process.env.MD_WEB_CLI_CHROMIUM
  return {
    headless: true,
    args: [`--headless=new`, `--disable-web-security`, `--allow-file-access-from-files`],
    ...(executablePath ? { executablePath } : {}),
  }
}

/**
 * Launch the pinned Playwright browser, falling back to a system Chrome only
 * on a developer machine.
 *
 * CI must never take this path: GitHub runners ship Google Chrome, so a silent
 * fallback would turn a broken `playwright install` into a green gate running
 * a different browser than the one the publish workflow uses. An explicit
 * `MD_WEB_CLI_CHROMIUM` is also never overridden — the caller named a binary,
 * so its failure is real.
 */
async function launchBrowser() {
  try {
    return await chromium.launch(launchOptions())
  }
  catch (error) {
    const missingPinnedBrowser = /Executable doesn't exist/.test(error?.message ?? ``)
    if (process.env.MD_WEB_CLI_CHROMIUM || isCiEnvironment() || !missingPinnedBrowser)
      throw error

    const chrome = findSystemChrome()
    if (!chrome)
      throw error

    process.stderr.write(
      `[oracle] local fallback: the pinned Playwright browser is not installed; `
      + `using system Chrome at ${chrome}. CI runs the pinned build, so local and CI results `
      + `may differ. Install it for parity: pnpm exec playwright install chromium\n`,
    )
    // Remember the fallback so a multi-fixture run pays the failed lookup once
    // and does not repeat the warning per fixture.
    process.env.MD_WEB_CLI_CHROMIUM = chrome
    return await chromium.launch(launchOptions())
  }
}

async function readPreviewState(page) {
  return page.evaluate(() => {
    // Cheap rolling hash, in-page: text identity without shipping the text out.
    const hashText = (value) => {
      let hash = 0
      for (let index = 0; index < value.length; index++)
        hash = (hash * 31 + value.charCodeAt(index)) | 0
      return hash
    }
    const output = document.getElementById(`output`)
    if (!output)
      return null
    return {
      length: output.innerHTML.length,
      // The signature has to change when only the text changes: a custom
      // fixture could otherwise render with the same element counts as the
      // app's default document and never look "ready".
      signature: [
        output.innerHTML.length,
        output.querySelectorAll(`h1, h2, h3, h4, h5, h6`).length,
        output.querySelectorAll(`table`).length,
        output.querySelectorAll(`section`).length,
        output.querySelectorAll(`pre`).length,
        output.querySelectorAll(`p`).length,
        hashText(output.textContent ?? ``),
      ].join(`|`),
      text: output.textContent ?? ``,
      pendingDiagram: !!output.querySelector(`[data-md-diagram-state="loading"]`),
      pendingMath: !!output.querySelector(`.katex-pending`),
      pendingLanguage: !!output.querySelector(`[data-language-pending]`),
    }
  })
}

/**
 * Wait until the preview reflects the injected fixture and stops changing.
 *
 * Fixture-agnostic on purpose: a minimal probe fixture and the full-coverage
 * fixture must both satisfy the same readiness rules, so readiness cannot key
 * off "the full fixture's table exists". The rules are: the preview changed
 * after injection, holds no pending async placeholders, and its structural
 * signature is stable across several polls.
 */
async function waitForStablePreview(page, beforeSignature) {
  await page.waitForSelector(`#output`, { timeout: NAV_TIMEOUT_MS })

  const deadline = Date.now() + PREVIEW_TIMEOUT_MS
  let previousSignature = ``
  let stableCount = 0

  while (Date.now() < deadline) {
    const state = await readPreviewState(page)
    const ready = state
      && state.text.trim().length > 0
      && state.signature !== beforeSignature
      && !state.pendingDiagram
      && !state.pendingMath
      && !state.pendingLanguage
    if (ready) {
      if (state.signature === previousSignature) {
        stableCount += 1
        if (stableCount >= STABILITY_POLLS)
          return state
      }
      else {
        stableCount = 0
        previousSignature = state.signature
      }
    }
    else {
      stableCount = 0
    }
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
  }

  throw new Error(`preview did not stabilize within ${PREVIEW_TIMEOUT_MS / 1000}s`)
}

/**
 * Capture the browser Oracle for one fixture.
 *
 * @param {object} options
 * @param {string} options.fixturePath Markdown fixture to inject.
 * @param {string} options.outDir Fresh directory outside the repository; the
 *   captured HTML is written here as `oracle.html`.
 * @param {string} [options.distDir] Built web app directory (testing seam).
 * @param {Array<string|{content: string}>} [options.initScripts] Scripts run
 *   before app boot, e.g. to seed a projected config into localStorage.
 * @param {(page: import('playwright').Page) => Promise<void>} [options.afterLoad]
 *   Runs once the app shell is up and before the fixture is injected.
 * @returns {Promise<string>} The captured clipboard HTML (byte-exact).
 */
export async function captureOracle(options) {
  const {
    fixturePath,
    outDir,
    distDir = WEB_DIST,
    initScripts = [],
    afterLoad,
  } = options

  const safeOutDir = assertOutsideRepository(outDir, `Oracle output directory`)
  assertBuilt(distDir)
  if (!existsSync(fixturePath))
    throw new Error(`fixture not found: ${fixturePath}`)

  const fixture = await readFile(fixturePath, `utf8`)
  await mkdir(safeOutDir, { recursive: true })

  const server = await startStaticServer(distDir)
  const port = server.address().port
  const pageUrl = `http://127.0.0.1:${port}/md/`

  let browser
  try {
    browser = await launchBrowser()
    const context = await browser.newContext({
      viewport: { width: 1400, height: 1000 },
      permissions: [`clipboard-read`, `clipboard-write`],
      locale: `zh-CN`,
      baseURL: `http://127.0.0.1:${port}`,
    })

    // The copy flow forces a light render anyway; pinning the UI theme keeps
    // the capture independent of the machine's colour-scheme preference.
    await context.addInitScript(() => {
      try {
        localStorage.setItem(`vueuse-color-scheme`, `light`)
      }
      catch {}
    })
    for (const script of initScripts) {
      if (typeof script === `string`)
        await context.addInitScript({ content: script })
      else
        await context.addInitScript(script)
    }

    const page = await context.newPage()
    page.setDefaultTimeout(NAV_TIMEOUT_MS)

    const pageErrors = []
    page.on(`pageerror`, (error) => {
      pageErrors.push(String(error))
    })

    await page.goto(pageUrl, { waitUntil: `domcontentloaded` })
    await page.waitForSelector(`.cm-editor`, { timeout: NAV_TIMEOUT_MS })
    await page.waitForSelector(`#output`, { timeout: NAV_TIMEOUT_MS })

    // Settle the default document before reading the baseline signature.
    await page.waitForFunction(() => {
      const output = document.getElementById(`output`)
      return output && output.textContent.length > 0
    }, { timeout: NAV_TIMEOUT_MS })
    const before = await readPreviewState(page)

    if (afterLoad)
      await afterLoad(page)

    // Inject through the app's own input handling: CodeMirror ignores
    // synthetic DOM selections, so focus for real and replace the document
    // with keyboard select-all + insertText. The app's debounced listeners
    // then refresh the preview and persist the post as if typed.
    await page.click(`.cm-content`)
    await page.keyboard.press(`ControlOrMeta+A`)
    await page.keyboard.insertText(fixture)

    await waitForStablePreview(page, before.signature)

    // Trigger the real WeChat copy flow through the header's copy button.
    const copyButton = page.locator(`header button:has-text("复制"), .header-container button:has-text("复制")`).first()
    if (await copyButton.count() === 0)
      throw new Error(`WeChat copy button not found in header — has the header markup changed?`)
    await copyButton.click()

    // The clipboard is the app's own completion signal: the copy flow writes
    // `text/html` when it finishes, so poll it instead of sleeping past the
    // button's spinner. A fresh browser context starts with an empty clipboard.
    const clipboardDeadline = Date.now() + COPY_TIMEOUT_MS
    let clipboardHtml = ``
    while (Date.now() < clipboardDeadline) {
      clipboardHtml = await page.evaluate(async () => {
        const items = await navigator.clipboard.read()
        for (const item of items) {
          if (item.types.includes(`text/html`)) {
            const blob = await item.getType(`text/html`)
            return await blob.text()
          }
        }
        return ``
      })
      if (clipboardHtml)
        break
      await new Promise(r => setTimeout(r, 100))
    }

    if (!clipboardHtml) {
      throw new Error(
        `clipboard text/html is still empty after ${COPY_TIMEOUT_MS / 1000}s — the copy flow did not produce output`,
      )
    }

    if (pageErrors.length > 0)
      process.stderr.write(`[oracle] warning: ${pageErrors.length} page error(s): ${pageErrors[0]}\n`)

    // The raw clipboard payload: no provenance comment, no wrapper, nothing
    // added. Any extra byte here would make the byte comparison lie.
    await writeFile(join(safeOutDir, `oracle.html`), clipboardHtml, `utf8`)
    return clipboardHtml
  }
  finally {
    if (browser)
      await browser.close().catch(() => {})
    server.close()
  }
}
