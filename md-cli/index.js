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
  setTimeout(async () => {
    console.log(``)
    console.log(`doocs/md-cli v${require(`./package.json`).version}`)
    console.log(``)
    try {
      if(await portIsOk(port) === true) {
        throw new Error(`服务 ${port} 初始化失败`)
      }
      console.log(`服务已启动:`)
      console.log(`打开链接 ${colors.green(`http://127.0.0.1:${port}/md/`)} 即刻使用吧~`)
    } catch (error) {
      console.error(`启动错误 ${error}`)
      process.exit()
    }
    console.log(``)
  }, 3*1e3);
}).catch(err => console.log(err))
