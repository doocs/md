const fetch = require('node-fetch')
const FormData = require(`form-data`)

/**
* 自定义控制台颜色
* https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
* nodejs 内置颜色: https://nodejs.org/api/util.html#util_foreground_colors
*/
function colors () {
  const util = require('util')

  function colorize (color, text) {
    const codes = util.inspect.colors[color]
    return `\x1b[${codes[0]}m${text}\x1b[${codes[1]}m`
  }

  let returnValue = {}
  Object.keys(util.inspect.colors).forEach((color) => {
    returnValue[color] = (text) => colorize(color, text)
  })

  const colorTable = new Proxy(returnValue, {
    get (obj, prop) {
      // 在没有对应的具名颜色函数时, 返回空函数作为兼容处理
      const res = obj[prop] ? obj[prop] : (arg => arg)
      return res
    }
  })

  // 取消下行注释, 查看所有的颜色和名字:
  // Object.keys(returnValue).forEach((color) => console.log(returnValue[color](color)))
  return colorTable
}

/**
 * 以 Promise 方式运行 spawn
 * @param {*} cmd 主程序
 * @param {*} args 程序参数数组
 * @param {*} opts spawn 选项
 */
function spawn (cmd, args, opts) {
  opts = { stdio: `inherit`, ...opts }
  opts.shell = opts.shell || process.platform === 'win32'
  return new Promise((resolve, reject) => {
    const cp = require('child_process')
    const child = cp.spawn(cmd, args, opts)
    let stdout = ''
    let stderr = ''
    child.stdout && child.stdout.on('data', d => { stdout += d })
    child.stderr && child.stderr.on('data', d => { stderr += d })
    child.on('error', reject)
    child.on('close', code => {
      resolve({code, stdout, stderr})
    })
  })
}

/**
 * 解析命令行参数
 * @param {*} arr 
 * @returns 
 */
function parseArgv(arr) {
  return (arr || process.argv.slice(2)).reduce((acc, arg) => {
    let [k, ...v] = arg.split('=')
    v = v.join(`=`) // 把带有 = 的值合并为字符串
    acc[k] = v === '' // 没有值时, 则表示为 true
      ? true
      : (
        /^(true|false)$/.test(v) // 转换指明的 true/false
        ? v === 'true'
        : (
          /[\d|.]+/.test(v)
          ? (isNaN(Number(v)) ? v : Number(v)) // 如果转换为数字失败, 则使用原始字符
          : v
        )
      )
    return acc
  }, {})
}

function dcloud(spaceInfo) {
  if(Boolean(spaceInfo.spaceId && spaceInfo.clientSecret) === false) {
    throw new Error(`请填写 spaceInfo`)
  }
  
  function sign(data, secret) {
    const hmac = require(`crypto`).createHmac(`md5`, secret)
    // 排序 obj 再转换为 key=val&key=val 的格式
    const str = Object.keys(data).sort().reduce((acc, cur) => `${acc}&${cur}=${data[cur]}`, ``).slice(1)
    hmac.update(str)
    return hmac.digest(`hex`)
  }
  
  async function anonymousAuthorize() {
    const data = {
      method: `serverless.auth.user.anonymousAuthorize`,
      params: `{}`,
      spaceId: spaceInfo.spaceId,
      timestamp: Date.now(),
    }
    return await fetch(`https://api.bspapp.com/client`, {
      headers: {
        'x-serverless-sign': sign(data, spaceInfo.clientSecret),
      },
      body: `{"method":"serverless.auth.user.anonymousAuthorize","params":"{}","spaceId":"${spaceInfo.spaceId}","timestamp":${data.timestamp}}`,
      method: `POST`,
    }).then((res) => res.json())
  }
  
  async function report({ id, token }) {
    const reportReq = {
      method: `serverless.file.resource.report`,
      params: `{"id":"${id}"}`,
      spaceId: spaceInfo.spaceId,
      timestamp: Date.now(),
      token: token,
    }
    return await fetch(`https://api.bspapp.com/client`, {
      headers: {
        'x-basement-token': reportReq.token,
        'x-serverless-sign': sign(reportReq, spaceInfo.clientSecret),
      },
      body: JSON.stringify(reportReq),
      method: `POST`,
    }).then((res) => res.json())
  }
  
  async function generateProximalSign({ name, token }) {
    const data = {
      method: `serverless.file.resource.generateProximalSign`,
      params: `{"env":"public","filename":"${name}"}`,
      spaceId: spaceInfo.spaceId,
      timestamp: Date.now(),
      token,
    }
    const res = await fetch(`https://api.bspapp.com/client`, {
      headers: {
        'x-basement-token': data.token,
        'x-serverless-sign': sign(data, spaceInfo.clientSecret),
      },
      body: JSON.stringify(data),
      method: `POST`,
    }).then((res) => res.json())
    return res
  }
  
  async function upload({ data, file }) {
    const formdata = new FormData()
    Object.entries({
      'Cache-Control': `max-age=2592000`,
      'Content-Disposition': `attachment`,
      OSSAccessKeyId: data.accessKeyId,
      Signature: data.signature,
      host: data.host,
      id: data.id,
      key: data.ossPath,
      policy: data.policy,
      success_action_status: 200,
      file,
    }).forEach(([key, val]) => formdata.append(key, val))
  
    return await fetch(`https://${data.host}`, {
      headers: {
        'X-OSS-server-side-encrpytion': `AES256`,
      },
      body: formdata,
      method: `POST`,
    })
  }
  
  async function uploadFile({ name = `unnamed.file`, file }) {
    const token = (await anonymousAuthorize()).data.accessToken
    const res = await generateProximalSign({ name, token })
    await upload({ data: res.data, file })
    await report({ id: res.data.id, token })
    const fileUrl = `https://${res.data.cdnDomain}/${res.data.ossPath}`
    return fileUrl
  }
  
  return uploadFile
  
}

module.exports = {
  colors: colors(),
  spawn,
  parseArgv,
  dcloud,
}
