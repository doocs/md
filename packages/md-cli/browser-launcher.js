/**
 * Windows 下自动启动浏览器的三种方案研究
 *
 * 本文件展示了在 Node.js 中实现跨平台浏览器自动启动的多种方法
 * 包括：1. open 包、2. child_process、3. 系统托盘集成
 */

import { spawn, spawnSync } from 'node:child_process'
import { platform } from 'node:os'
import process from 'node:process'

/**
 * ============================================================================
 * 方案 1: 使用 'open' 包 - 最推荐方案
 * ============================================================================
 *
 * 优点:
 *   - 跨平台支持 (Windows, macOS, Linux)
 *   - 自动识别默认浏览器
 *   - API 简单易用
 *   - 社区维护良好，稳定性强
 *   - 支持应用启动后台运行
 *
 * 缺点:
 *   - 需要额外依赖
 *   - 不支持自定义浏览器选择
 *
 * 使用场景: 生产环境、跨平台应用、优先用户体验
 */

export class OpenPackageLauncher {
  /**
   * 异步启动浏览器 (推荐用于 CLI 应用)
   * @param {string} url - 要打开的 URL
   * @param {Object} options - 配置选项
   * @returns {Promise<void>}
   */
  static async launchAsync(url, options = {}) {
    try {
      // 注意: open 包是 ESM 模块
      const { default: open } = await import('open')

      const openOptions = {
        wait: options.wait ?? false,  // 是否等待浏览器关闭
        background: options.background ?? true,  // 后台运行
        app: options.browser,  // 指定浏览器 (可选)
        ...options
      }

      await open(url, openOptions)
      console.log(`浏览器已启动: ${url}`)
    } catch (error) {
      console.error('使用 open 包启动浏览器失败:', error.message)
      // 降级方案: 回退到 child_process
      ChildProcessLauncher.launchSync(url)
    }
  }

  /**
   * 同步启动浏览器 (不阻塞主程序)
   * @param {string} url - 要打开的 URL
   */
  static launchSync(url) {
    try {
      const { default: open } = require('open')
      // 注意: 这在 ESM 中不支持，需要使用 await
      console.log('同步模式不支持 open 包，请使用异步模式')
    } catch (error) {
      console.error('错误:', error.message)
    }
  }
}

/**
 * ============================================================================
 * 方案 2: 使用 child_process - 直接调用系统命令
 * ============================================================================
 *
 * 优点:
 *   - 无需额外依赖，Node.js 内置 API
 *   - 底层控制力强，灵活性高
 *   - 轻量级，性能最优
 *   - 可以指定具体浏览器路径
 *   - 支持传递命令行参数给浏览器
 *
 * 缺点:
 *   - 需要分别处理不同平台 (Windows/macOS/Linux)
 *   - 需要检查浏览器是否安装
 *   - 错误处理较复杂
 *   - 浏览器路径依赖系统配置
 *
 * 使用场景:
 *   - 轻量级工具、不想添加依赖
 *   - 需要精细控制浏览器行为
 *   - 指定特定浏览器启动
 */

export class ChildProcessLauncher {
  /**
   * 启动浏览器 - Windows 方案
   */
  static launchWindows(url, options = {}) {
    try {
      const browsers = [
        'chrome.exe',
        'msedge.exe',
        'firefox.exe',
        'iexplore.exe'
      ]

      // 方案 1: 使用 start 命令 (最简单，自动使用默认浏览器)
      if (options.useDefault ?? true) {
        spawn('cmd.exe', ['/c', 'start', url], {
          detached: true,
          stdio: 'ignore',
          windowsHide: false  // 显示命令窗口
        }).unref()
        console.log(`✓ 已启动浏览器: ${url}`)
        return
      }

      // 方案 2: 指定浏览器启动
      const browserPath = options.browser || this.findBrowser(browsers)
      if (!browserPath) {
        throw new Error('未找到可用浏览器')
      }

      const args = [url]
      if (options.incognito) {
        args.unshift('--incognito')
      }
      if (options.inPrivate) {
        args.unshift('/private')
      }

      spawn(browserPath, args, {
        detached: true,
        stdio: 'ignore',
        windowsHide: false
      }).unref()

      console.log(`✓ 已启动浏览器: ${browserPath} ${url}`)
    } catch (error) {
      console.error(`✗ Windows 启动浏览器失败: ${error.message}`)
    }
  }

