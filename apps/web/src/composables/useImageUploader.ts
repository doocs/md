import { toBase64 } from '@md/shared/utils/fileHelpers'
import { ref } from 'vue'
import { t } from '@/i18n/translate'
import { fileUpload } from '@/services/upload'
import { store } from '@/storage'

const STORAGE_KEY = `uploaded_image_map`

export function useImageUploader() {
  const isUploading = ref(false)
  const error = ref<string | null>(null)

  // 获取本地缓存
  const getStorageMap = async (): Promise<Record<string, string>> => {
    return (await store.getJSON<Record<string, string>>(STORAGE_KEY, {})) ?? {}
  }

  const updateStorageMap = async (hash: string, url: string) => {
    const map = await getStorageMap()
    map[hash] = url
    await store.setJSON(STORAGE_KEY, map)
  }

  // 计算 Blob/File 的 SHA-256（Web Crypto，替代 spark-md5）
  const calculateHash = async (file: Blob): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const digest = await crypto.subtle.digest(`SHA-256`, buffer)
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, `0`)).join(``)
  }

  // URL 转 File (需注意 CORS)
  const urlToFile = async (url: string): Promise<File> => {
    const getFilename = (u: string) => u.split('/').pop()?.split('?')[0] || `image-${Date.now()}.png`
    const filename = getFilename(url)

    // 将 http:// 升级为 https://，避免 Mixed Content 被浏览器拦截
    const safeUrl = url.replace(/^http:\/\//i, 'https://')

    const fetchBlob = async (targetUrl: string, options?: RequestInit) => {
      const res = await fetch(targetUrl, options)
      if (!res.ok)
        throw new Error(`Status: ${res.status}`)
      return await res.blob()
    }

    try {
      const blob = await fetchBlob(safeUrl, { referrerPolicy: 'no-referrer' })
      return new File([blob], filename, { type: blob.type })
    }
    catch (directErr) {
      console.warn(`Direct fetch failed for ${safeUrl}, trying proxy...`, directErr)

      try {
        const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(safeUrl)}`
        const blob = await fetchBlob(proxyUrl)
        return new File([blob], filename, { type: blob.type })
      }
      catch (proxyErr: any) {
        console.error(`Proxy fetch failed for ${safeUrl}`, proxyErr)
        const isCors = proxyErr.message.includes('Failed to fetch') || proxyErr.name === 'TypeError'
        const msg = isCors
          ? t('store.uploader.corsFailed')
          : t('store.uploader.downloadFailed', { message: proxyErr.message })
        throw new Error(msg)
      }
    }
  }

  // 核心上传方法
  const upload = async (resource: string | File): Promise<string> => {
    isUploading.value = true
    error.value = null

    try {
      let file: File
      if (typeof resource === 'string') {
        file = await urlToFile(resource)
      }
      else {
        file = resource
      }

      const hash = await calculateHash(file)

      const cache = await getStorageMap()
      if (cache[hash])
        return cache[hash]

      const base64Content = await toBase64(file)

      const url = await fileUpload(base64Content, file)

      if (url)
        await updateStorageMap(hash, url)

      return url
    }
    catch (err: any) {
      console.error(err)
      const msg = err.message || t('store.uploader.uploadFailed')
      error.value = msg
      throw new Error(msg)
    }
    finally {
      isUploading.value = false
    }
  }

  return { upload, isUploading, error }
}
