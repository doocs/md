#!/usr/bin/env node

const getPort = require(`get-port`)
const {
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
    '--config': `"${__dirname}/mm.config.js"`,
  }).map(([key, val]) => `${key}=${val}`).join(` `)
  const cliArg = [`"${__dirname}/node_modules/mockm/run.js"`, `--log-line`, line]
  spawn(`node`, cliArg)
  setTimeout(() => {
    // process.stdout.write('\33c\33[3J')
    console.log(``)
    console.log(`doocs/md 服务已启动:`)
    console.log(`打开链接 ${colors.green(`http://127.0.0.1:${port}/md/`)} 即刻使用吧~`)
    console.log(``)
  }, 3*1e3);
})
