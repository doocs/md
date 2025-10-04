import { getMpToken } from '@/utils/file'
import { isInExtension } from '../sidepanel'

const isCfPage = import.meta.env.CF_PAGES === `1`
const isDev = import.meta.env.DEV
export async function getMpAccessToken() {
  let { appID, appsecret, proxyOrigin } = JSON.parse(
    localStorage.getItem(`mpConfig`)!,
  )
  // 未填写代理域名且是cfpages环境
  if (!proxyOrigin && isCfPage) {
    proxyOrigin = window.location.origin
  }
  // 开发环境，走本地代理配置
  if (isDev) {
    proxyOrigin = ``
  }
  const access_token = await getMpToken(appID, appsecret, proxyOrigin)
  return access_token
}

interface MpCoverMediaId {
  url: string
  media_id: string
}
export async function getMpCoverMediaId(file: File): Promise<{ url: string, media_id: string, errmsg?: string }> {
  let { appID, appsecret, proxyOrigin } = JSON.parse(
    localStorage.getItem(`mpConfig`)!,
  )
  // 未填写代理域名且是cfpages环境
  if (!proxyOrigin && isCfPage) {
    proxyOrigin = window.location.origin
  }

  // 开发环境，走本地代理配置
  if (isDev) {
    proxyOrigin = ``
  }
  const access_token = await getMpToken(appID, appsecret, proxyOrigin)

  const formdata = new FormData()
  formdata.append(`media`, file, file.name)

  const requestOptions = {
    method: `POST`,
    body: formdata,
  }

  let url = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${access_token}&type=image`
  if (proxyOrigin !== null && proxyOrigin !== undefined && !isInExtension) {
    url = url.replace(`https://api.weixin.qq.com`, proxyOrigin)
  }

  const res = await (await fetch(url, requestOptions)).json() as MpCoverMediaId

  if (!res.url || !res.media_id) {
    throw new Error(`上传失败，未获取到URL`)
  }

  return res
}

interface MpArticleDraft {
  title: string
  author?: string
  digest?: string
  content_source_url?: string
  thumb_media_id: string
  content: string
  need_open_comment?: number
  only_fans_can_comment?: number
}

export async function addMpArticleDraft(params: MpArticleDraft) {
  let { appID, appsecret, proxyOrigin } = JSON.parse(
    localStorage.getItem(`mpConfig`)!,
  )
  // 未填写代理域名且是cfpages环境
  if (!proxyOrigin && isCfPage) {
    proxyOrigin = window.location.origin
  }

  // 开发环境，走本地代理配置
  if (isDev) {
    proxyOrigin = ``
  }
  const access_token = await getMpToken(appID, appsecret, proxyOrigin)

  let url = `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${access_token}`
  if (proxyOrigin !== null && proxyOrigin !== undefined && !isInExtension) {
    url = url.replace(`https://api.weixin.qq.com`, proxyOrigin)
  }

  const response = await fetch(url, {
    method: `POST`,
    headers: { 'Content-Type': `application/json` },
    body: JSON.stringify({
      articles: [
        {
          article_type: `news`,
          ...params,
        },
      ],
    }),
  })

  const result = await response.json()

  return result
}