  /**
   * 启动浏览器 - macOS 方案
   */
  static launchMacOS(url, options = {}) {
    try {
      const browsers = [
        'Google Chrome',
        'Chromium',
        'Firefox',
        'Safari',
        'Microsoft Edge'
      ]

      // 使用 open 命令 + -a 指定应用
      const browser = options.browser || this.findBrowser(browsers)
      const args = browser
        ? ['-a', browser, url]
        : [url]

      const child = spawn('open', args, {
        detached: true,
        stdio: 'ignore'
      })

      child.unref()
      console.log(`✓ 已启动浏览器: ${url}`)
    } catch (error) {
      console.error(`✗ macOS 启动浏览器失败: ${error.message}`)
    }
  }

  /**
   * 启动浏览器 - Linux 方案
   */
  static launchLinux(url, options = {}) {
    try {
      const browsers = [
        'google-chrome',
        'chromium-browser',
        'firefox',
        'x-www-browser',  // 默认浏览器符号链接
        'www-browser'
      ]

      const browser = options.browser || this.findBrowser(browsers)
      if (!browser) {
        throw new Error('未找到可用浏览器')
      }

      const child = spawn(browser, [url], {
        detached: true,
        stdio: 'ignore'
      })

      child.unref()
      console.log(`✓ 已启动浏览器: ${url}`)
    } catch (error) {
      console.error(`✗ Linux 启动浏览器失败: ${error.message}`)
    }
  }

  /**
   * 跨平台启动浏览器
   */
  static launchSync(url, options = {}) {
    const currentPlatform = platform()

    switch (currentPlatform) {
      case 'win32':
        return this.launchWindows(url, options)
      case 'darwin':
        return this.launchMacOS(url, options)
      case 'linux':
        return this.launchLinux(url, options)
      default:
        console.error(`✗ 不支持的平台: ${currentPlatform}`)
    }
  }

  /**
   * 查找系统中第一个可用的浏览器
   * @param {string[]} browsers - 浏览器列表
   * @returns {string|null}
   */
  static findBrowser(browsers) {
    for (const browser of browsers) {
      try {
        // Windows 平台检查注册表或 PATH
        if (platform() === 'win32') {
          const result = spawnSync('where', [browser], {
            stdio: 'pipe',
            encoding: 'utf-8'
          })
          if (result.status === 0) {
            return result.stdout.trim().split('\n')[0]
          }
        } else {
          // Unix 平台使用 which 命令
          const result = spawnSync('which', [browser], {
            stdio: 'pipe',
            encoding: 'utf-8'
          })
          if (result.status === 0) {
            return result.stdout.trim()
          }
        }
      } catch (error) {
        continue
      }
    }
    return null
  }

  /**
   * 异步版本的启动方法
   */
  static async launchAsync(url, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.launchSync(url, options)
        setTimeout(resolve, 100)  // 给浏览器启动一些时间
      } catch (error) {
        reject(error)
      }
    })
  }
}

/**
 * ============================================================================
 * 方案 3: 系统托盘集成 (Electron tray + HTTP 启动)
 * ============================================================================
 *
 * 优点:
 *   - 用户友好的图形界面
 *   - 可以托盘最小化，保持后台运行
 *   - 支持快速启动菜单
 *   - 专业应用外观
 *   - 可以实现更复杂的交互
 *
 * 缺点:
 *   - 需要 Electron 框架 (体积大，~150MB)
 *   - 学习曲线陡峭
 *   - 不适合轻量级 CLI 工具
 *   - Windows 资源占用较大
 *
 * 使用场景:
 *   - 桌面应用、需要托盘功能
 *   - 持久化后台运行的服务
 *   - 需要系统集成的复杂应用
 *
 * 注意: 这里提供概念和 HTTP 方案，实际 Electron 版本见下面的示例
 */

