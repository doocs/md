/**
 * 浏览器启动工具库 - 即插即用的实用函数
 *
 * 这个文件包含了开箱即用的工具函数，可直接复制到项目中使用
 */

import { spawn, spawnSync, exec } from 'node:child_process'
import { platform } from 'node:os'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/**
 * ============================================================================
 * 基础工具函数
 * ============================================================================
 */

/**
 * 获取当前操作系统
 * @returns {'windows' | 'macos' | 'linux' | 'unknown'}
 */
export function getOS() {
  const p = platform()
  if (p === 'win32') return 'windows'
  if (p === 'darwin') return 'macos'
  if (p === 'linux') return 'linux'
  return 'unknown'
}

/**
 * 检查是否运行在 WSL 中
 */
export function isWSL() {
  return process.env.WSL_DISTRO_NAME !== undefined
}

/**
 * 检查是否在 CI/CD 环境中
 */
export function isCI() {
  return (
    process.env.CI === 'true' ||
    process.env.CONTINUOUS_INTEGRATION === 'true' ||
    process.env.BUILD_ID !== undefined ||  // Jenkins
    process.env.GITHUB_ACTIONS === 'true' ||  // GitHub Actions
    process.env.GITLAB_CI === 'true' ||  // GitLab CI
    process.env.CIRCLECI === 'true' ||  // CircleCI
    process.env.TRAVIS === 'true'  // Travis CI
  )
}

/**
 * 检查是否在交互式 TTY 环境中
 */
export function isInteractive() {
  return process.stdout.isTTY && process.stdin.isTTY
}

/**
 * 检查是否应该启动浏览器
 * @returns {boolean}
 */
export function shouldLaunchBrowser() {
  // 检查禁用标志
  if (process.env.NO_BROWSER === 'true') return false
  if (process.env.HEADLESS === 'true') return false

  // 检查 CI 环境
  if (isCI()) return false

  // 检查交互式
  if (!isInteractive()) return false

  // Linux 检查 DISPLAY
  if (getOS() === 'linux' && !process.env.DISPLAY) return false

  return true
}

/**
 * ============================================================================
 * 浏览器检测工具
 * ============================================================================
 */

/**
 * 检查浏览器是否在系统 PATH 中
 * @param {string} browserName - 浏览器名称或路径
 * @returns {Promise<boolean>}
 */
export async function isBrowserAvailable(browserName) {
  const os = getOS()

  try {
    if (os === 'windows') {
      const result = spawnSync('where', [browserName], {
        stdio: 'pipe',
        encoding: 'utf-8'
      })
      return result.status === 0
    } else {
      const result = spawnSync('which', [browserName], {
        stdio: 'pipe',
        encoding: 'utf-8'
      })
      return result.status === 0
    }
  } catch (error) {
    return false
  }
}

/**
 * 获取浏览器路径
 * @param {string} browserName - 浏览器名称
 * @returns {Promise<string|null>}
 */
export async function getBrowserPath(browserName) {
  const os = getOS()

  try {
    if (os === 'windows') {
      const result = spawnSync('where', [browserName], {
        stdio: 'pipe',
        encoding: 'utf-8'
      })
      if (result.status === 0) {
        return result.stdout.trim().split('\n')[0]
      }
    } else {
      const result = spawnSync('which', [browserName], {
        stdio: 'pipe',
        encoding: 'utf-8'
      })
      if (result.status === 0) {
        return result.stdout.trim()
      }
    }
  } catch (error) {
    return null
  }

  return null
}

/**
 * 查找第一个可用的浏览器
 * @param {string[]} browserNames - 浏览器名称列表
 * @returns {Promise<{name: string, path: string}|null>}
 */
export async function findFirstAvailableBrowser(browserNames = []) {
  const defaultBrowsers = {
    windows: ['chrome.exe', 'msedge.exe', 'firefox.exe', 'iexplore.exe'],
    macos: ['Google Chrome', 'Firefox', 'Microsoft Edge', 'Safari'],
    linux: ['google-chrome', 'chromium', 'firefox', 'x-www-browser']
  }

  const os = getOS()
  const browsers = browserNames.length > 0
    ? browserNames
    : (defaultBrowsers[os] || [])

  for (const browserName of browsers) {
    if (await isBrowserAvailable(browserName)) {
      const path = await getBrowserPath(browserName)
      if (path) {
        return { name: browserName, path }
      }
    }
  }

  return null
}

/**
 * 检查系统中所有可用的浏览器
 * @returns {Promise<{name: string, path: string}[]>}
 */
