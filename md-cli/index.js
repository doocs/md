#!/usr/bin/env node

const getPort = require(`get-port`)
const {
  portIsOk,
  handleSpace,
  colors,
  spawn,
  parseArgv,
} = require(`./util.js`)

const arg = parseArgv()

new Promise(async () => {
  let { port = 8800, testPort, replayPort } = arg
  port = Number(port)
  ;[port, testPort, replayPort] = await Promise.all([port, port+1, port+2].map(item => getPort({port: item}) )).catch(err => console.log(`err`, err))
  const line = Object.entries({
    ...arg,
    proxy: `https://doocs.gitee.io/`,
    port,
    testPort,
    replayPort,
    '--config': handleSpace(`${__dirname}/mm.config.js`),
  }).map(([key, val]) => `${key}=${val}`).join(` `)
  const cliArg = [handleSpace(`${__dirname}/node_modules/mockm/run.js`), `--log-line`, line]
  spawn(`node`, cliArg)
  let oldTime = Date.now()
  console.log(`服务启动中...`)
  console.log(`doocs/md-cli v${require(`./package.json`).version}`)
  let timer = setInterval(async () => {
    if((await portIsOk(port)) !== true) { // 服务启动成功
      clearInterval(timer)
      console.log(`服务已启动:`)
      console.log(`打开链接 ${colors.green(`http://127.0.0.1:${port}/md/`)} 即刻使用吧~`)
    } else if(Date.now() - oldTime > 10 * 1e3) {
      clearInterval(timer)
      console.log(`服务 ${port} 初始化失败, 请重试.`)
      process.exit()
    }
  }, 1e3);
}).catch(err => console.log(err))