export class TrayLauncherHTTP {
  constructor(port = 8800) {
    this.port = port
    this.url = `http://127.0.0.1:${port}`
  }

  /**
   * 启动前端，然后启动浏览器
   * 这是 HTTP 友好的方式，不需要 GUI 框架
   */
  async launch() {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    系统托盘集成方案                        ║
║                 (HTTP 方式 - 无需 Electron)                ║
╚═══════════════════════════════════════════════════════════╝

说明:
  - 使用 Express 服务 Web 前端
  - 在内存中为托盘添加快捷菜单
  - 可以扩展为真实的 Electron 应用

步骤:
  1. Express 服务启动完毕
  2. 通过 child_process 或 open 启动浏览器
  3. 用户可以最小化或关闭浏览器窗口
  4. 服务仍在后台运行，可以通过 http://127.0.0.1:${this.port} 访问

完整 Electron 版本需要:
  - npm install electron
  - 使用 electron.app.whenReady() 初始化应用
  - electron.Menu.setApplicationMenu() 设置菜单
  - 创建 tray 和 context menu
  - 监听 app 和 window 事件
    `)

    // 启动浏览器
    ChildProcessLauncher.launchSync(this.url)
  }

  /**
   * 获取托盘菜单配置 (用于 Electron)
   * 这只是配置结构示例
   */
  static getTrayMenuTemplate() {
    return [
      {
        label: '打开编辑器',
        click: () => {
          // 在这里启动浏览器或显示窗口
          ChildProcessLauncher.launchSync('http://127.0.0.1:8800')
        }
      },
      { type: 'separator' },
      {
        label: '新建无痕窗口',
        click: () => {
          ChildProcessLauncher.launchWindows('http://127.0.0.1:8800', {
            incognito: true
          })
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          process.exit(0)
        }
      }
    ]
  }

  /**
   * 获取应用菜单配置 (用于 Electron)
   */
  static getAppMenuTemplate() {
    return [
      {
        label: '文件',
        submenu: [
          {
            label: '退出',
            accelerator: 'CmdOrCtrl+Q',
            click: () => process.exit(0)
          }
        ]
      },
      {
        label: '视图',
        submenu: [
          {
            label: '重新加载',
            accelerator: 'CmdOrCtrl+R'
          },
          {
            label: '开发者工具',
            accelerator: 'CmdOrCtrl+Shift+I'
          }
        ]
      }
    ]
  }
}

/**
 * ============================================================================
 * 最佳实践: 统一的浏览器启动器
 * ============================================================================
 *
 * 这个类整合了上述所有方法，提供智能的降级方案
 */

export class BrowserLauncher {
  constructor(options = {}) {
    this.options = {
      preferredMethod: 'open',  // 'open' | 'child_process' | 'tray'
      fallback: true,  // 启用降级方案
      timeout: 5000,  // 浏览器启动超时时间
      ...options
    }
  }

  /**
   * 智能启动浏览器 - 综合方案
   * 自动尝试多种方法，确保成功率最高
   */
  async launch(url) {
    console.log(`🚀 正在启动浏览器...`)

    try {
      // 第一优先级: open 包 (如果已安装)
      if (this.options.preferredMethod === 'open') {
        await this.tryOpenPackage(url)
        return
      }

      // 第二优先级: child_process (通用方案)
      if (this.options.preferredMethod === 'child_process') {
        ChildProcessLauncher.launchSync(url, this.options)
        return
      }

      // 第三优先级: 托盘方案 (桌面应用)
      if (this.options.preferredMethod === 'tray') {
        const trayLauncher = new TrayLauncherHTTP()
        await trayLauncher.launch()
        return
      }

      // 默认降级方案
      if (this.options.fallback) {
        await this.fallbackLaunch(url)
      }
    } catch (error) {
      console.error(`✗ 启动浏览器失败: ${error.message}`)
      console.log(`📋 手动访问: ${url}`)
    }
  }

  /**
   * 尝试使用 open 包
   */
  async tryOpenPackage(url) {
    try {
      const { default: open } = await import('open')
      await open(url, {
        wait: false,
        background: true
      })
      console.log(`✓ 已使用 open 包启动浏览器`)
    } catch (error) {
      console.warn(`⚠ open 包不可用: ${error.message}`)
      if (this.options.fallback) {
        throw error  // 触发降级
      }
    }
  }

  /**
   * 降级方案: 依次尝试多种方法
   */
  async fallbackLaunch(url) {
    console.log(`📋 尝试降级方案...`)

    // 尝试 child_process
    try {
      ChildProcessLauncher.launchSync(url)
      console.log(`✓ 已使用系统命令启动浏览器`)
      return
    } catch (error) {
      console.warn(`⚠ 系统命令失败: ${error.message}`)
    }

    // 所有方案都失败
    console.log(`❌ 所有启动方式都失败`)
    console.log(`📍 请手动访问: ${url}`)
  }

  /**
   * 检查浏览器可用性
   */
  static async checkBrowserAvailable() {
    const checks = {
      'open 包': await this.checkOpenPackage(),
      'Chrome': ChildProcessLauncher.findBrowser(['chrome.exe', 'google-chrome', 'Chrome']),
      'Firefox': ChildProcessLauncher.findBrowser(['firefox.exe', 'firefox']),
      'Edge': ChildProcessLauncher.findBrowser(['msedge.exe', 'Microsoft Edge'])
    }

    console.log(`
╔════════════════════════════════════════════╗
║          浏览器可用性检查                  ║
╚════════════════════════════════════════════╝
`)

    Object.entries(checks).forEach(([name, available]) => {
      const status = available ? '✓ 可用' : '✗ 不可用'
      console.log(`${name.padEnd(12)} ${status}`)
    })
  }

  static async checkOpenPackage() {
    try {
      await import('open')
      return true
    } catch {
      return false
    }
  }
}

/**
 * ============================================================================
 * 使用示例
 * ============================================================================
 */

export async function exampleUsage() {
  const url = 'http://127.0.0.1:8800'

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║     Windows 下自动启动浏览器 - 三种方案对比演示         ║
╚═══════════════════════════════════════════════════════════╝
  `)

