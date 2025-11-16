#!/usr/bin/env node

/**
 * md-cli 集成浏览器启动功能的示例
 *
 * 这个文件展示如何在实际项目中整合浏览器自动启动功能
 * 包含完整的错误处理和降级方案
 */

import { readFileSync } from 'fs'
import getPort from 'get-port'
import { colors, parseArgv } from './util.js'
import { createServer } from './server.js'
import { spawn, spawnSync } from 'node:child_process'
import { platform } from 'node:os'
import process from 'node:process'

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
)

const arg = parseArgv()

/**
 * ============================================================================
 * 集成版本：简单可靠的浏览器启动器
 * ============================================================================
 *
 * 这个版本是为 md-cli 优化的，采用最简单、最可靠的方案：
 * 1. 首先尝试 child_process（无依赖）
 * 2. 降级到 open 包（如果已安装）
 * 3. 最后提示手动访问
 */

class SimpleBrowserLauncher {
  constructor() {
    this.launched = false
  }

  /**
   * 启动浏览器的主方法
   * @param {string} url - 要打开的 URL
   * @returns {Promise<boolean>} 返回是否成功启动
   */
  async launch(url) {
    // 尝试 child_process 方案（推荐）
    if (await this.tryChildProcess(url)) {
      this.launched = true
      return true
    }

    // 尝试 open 包（备选）
    if (await this.tryOpenPackage(url)) {
      this.launched = true
      return true
    }

    // 所有方案都失败，但这不是致命错误
    return false
  }

  /**
   * 方案 1：使用 child_process (推荐用于 CLI)
   * - 优点：零依赖，启动快
   * - 缺点：需要分平台处理
   */
  async tryChildProcess(url) {
    try {
      const currentPlatform = platform()

      if (currentPlatform === 'win32') {
        // Windows: 使用 start 命令启动默认浏览器
        spawn('cmd.exe', ['/c', 'start', url], {
          detached: true,
          stdio: 'ignore',
          windowsHide: false
        }).unref()
      } else if (currentPlatform === 'darwin') {
        // macOS: 使用 open 命令
        spawn('open', [url], {
          detached: true,
          stdio: 'ignore'
        }).unref()
      } else if (currentPlatform === 'linux') {
        // Linux: 尝试 x-www-browser (系统默认浏览器符号链接)
        spawn('x-www-browser', [url], {
          detached: true,
          stdio: 'ignore'
        }).unref()
      } else {
        return false
      }

      console.log(`${colors.green('✓')} 已启动浏览器`)
      return true
    } catch (error) {
      // child_process 失败，继续尝试其他方案
      return false
    }
  }

  /**
   * 方案 2：使用 open 包 (备选)
   * - 优点：最稳定，错误处理完善
   * - 缺点：需要额外依赖
   */
  async tryOpenPackage(url) {
    try {
      // 动态导入 open 包
      const { default: open } = await import('open')

      await open(url, {
        wait: false,
        background: true
      })

      console.log(`${colors.green('✓')} 已启动浏览器 (使用 open 包)`)
      return true
    } catch (error) {
      // open 包不可用或启动失败
      return false
    }
  }

  /**
   * 获取启动提示信息
   */
  getManualAccessMessage(url) {
    return `
${colors.yellow('!')} 未能自动启动浏览器，请手动访问：

  ${colors.green(url)}

如果你的浏览器自动打开，请忽略此提示。`
  }
}

/**
 * ============================================================================
 * 主程序
 * ============================================================================
 */

async function startServer() {
  try {
    let { port = 8800 } = arg
    port = Number(port)

    // 获取可用端口
    port = await getPort({ port }).catch(_ => {
      console.log(`${colors.yellow('!')} 端口 ${port} 被占用，正在寻找可用端口...`)
      return getPort()
    })

    console.log(`doocs/md-cli v${packageJson.version}`)
    console.log(`${colors.blue('▶')} 服务启动中...`)

    // 创建 Express 服务器
    const app = createServer(port)

    // 启动服务器并尝试自动启动浏览器
    app.listen(port, '127.0.0.1', async () => {
      const url = `http://127.0.0.1:${port}`

      console.log('')
      console.log(colors.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
      console.log(colors.green('✓ 服务已启动'))
      console.log(colors.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
      console.log('')

      // 创建浏览器启动器实例
      const launcher = new SimpleBrowserLauncher()

      // 尝试启动浏览器（不阻塞主程序）
      const launched = await launcher.launch(url)

      // 如果自动启动失败，显示手动访问提示
      if (!launched) {
        console.log(launcher.getManualAccessMessage(url))
      }

      console.log('')

      // 显示云存储配置状态
      const { spaceId, clientSecret } = arg
      if (spaceId && clientSecret) {
        console.log(`${colors.green('✅')} 云存储已配置，可通过自定义代码上传图片`)
      }

      console.log('')
      console.log(`${colors.gray('按 Ctrl+C 退出')}`)
      console.log('')
    })

    // 处理进程终止信号
    process.once('SIGINT', () => {
      console.log('')
      console.log(colors.yellow('⊘ 服务器已关闭'))
      process.exit(0)
    })

    process.once('SIGTERM', () => {
      console.log('')
      console.log(colors.yellow('⊘ 服务器已关闭'))
      process.exit(0)
    })

  } catch (err) {
    console.error(`${colors.red('✗')} 启动服务器失败:`)
    console.error(err.message)
    process.exit(1)
  }
}

// 启动服务器
startServer()

/**
 * ============================================================================
 * 使用说明
 * ============================================================================
 *
 * 这个集成版本相比原始版本的改进：
 *
 * 1. 自动启动浏览器
 *    - 启动服务器时自动打开浏览器
 *    - 不阻塞主程序运行
 *    - 优雅的降级方案
 *
 * 2. 改进的用户提示
 *    - 清晰的状态消息
 *    - 错误处理和降级提示
 *    - 更好的终端输出格式
 *
 * 3. 可靠性
 *    - 多种浏览器启动方式
 *    - 失败不会导致程序中断
 *    - 跨平台支持
 *
 * 使用方法：
 *
 * // 替换原始的 index.js
 * cp index.integrated.js index.js
 *
 * // 或在 package.json 中修改 bin 指向
 * "bin": {
 *   "md-cli": "index.integrated.js"
 * }
 */
