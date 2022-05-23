import fetch from './fetch'
import { githubConfig, giteeConfig } from './config'
import CryptoJS from 'crypto-js'
import OSS from 'ali-oss'
import * as Minio from 'minio'
import COS from 'cos-js-sdk-v5'
import Buffer from 'buffer-from'
import { v4 as uuidv4 } from 'uuid'
import * as qiniu from 'qiniu-js'
import { utf16to8, base64encode, safe64 } from '../assets/scripts/tokenTools'
import * as tokenTools from '../assets/scripts/tokenTools'

function getConfig(useDefault, platform) {
  if (useDefault) {
    // load default config file
    const config = platform === `github` ? githubConfig : giteeConfig
    const { username, repoList, branch, accessTokenList } = config

    // choose random token from access_token list
    const tokenIndex = Math.floor(Math.random() * accessTokenList.length)
    const accessToken = accessTokenList[tokenIndex].replace(`doocsmd`, ``)

    // choose random repo from repo list
    const repoIndex = Math.floor(Math.random() * repoList.length)
    const repo = repoList[repoIndex]

    return { username, repo, branch, accessToken }
  }

  // load configuration from localStorage
  const customConfig = JSON.parse(localStorage.getItem(`${platform}Config`))

  // split username/repo
  const repoUrl = customConfig.repo
    .replace(`https://${platform}.com/`, ``)
    .replace(`http://${platform}.com/`, ``)
    .replace(`${platform}.com/`, ``)
    .split(`/`)
  return {
    username: repoUrl[0],
    repo: repoUrl[1],
    branch: customConfig.branch || `master`,
    accessToken: customConfig.accessToken,
  }
}

/**
 * 获取 `年/月/日` 形式的目录
 * @returns string
 */
function getDir() {
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, `0`)
  const day = date.getDate().toString().padStart(2, `0`)
  return `${year}/${month}/${day}`
}

/**
 * 根据文件名获取它以 `时间戳+uuid` 的形式
 * @param {string} filename 文件名
 * @returns
 */
function getDateFilename(filename) {
  const currentTimestamp = new Date().getTime()
  const fileSuffix = filename.split(`.`)[1]
  return `${currentTimestamp}-${uuidv4()}.${fileSuffix}`
}

//-----------------------------------------------------------------------
// GitHub File Upload
//-----------------------------------------------------------------------

async function ghFileUpload(content, filename) {
  const useDefault = localStorage.getItem(`imgHost`) === `default`
  const { username, repo, branch, accessToken } = getConfig(
    useDefault,
    `github`
  )
  const dir = getDir()
  const url = `https://api.github.com/repos/${username}/${repo}/contents/${dir}/`
  const dateFilename = getDateFilename(filename)
  const res = await fetch({
    url: url + dateFilename,
    method: `put`,
    headers: {
      Authorization: `token ${accessToken}`,
    },
    data: {
      content,
      branch,
      message: `Upload by ${window.location.href}`,
    },
  })
  const githubResourceUrl = `raw.githubusercontent.com/${username}/${repo}/${branch}/`
  const cdnResourceUrl = `fastly.jsdelivr.net/gh/${username}/${repo}@${branch}/`
  res.content = res.data?.content || res.content
  return useDefault
    ? res.content.download_url.replace(githubResourceUrl, cdnResourceUrl)
    : res.content.download_url
}

//-----------------------------------------------------------------------
// Gitee File Upload
//-----------------------------------------------------------------------

async function giteeUpload(content, filename) {
  const useDefault = localStorage.getItem(`imgHost`) === `default`
  const { username, repo, branch, accessToken } = getConfig(useDefault, `gitee`)
  const dir = getDir()
  const dateFilename = getDateFilename(filename)
  const url = `https://gitee.com/api/v5/repos/${username}/${repo}/contents/${dir}/${dateFilename}`
  const res = await fetch({
    url,
    method: `POST`,
    data: {
      content,
      branch,
      access_token: accessToken,
      message: `Upload by ${window.location.href}`,
    },
  })
  res.content = res.data?.content || res.content
  return encodeURI(res.content.download_url)
}

//-----------------------------------------------------------------------
// Qiniu File Upload
//-----------------------------------------------------------------------

function getQiniuToken(accessKey, secretKey, putPolicy) {
  const policy = JSON.stringify(putPolicy)
  const encoded = base64encode(utf16to8(policy))
  const hash = CryptoJS.HmacSHA1(encoded, secretKey)
  const encodedSigned = hash.toString(CryptoJS.enc.Base64)
  return `${accessKey}:${safe64(encodedSigned)}:${encoded}`
}

async function qiniuUpload(file) {
  const { accessKey, secretKey, bucket, region, path, domain } = JSON.parse(
    localStorage.getItem(`qiniuConfig`)
  )
  const token = getQiniuToken(accessKey, secretKey, {
    scope: bucket,
    deadline: Math.trunc(new Date().getTime() / 1000) + 3600,
  })
  const dir = path ? `${path}/` : ``
  const dateFilename = dir + getDateFilename(file.name)
  const observable = qiniu.upload(file, dateFilename, token, {}, { region })
  return new Promise((resolve, reject) => {
    observable.subscribe({
      next: (result) => {
        console.log(result)
      },
      error: (err) => {
        reject(err.message)
      },
      complete: (result) => {
        resolve(`${domain}/${result.key}`)
      },
    })
  })
}