  // 检查浏览器可用性
  await BrowserLauncher.checkBrowserAvailable()

  console.log(`\n`)

  // 方案 1: open 包 (推荐用于生产环境)
  console.log(`━ 方案 1: 使用 'open' 包 (推荐) `)
  await OpenPackageLauncher.launchAsync(url).catch(() => {
    console.log(`提示: 需要先安装 'open' 包 (npm install open)`)
  })

  console.log(`\n`)

  // 方案 2: child_process (推荐用于轻量级工具)
  console.log(`━ 方案 2: 使用 child_process (轻量级)`)
  ChildProcessLauncher.launchSync(url)

  console.log(`\n`)

  // 方案 3: 系统托盘
  console.log(`━ 方案 3: 系统托盘集成 (需要 Electron)`)
  const trayLauncher = new TrayLauncherHTTP(8800)
  // await trayLauncher.launch()

  console.log(`\n`)

  // 最佳实践: 统一启动器
  console.log(`━ 最佳实践: BrowserLauncher (智能降级)`)
  const launcher = new BrowserLauncher({
    preferredMethod: 'child_process',  // 默认使用 child_process
    fallback: true
  })
  // await launcher.launch(url)
}

/**
 * ============================================================================
 * 在 md-cli 中的集成示例
 * ============================================================================
 *
 * 在 index.js 中使用:
 *
 * import { BrowserLauncher } from './browser-launcher.js'
 *
 * // 启动服务器后启动浏览器
 * app.listen(port, '127.0.0.1', async () => {
 *   console.log(`服务已启动: http://127.0.0.1:${port}`)
 *
 *   // 自动启动浏览器
 *   const launcher = new BrowserLauncher({
 *     preferredMethod: 'child_process',  // 轻量级，无依赖
 *     fallback: true
 *   })
 *
 *   await launcher.launch(`http://127.0.0.1:${port}`)
 * })
 */
