/* eslint-disable ts/no-use-before-define */

import { v4 as uuidv4 } from 'uuid'

export interface ExtensionExternalRequest<T> {
  type: `request`
  traceId: string
  action: string
  data: T
}

export interface ExtensionExternalResponse<T> {
  type: `response`
  traceId: string
  action: string
  code: number
  message: string
  data: T
}

export async function sendRequest<T>(action: string, data?: T, timeout: number = 5000): Promise<T> {
  const traceId = uuidv4()

  return new Promise<T>((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | undefined

    // Create message handler
    const messageHandler = (event: MessageEvent) => {
      if (event.data.type === `response` && event.data.action === action && event.data.traceId === traceId) {
        cleanup()
        resolve(event.data.data)
      }
    }

    // Cleanup function
    const cleanup = () => {
      window.removeEventListener(`message`, messageHandler)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }

    // Create timeout handler
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        cleanup()
        reject(new Error(`Request timeout after ${timeout}ms`))
      }, timeout)
    }

    // Add event listener
    window.addEventListener(`message`, messageHandler)

    // Send the message
    window.postMessage(
      {
        type: `request`,
        traceId,
        action,
        data,
      },
      `*`,
    )
  })
}

export async function checkServiceStatus(timeout: number = 5000): Promise<boolean> {
  try {
    // Send request and wait for actual response
    await sendRequest<void>(`MUTLIPOST_EXTENSION_CHECK_SERVICE_STATUS`, undefined, timeout)
    return true
  }
  catch (error) {
    console.error(`Service check failed:`, error)
    return false
  }
}

export async function openOptions(timeout: number = 5000): Promise<boolean> {
  try {
    await sendRequest<void>(`MUTLIPOST_EXTENSION_OPEN_OPTIONS`, undefined, timeout)
    return true
  }
  catch (error) {
    console.error(`Failed to open extension options:`, error)
    return false
  }
}

export interface SyncData {
  platforms: string[]
  auto_publish: boolean
  data: DynamicData | ArticleData | VideoData
}

export interface DynamicData {
  title: string
  content: string
  images: FileData[]
  videos: FileData[]
}

export interface FileData {
  name: string
  url: string
  type: string
  size: number
  base64?: string
  originUrl?: string
}

export interface ArticleData {
  title: string
  content: string
  digest: string
  cover: FileData
  images: FileData[]
  videos: FileData[]
  fileDatas: FileData[]
  originContent?: string
  markdownContent?: string
  markdownOriginContent?: string
}

export interface VideoData {
  title: string
  content: string
  video: FileData
}

export interface PlatformInfo {
  type: `DYNAMIC` | `VIDEO` | `ARTICLE`
  name: string
  homeUrl: string
  faviconUrl?: string
  iconifyIcon?: string
  platformName: string
  username?: string
  userAvatarUrl?: string
  injectUrl: string
  injectFunction: (data: SyncData) => Promise<void>
}

export async function funcPublish(data: SyncData) {
  sendRequest(`MUTLIPOST_EXTENSION_PUBLISH`, data)
}

export async function funcGetPlatformInfos(): Promise<PlatformInfo[]> {
  return sendRequest(`MUTLIPOST_EXTENSION_PLATFORMS`)
}

interface PermissionResponse {
  status: string
  trusted: boolean
}

export async function funcGetPermission(timeout: number = 30000) {
  return sendRequest<PermissionResponse>(`MUTLIPOST_EXTENSION_REQUEST_TRUST_DOMAIN`, undefined, timeout)
}

interface PlatformResponse {
  platforms: PlatformInfo[]
}

export async function getPlatformInfos(type: string) {
  const response = await funcGetPlatformInfos()
  if (!response)
    return []
  const platforms = Array.isArray(response) ? response : ((response as PlatformResponse)?.platforms ?? [])
  return platforms.filter((platform: PlatformInfo) => platform.type === type)
}
