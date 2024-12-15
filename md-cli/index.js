#!/usr/bin/env node

const { ProcessManager } = require(`@wll8/process-manager`);
const getPort = require(`get-port`)
const {
  handleSpace,
  colors,
  parseArgv,
} = require(`./util.js`)

const arg = parseArgv()

new Promise(async () => {
  let { port = 8800, testPort, replayPort } = arg
  port = Number(port)
  ;[port, testPort, replayPort] = await Promise.all([port, port+1, port+2].map(item => getPort({port: item}) )).catch(err => console.log(`err`, err))
  const line = Object.entries({
    ...arg,
    proxy: `https://doocs-md.pages.dev`,
    port,
    testPort,
    replayPort,
    '--config': handleSpace(`${__dirname}/mm.config.js`),
  }).map(([key, val]) => `${key}=${val}`)
  const cliArg = [handleSpace(`${__dirname}/node_modules/mockm/run.js`), `--log-line`, ...line]
  console.log(`doocs/md-cli v${require(`./package.json`).version}`)
  console.log(`服务启动中...`)
  const cp = new ProcessManager(cliArg)
  cp.on(`stdout`, (info = ``) => {
    if(info.match(`:${port}/`)) {
      console.log(`服务已启动:`)
      console.log(`打开链接 ${colors.green(`http://127.0.0.1:${port}/md/`)} 即刻使用吧~`)
    }
    if(info.match(`Port is occupied`)) {
      process.exit()
    }
  })
}).catch(err => console.log(err))