export async function getAvailableBrowsers() {
  const browsersList = {
    windows: ['chrome.exe', 'msedge.exe', 'firefox.exe'],
    macos: ['Google Chrome', 'Firefox', 'Microsoft Edge'],
    linux: ['google-chrome', 'chromium', 'firefox']
  }

  const os = getOS()
  const browsers = browsersList[os] || []
  const available = []

  for (const browserName of browsers) {
    if (await isBrowserAvailable(browserName)) {
      const path = await getBrowserPath(browserName)
      if (path) {
        available.push({ name: browserName, path })
      }
    }
  }

  return available
}

/**
 * ============================================================================
 * 浏览器启动函数
 * ============================================================================
 */

/**
 * 使用 child_process 启动浏览器（推荐用于 CLI）
 * @param {string} url - 要打开的 URL
 * @param {Object} options
 * @param {string} options.browser - 指定浏览器路径
 * @param {string[]} options.args - 额外的浏览器参数
 * @param {boolean} options.incognito - 隐私模式
 * @param {boolean} options.wait - 是否等待浏览器关闭
 * @returns {Promise<void>}
 */
export async function launchBrowserChildProcess(url, options = {}) {
  const {
    browser,
    args = [],
    incognito = false,
    wait = false
  } = options

  const os = getOS()

  try {
    if (os === 'windows') {
      if (browser) {
        // 使用指定浏览器
        const finalArgs = [url, ...args]
        if (incognito) finalArgs.unshift('--incognito')

        spawn(browser, finalArgs, {
          detached: true,
          stdio: 'ignore',
          windowsHide: false
        }).unref()
      } else {
        // 使用系统默认浏览器
        spawn('cmd.exe', ['/c', 'start', url], {
          detached: true,
          stdio: 'ignore'
        }).unref()
      }
    } else if (os === 'macos') {
      const openArgs = browser ? ['-a', browser] : []
      const finalArgs = [...openArgs, url]

      spawn('open', finalArgs, {
        detached: true,
        stdio: 'ignore'
      }).unref()
    } else if (os === 'linux') {
      const browserToUse = browser || 'x-www-browser'
      const finalArgs = [url, ...args]
      if (incognito) finalArgs.unshift('--incognito')

      spawn(browserToUse, finalArgs, {
        detached: true,
        stdio: 'ignore'
      }).unref()
    }

    return true
  } catch (error) {
    throw error
  }
}

/**
 * 使用 open 包启动浏览器
 * @param {string} url - 要打开的 URL
 * @param {Object} options
 * @param {string} options.app - 指定浏览器应用
 * @param {boolean} options.wait - 是否等待浏览器关闭
 * @param {boolean} options.background - 后台启动
 * @returns {Promise<void>}
 */
export async function launchBrowserOpen(url, options = {}) {
  try {
    const { default: open } = await import('open')

    const openOptions = {
      wait: options.wait ?? false,
      background: options.background ?? true,
      ...options
    }

    await open(url, openOptions)
  } catch (error) {
    throw new Error(`open 包启动浏览器失败: ${error.message}`)
  }
}

/**
 * 智能启动浏览器 - 自动选择最佳方案
 * @param {string} url - 要打开的 URL
 * @param {Object} options
 * @param {string} options.preferredMethod - 优先方案 ('open' | 'child_process')
 * @param {boolean} options.fallback - 是否启用降级
 * @returns {Promise<boolean>} 返回是否成功启动
 */
export async function launchBrowserSmart(url, options = {}) {
  const {
    preferredMethod = 'child_process',
    fallback = true
  } = options

  // 检查是否应该启动浏览器
  if (!shouldLaunchBrowser()) {
    console.log(`ℹ 跳过浏览器启动 (CI/无界面环境或禁用)`)
    return false
  }

  // 第一优先级
  if (preferredMethod === 'open') {
    try {
      await launchBrowserOpen(url, { background: true })
      return true
    } catch (error) {
      if (!fallback) throw error
      console.warn(`⚠ open 包启动失败，尝试 child_process...`)
    }
  }

  // 第二优先级 / 降级
  try {
    await launchBrowserChildProcess(url)
    return true
  } catch (error) {
    if (!fallback) throw error
    console.warn(`⚠ child_process 启动失败`)
    return false
  }
}

/**
 * ============================================================================
 * 高级功能
 * ============================================================================
 */

/**
 * 启动浏览器并设置超时
 * @param {string} url
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<boolean>}
 */
export async function launchBrowserWithTimeout(url, timeout = 5000) {
  return Promise.race([
    launchBrowserSmart(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('浏览器启动超时')), timeout)
    )
  ]).catch(error => {
    console.warn(`⚠ 浏览器启动超时或失败: ${error.message}`)
    return false
  })
}

/**
 * 启动多个浏览器标签页
 * @param {string[]} urls - URL 列表
 * @param {Object} options
 * @returns {Promise<boolean>}
 */
