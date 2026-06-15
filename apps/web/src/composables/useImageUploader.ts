import SparkMD5 from 'spark-md5'
import { ref } from 'vue'
import { fileUpload } from '@/utils/file-upload'
import { parseStoredValue, safeGetItem, safeSetItem } from '@/utils/localStorageSafe'
import { toBase64 } from '@/utils/shared-helpers'

const STORAGE_KEY = `uploaded_image_map`

export function useImageUploader() {
  const isUploading = ref(false)
  const error = ref<string | null>(null)

  // 获取本地缓存
  const getStorageMap = (): Record<string, string> => {
    const str = safeGetItem(STORAGE_KEY)
    return str ? parseStoredValue(str, {} as Record<string, string>) : {}
  }

  // 更新本地缓存
  const updateStorageMap = (hash: string, url: string) => {
    const map = getStorageMap()
    map[hash] = url
    safeSetItem(STORAGE_KEY, JSON.stringify(map))
  }

  // 计算 Blob/File 的 MD5
  const calculateHash = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      const spark = new SparkMD5.ArrayBuffer()

      fileReader.onload = (e) => {
        if (e.target?.result) {
          spark.append(e.target.result as ArrayBuffer)
          resolve(spark.end())
        }
        else {
          reject(new Error('文件读取失败'))
        }
      }
      fileReader.onerror = () => reject(new Error('文件读取错误'))
      fileReader.readAsArrayBuffer(file)
    })
  }

  // URL 转 File (需注意 CORS)
  const urlToFile = async (url: string): Promise<File> => {
    const getFilename = (u: string) => u.split('/').pop()?.split('?')[0] || `image-${Date.now()}.png`
    const filename = getFilename(url)

    const fetchBlob = async (targetUrl: string, options?: RequestInit) => {
      const res = await fetch(targetUrl, options)
      if (!res.ok)
        throw new Error(`Status: ${res.status}`)
      return await res.blob()
    }

    try {
      const blob = await fetchBlob(url, { referrerPolicy: 'no-referrer' })
      return new File([blob], filename, { type: blob.type })
    }
    catch (directErr) {
      console.warn(`Direct fetch failed for ${url}, trying proxy...`, directErr)

      try {
        const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}`
        const blob = await fetchBlob(proxyUrl)
        return new File([blob], filename, { type: blob.type })
      }
      catch (proxyErr: any) {
        console.error(`Proxy fetch failed for ${url}`, proxyErr)
        const isCors = proxyErr.message.includes('Failed to fetch') || proxyErr.name === 'TypeError'
        const msg = isCors
          ? '跨域请求失败：目标图片禁止了跨域访问，且代理服务也无法获取。'
          : `图片下载失败: ${proxyErr.message}`
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

      const cache = getStorageMap()
      if (cache[hash]) {
        return cache[hash]
      }

      const base64Content = await toBase64(file)

      const url = await fileUpload(base64Content, file)

      if (url) {
        updateStorageMap(hash, url)
      }

      return url
    }
    catch (err: any) {
      console.error(err)
      const msg = err.message || '上传失败'
      error.value = msg
      throw new Error(msg)
    }
    finally {
      isUploading.value = false
    }
  }

  return { upload, isUploading, error }
}