//-----------------------------------------------------------------------
// AliOSS File Upload
//-----------------------------------------------------------------------

async function aliOSSFileUpload(content, filename) {
  const dateFilename = getDateFilename(filename)
  const { region, bucket, accessKeyId, accessKeySecret, cdnHost, path } =
    JSON.parse(localStorage.getItem(`aliOSSConfig`))
  const buffer = Buffer(content, `base64`)
  const dir = `${path}/${dateFilename}`
  const client = new OSS({
    region,
    bucket,
    accessKeyId,
    accessKeySecret,
  })
  try {
    const res = await client.put(dir, buffer)
    if (cdnHost === ``) return res.url
    return `${cdnHost}/${path === `` ? dateFilename : dir}`
  } catch (e) {
    return Promise.reject(e)
  }
}

//-----------------------------------------------------------------------
// TxCOS File Upload
//-----------------------------------------------------------------------

async function txCOSFileUpload(file) {
  const dateFilename = getDateFilename(file.name)
  const { secretId, secretKey, bucket, region, path, cdnHost } = JSON.parse(
    localStorage.getItem(`txCOSConfig`)
  )
  const cos = new COS({
    SecretId: secretId,
    SecretKey: secretKey,
  })
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: bucket,
        Region: region,
        Key: `${path}/${dateFilename}`,
        Body: file,
      },
      function (err, data) {
        if (err) {
          reject(err)
        } else if (cdnHost) {
          resolve(
            path == ``
              ? `${cdnHost}/${dateFilename}`
              : `${cdnHost}/${path}/${dateFilename}`
          )
        } else {
          resolve(`https://${data.Location}`)
        }
      }
    )
  })
}

//-----------------------------------------------------------------------
// Minio File Upload
//-----------------------------------------------------------------------

async function minioFileUpload(content, filename) {
  const dateFilename = getDateFilename(filename)
  const { endpoint, port, useSSL, bucket, accessKey, secretKey } = JSON.parse(
    localStorage.getItem(`minioConfig`)
  )
  const buffer = Buffer(content, `base64`)
  const conf = {
    endPoint: endpoint,
    useSSL: useSSL,
    accessKey: accessKey,
    secretKey: secretKey,
  }
  const p = Number(port || 0)
  const isCustomPort = p > 0 && p !== 80 && p !== 443
  if (isCustomPort) {
    conf.port = p
  }
  return new Promise((resolve, reject) => {
    const minioClient = new Minio.Client(conf)
    try {
      minioClient.putObject(bucket, dateFilename, buffer, function (e) {
        if (e) {
          reject(e)
        }
        const host = `${useSSL ? `https://` : `http://`}${endpoint}${
          isCustomPort ? `:` + port : ``
        }`
        const url = `${host}/${bucket}/${dateFilename}`
        // console.log("文件上传成功: ", url)
        resolve(url)
        // return `${endpoint}/${bucket}/${dateFilename}`;
      })
    } catch (e) {
      reject(e)
    }
  })
}

//-----------------------------------------------------------------------
// formCustom File Upload
//-----------------------------------------------------------------------

async function formCustomUpload(content, file) {
  const str = `
    async (CUSTOM_ARG) => {
      ${localStorage.getItem(`formCustomConfig`)}
    }
  `
  return new Promise((resolve, reject) => {
    const exportObj = {
      content, // 待上传图片的 base64
      file, // 待上传图片的 file 对象
      util: {
        axios: fetch, // axios 实例
        CryptoJS, // 加密库
        OSS, // ali-oss
        COS, // cos-js-sdk-v5
        Buffer, // buffer-from
        uuidv4, // uuid
        qiniu, // qiniu-js
        tokenTools, // 一些编码转换函数
        getDir, // 获取 年/月/日 形式的目录
        getDateFilename, // 根据文件名获取它以 时间戳+uuid 的形式
      },
      okCb: resolve, // 重要: 上传成功后给此回调传 url 即可
      errCb: reject, // 上传失败调用的函数
    }
    eval(str)(exportObj).catch((err) => {
      console.error(err)
      reject(err)
    })
  })
}

function fileUpload(content, file) {
  const imgHost = localStorage.getItem(`imgHost`)
  !imgHost && localStorage.setItem(`imgHost`, `default`)
  switch (imgHost) {
    case `aliOSS`:
      return aliOSSFileUpload(content, file.name)
    case `minio`:
      return minioFileUpload(content, file.name)
    case `txCOS`:
      return txCOSFileUpload(file)
    case `qiniu`:
      return qiniuUpload(file)
    case `gitee`:
      return giteeUpload(content, file.name)
    case `github`:
      return ghFileUpload(content, file.name)
    case `formCustom`:
      return formCustomUpload(content, file)
    default:
      // return file.size / 1024 < 1024
      //     ? giteeUpload(content, file.name)
      //     : ghFileUpload(content, file.name);
      return ghFileUpload(content, file.name)
  }
}

export default {
  fileUpload,
}