export async function launchMultipleTabs(urls, options = {}) {
  if (!urls || urls.length === 0) {
    throw new Error('URLs 列表不能为空')
  }

  // 先启动第一个 URL
  const firstUrl = urls[0]
  const success = await launchBrowserSmart(firstUrl, options)

  if (!success) return false

  // 延迟后尝试启动其他 URL
  const delay = options.tabDelay ?? 1000
  for (let i = 1; i < urls.length; i++) {
    await new Promise(resolve => setTimeout(resolve, delay))
    try {
      await launchBrowserChildProcess(urls[i])
    } catch (error) {
      console.warn(`⚠ 启动第 ${i + 1} 个标签页失败`)
    }
  }

  return true
}

/**
 * 在特定浏览器中启动 URL
 * @param {string} url
 * @param {'chrome' | 'firefox' | 'edge' | 'safari'} browser
 * @returns {Promise<boolean>}
 */
export async function launchInBrowser(url, browser) {
  const browserMap = {
    chrome: {
      windows: 'chrome.exe',
      macos: 'Google Chrome',
      linux: 'google-chrome'
    },
    firefox: {
      windows: 'firefox.exe',
      macos: 'Firefox',
      linux: 'firefox'
    },
    edge: {
      windows: 'msedge.exe',
      macos: 'Microsoft Edge',
      linux: 'microsoft-edge-stable'
    },
    safari: {
      windows: null,
      macos: 'Safari',
      linux: null
    }
  }

  const os = getOS()
  const browserPath = browserMap[browser]?.[os]

  if (!browserPath) {
    throw new Error(`不支持在 ${os} 上启动 ${browser}`)
  }

  return launchBrowserChildProcess(url, { browser: browserPath })
}

/**
 * ============================================================================
 * 信息和诊断
 * ============================================================================
 */

/**
 * 打印浏览器启动诊断信息
 */
export async function printBrowserDiagnostics() {
  console.log('')
  console.log('╔════════════════════════════════════════════╗')
  console.log('║     浏览器启动诊断信息                     ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log('')

  console.log('系统信息:')
  console.log(`  OS: ${getOS()}`)
  console.log(`  Node: ${process.version}`)
  console.log(`  TTY: ${isInteractive() ? '是 (交互式)' : '否'}`)
  console.log(`  CI: ${isCI() ? '是' : '否'}`)
  console.log(`  WSL: ${isWSL() ? '是' : '否'}`)
  console.log('')

  console.log('浏览器检测:')
  const browsers = await getAvailableBrowsers()
  if (browsers.length > 0) {
    browsers.forEach(({ name, path }) => {
      console.log(`  ✓ ${name.padEnd(20)} ${path}`)
    })
  } else {
    console.log('  ✗ 未检测到任何浏览器')
  }
  console.log('')

  console.log('open 包检测:')
  try {
    await import('open')
    console.log('  ✓ open 包已安装')
  } catch {
    console.log('  ✗ open 包未安装 (可选)')
  }
  console.log('')

  console.log('启动建议:')
  console.log(`  shouldLaunchBrowser(): ${shouldLaunchBrowser()}`)
  if (!shouldLaunchBrowser()) {
    console.log('    原因: CI 环境或禁用浏览器启动')
  }
  console.log('')
}

/**
 * 获取浏览器启动状态报告
 * @returns {Promise<Object>}
 */
export async function getBrowserStatus() {
  const browsers = await getAvailableBrowsers()
  const hasOpen = await checkOpenPackage()

  return {
    os: getOS(),
    isCI: isCI(),
    isWSL: isWSL(),
    isInteractive: isInteractive(),
    shouldLaunch: shouldLaunchBrowser(),
    availableBrowsers: browsers,
    hasOpenPackage: hasOpen,
    timestamp: new Date().toISOString()
  }
}

/**
 * 检查 open 包是否可用
 * @returns {Promise<boolean>}
 */
export async function checkOpenPackage() {
  try {
    await import('open')
    return true
  } catch {
    return false
  }
}

/**
 * ============================================================================
 * 导出快速参考
 * ============================================================================
 *
 * 最常用的函数：
 *
 * 1. 基础启动
 *    import { launchBrowserSmart } from './browser-launcher-utils.js'
 *    await launchBrowserSmart('http://localhost:8800')
 *
 * 2. 带降级的智能启动
 *    const success = await launchBrowserSmart(url, {
 *      preferredMethod: 'open',  // 优先 open
 *      fallback: true             // 失败降级到 child_process
 *    })
 *
 * 3. 快速诊断
 *    import { printBrowserDiagnostics } from './browser-launcher-utils.js'
 *    await printBrowserDiagnostics()
 *
 * 4. 获取可用浏览器
 *    import { getAvailableBrowsers } from './browser-launcher-utils.js'
 *    const browsers = await getAvailableBrowsers()
 *
 * 5. 在特定浏览器中打开
 *    import { launchInBrowser } from './browser-launcher-utils.js'
 *    await launchInBrowser(url, 'chrome')
 */
