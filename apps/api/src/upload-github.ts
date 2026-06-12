import type { UploadGithubConfig } from './upload-config'
import { buildDatedObjectKey } from './upload-filename'

function getDir(): string {
  const date = new Date()
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, `0`)
  const day = String(date.getUTCDate()).padStart(2, `0`)
  return `${year}/${month}/${day}`
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ``
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export async function uploadToGithub(
  config: UploadGithubConfig,
  file: File,
  referer: string,
): Promise<string> {
  const username = config.username
  const repo = pickRandom(config.repoList)
  const branch = config.branch
  const accessToken = pickRandom(config.tokens)
  const dir = getDir()
  const dateFilename = buildDatedObjectKey(file.name, file.type)
  const path = `${dir}/${dateFilename}`

  const content = arrayBufferToBase64(await file.arrayBuffer())
  const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}`

  const res = await fetch(url, {
    method: `PUT`,
    headers: {
      'Authorization': `token ${accessToken}`,
      'Content-Type': `application/json`,
      'Accept': `application/vnd.github+json`,
      'User-Agent': `md-api-upload`,
    },
    body: JSON.stringify({
      content,
      branch,
      message: `Upload by ${referer}`,
    }),
  })

  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json() as { message?: string }
      if (body.message)
        detail = body.message
    }
    catch { /* ignore */ }
    throw new Error(`GitHub upload failed: ${detail}`)
  }

  const data = await res.json() as { content?: { download_url?: string } }
  const downloadUrl = data.content?.download_url
  if (!downloadUrl)
    throw new Error(`GitHub upload failed: missing download_url`)

  if (!config.useCdn)
    return downloadUrl

  const githubResourceUrl = `raw.githubusercontent.com/${username}/${repo}/${branch}/`
  const cdnResourceUrl = `fastly.jsdelivr.net/gh/${username}/${repo}@${branch}/`
  return downloadUrl.replace(githubResourceUrl, cdnResourceUrl)
}
