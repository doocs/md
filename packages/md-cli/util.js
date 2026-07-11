import FormData from 'form-data'
import process from 'node:process'
import util from 'node:util'
import crypto from 'node:crypto'

/**
 * Custom console colors.
 * https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
 * Node built-in colors: https://nodejs.org/api/util.html#util_foreground_colors
 */
function colors() {
  function colorize(color, text) {
    const codes = util.inspect.colors[color]
    return `\x1B[${codes[0]}m${text}\x1B[${codes[1]}m`
  }

  const returnValue = {}
  Object.keys(util.inspect.colors).forEach((color) => {
    returnValue[color] = text => colorize(color, text)
  })

  const colorTable = new Proxy(returnValue, {
    get(obj, prop) {
      // No named color helper: return identity for compatibility
      const res = obj[prop] ? obj[prop] : arg => arg
      return res
    },
  })

  // Uncomment to list all color names:
  // Object.keys(returnValue).forEach((color) => console.log(returnValue[color](color)))
  return colorTable
}

/** Parse CLI args into key/value (boolean flags, numbers, strings). */
function parseArgv(arr) {
  return (arr || process.argv.slice(2)).reduce((acc, arg) => {
    let [k, ...v] = arg.split(`=`)
    v = v.join(`=`) // rejoin values that contain =
    acc[k] = v === `` // bare flag → true
      ? true
      : (
        /^(true|false)$/.test(v) // explicit boolean
          ? v === `true`
          : (
            /[\d|.]+/.test(v)
              ? (Number.isNaN(Number(v)) ? v : Number(v)) // keep string if not numeric
              : v
          )
      )
    return acc
  }, {})
}

function dcloud(spaceInfo) {
  if (Boolean(spaceInfo.spaceId && spaceInfo.clientSecret) === false) {
    throw new Error(`请填写 spaceInfo`)
  }

  function sign(data, secret) {
    const hmac = crypto.createHmac(`md5`, secret)
    // Sort keys, serialize as key=val&key=val
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
    }).then(res => res.json())
  }

  async function report({ id, token }) {
    const reportReq = {
      method: `serverless.file.resource.report`,
      params: `{"id":"${id}"}`,
      spaceId: spaceInfo.spaceId,
      timestamp: Date.now(),
      token,
    }
    return await fetch(`https://api.bspapp.com/client`, {
      headers: {
        'x-basement-token': reportReq.token,
        'x-serverless-sign': sign(reportReq, spaceInfo.clientSecret),
      },
      body: JSON.stringify(reportReq),
      method: `POST`,
    }).then(res => res.json())
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
    }).then(res => res.json())
    return res
  }

  async function upload({ data, file }) {
    const formdata = new FormData()
    Object.entries({
      'Cache-Control': `max-age=2592000`,
      'Content-Disposition': `attachment`,
      'OSSAccessKeyId': data.accessKeyId,
      'Signature': data.signature,
      'host': data.host,
      'id': data.id,
      'key': data.ossPath,
      'policy': data.policy,
      'success_action_status': 200,
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

const colorsInstance = colors()

export {
  parseArgv,
  dcloud,
  colorsInstance as colors,
}
