#!/usr/bin/env node

import { readFileSync } from 'fs'
import { spawn } from 'child_process'
import { platform } from 'os'
import getPort from 'get-port'
import {
  colors,
  parseArgv,
} from './util.js'
import { createServer } from './server.js'

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

const arg = parseArgv()

/**
 * 自动打开浏览器
 * @param {string} url - 要打开的 URL
 */
function openBrowser(url) {
  // 检查是否禁用自动打开
  if (arg.noBrowser === true || process.env.NO_BROWSER === 'true') {
    return
  }

  // CI 环境不打开浏览器
  if (process.env.CI === 'true') {
    return
  }

  // 非交互式终端不打开浏览器
  if (!process.stdout.isTTY) {
    return
  }

  try {
    const os = platform()
    let cmd, args

    if (os === 'win32') {
      // Windows
      cmd = 'cmd.exe'
      args = ['/c', 'start', '', url]
    } else if (os === 'darwin') {
      // macOS
      cmd = 'open'
      args = [url]
    } else {
      // Linux
      cmd = 'xdg-open'
      args = [url]
    }

    const child = spawn(cmd, args, {
      detached: true,
      stdio: 'ignore'
    })
    child.unref()

    console.log(`${colors.green('✅ 已自动打开浏览器')}`)
  } catch (err) {
    console.log(`${colors.yellow('⚠️  无法自动打开浏览器，请手动访问上面的链接')}`)
  }
}

async function startServer() {
  try {
    let { port = 8800 } = arg
    port = Number(port)

    port = await getPort({ port }).catch(_ => {
      console.log(`端口 ${port} 被占用，正在寻找可用端口...`)
      return getPort()
    })

    console.log(`doocs/md-cli v${packageJson.version}`)
    console.log(`服务启动中...`)

    const app = createServer(port)

    app.listen(port, '127.0.0.1', () => {
      const url = `http://127.0.0.1:${port}`
      console.log(`服务已启动:`)
      console.log(`打开链接 ${colors.green(url)} 即刻使用吧~`)
      console.log(``)

      const { spaceId, clientSecret } = arg
      if (spaceId && clientSecret) {
        console.log(`${colors.green('✅ 云存储已配置，可通过自定义代码上传图片')}`)
      }

      // 自动打开浏览器
      setTimeout(() => openBrowser(url), 1000)
    })

    process.once('SIGINT', () => {
      console.log('\n服务器已关闭')
      process.exit(0)
    })

    process.once('SIGTERM', () => {
      console.log('\n服务器已关闭')
      process.exit(0)
    })

  } catch (err) {
    console.error('启动服务器失败:', err)
    process.exit(1)
  }
}

startServer()
