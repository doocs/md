#!/usr/bin/env node

import { readFileSync } from 'fs'
import getPort from 'get-port'
import {
  colors,
  parseArgv,
} from './util.js'
import { createServer } from './server.js'

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

const arg = parseArgv()

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
      console.log(`服务已启动:`)
      console.log(`打开链接 ${colors.green(`http://127.0.0.1:${port}`)} 即刻使用吧~`)
      console.log(``)

      const { spaceId, clientSecret } = arg
      if (spaceId && clientSecret) {
        console.log(`${colors.green('✅ 云存储已配置，可通过自定义代码上传图片')}`)
      }
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
