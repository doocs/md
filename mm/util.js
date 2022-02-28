const fetch = (...args) =>
  import(`node-fetch`).then(({ default: fetch }) => fetch(...args))
const FormData = require(`form-data`)

function dcloud(spaceInfo) {
  if (Boolean(spaceInfo.spaceId && spaceInfo.clientSecret) === false) {
    throw new Error(`请填写 spaceInfo`)
  }

  function sign(data, secret) {
    const hmac = require(`crypto`).createHmac(`md5`, secret)
    // 排序 obj 再转换为 key=val&key=val 的格式
    const str = Object.keys(data)
      .sort()
      .reduce((acc, cur) => `${acc}&${cur}=${data[cur]}`, ``)
      .slice(1)
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
  dcloud,
}
