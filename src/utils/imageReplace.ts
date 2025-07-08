import { fileUpload } from './file'

interface ImageInfo {
  url: string
  start: number
  end: number
  fullMatch: string
  alt: string
}

/**
 * Extract all image URLs from markdown content
 */
export function extractImageUrls(markdown: string): ImageInfo[] {
  const images: ImageInfo[] = []

  // Match markdown image syntax: ![alt](url "title")
  const mdImgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let mdMatch = mdImgRegex.exec(markdown)

  while (mdMatch !== null) {
    images.push({
      url: mdMatch[2].split(` `)[0], // Remove title if present
      start: mdMatch.index,
      end: mdMatch.index + mdMatch[0].length,
      fullMatch: mdMatch[0],
      alt: mdMatch[1],
    })
    mdMatch = mdImgRegex.exec(markdown)
  }

  // Also match HTML img tags: <img src="..." alt="..." />
  const htmlImgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let htmlMatch = htmlImgRegex.exec(markdown)

  while (htmlMatch !== null) {
    // Extract alt attribute if present
    const altMatch = htmlMatch[0].match(/alt=["']([^"']+)["']/)
    const alt = altMatch ? altMatch[1] : ``

    images.push({
      url: htmlMatch[1],
      start: htmlMatch.index,
      end: htmlMatch.index + htmlMatch[0].length,
      fullMatch: htmlMatch[0],
      alt,
    })
    htmlMatch = htmlImgRegex.exec(markdown)
  }

  // Sort by position to maintain order
  images.sort((a, b) => a.start - b.start)

  return images
}

/**
 * Get domain from URL
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  }
  catch {
    // Handle relative URLs or invalid URLs
    return ``
  }
}

/**
 * Download image from URL and convert to base64
 */
async function downloadImageAsBase64(url: string): Promise<{ base64: string, filename: string }> {
  try {
    // For local files or data URLs, handle them directly
    if (url.startsWith(`data:`)) {
      const filename = `image.png`
      // Extract pure base64 content from data URL
      const base64 = url.split(`,`)[1] || url
      return { base64, filename }
    }

    // Try to fetch the image
    const response = await fetch(url, {
      mode: `cors`,
      credentials: `omit`,
    }).catch(() => {
      // If CORS fails, try using a proxy or notify user
      throw new Error(`无法下载图片，可能是跨域限制: ${url}`)
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const blob = await response.blob()
    const filename = url.split(`/`).pop()?.split(`?`)[0] || `image.png`

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        // Extract pure base64 content without data URL prefix
        const base64 = dataUrl.split(`,`)[1] || dataUrl
        resolve({ base64, filename })
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
  catch (error) {
    throw new Error(`下载图片失败: ${error}`)
  }
}

/**
 * Get image statistics from markdown content
 */
export function getImageStats(markdown: string): { total: number, byDomain: Map<string, number> } {
  const images = extractImageUrls(markdown)
  const byDomain = new Map<string, number>()

  images.forEach((img) => {
    const domain = getDomain(img.url) || `本地图片`
    byDomain.set(domain, (byDomain.get(domain) || 0) + 1)
  })

  return {
    total: images.length,
    byDomain,
  }
}

/**
 * Replace image sources in markdown content
 */
export async function replaceImageSources(
  markdown: string,
  onProgress?: (current: number, total: number) => void,
): Promise<string> {
  const images = extractImageUrls(markdown)

  if (images.length === 0) {
    toast.info(`编辑器中没有找到图片`)
    return markdown
  }

  // Replace images
  let newMarkdown = markdown
  const replacements: Array<{ old: ImageInfo, newUrl: string }> = []

  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    onProgress?.(i + 1, images.length)

    try {
      // Download image
      const { base64, filename } = await downloadImageAsBase64(img.url)

      // Create a file object for upload
      // Determine mime type from filename
      const mimeType = filename.toLowerCase().endsWith(`.png`)
        ? `image/png`
        : filename.toLowerCase().endsWith(`.gif`)
          ? `image/gif`
          : `image/jpeg`

      const file = new File([base64ToBlob(base64, mimeType)], filename, {
        type: mimeType,
      })

      // Upload to new image host
      const newUrl = await fileUpload(base64, file)

      if (newUrl) {
        replacements.push({ old: img, newUrl })
      }
      else {
        throw new Error(`Upload failed`)
      }
    }
    catch (error) {
      toast.error(`图片上传失败: ${img.url}`)
      console.error(`Failed to replace image:`, error)
    }
  }

  // Apply replacements (from end to start to maintain positions)
  replacements.sort((a, b) => b.old.start - a.old.start)

  for (const { old, newUrl } of replacements) {
    let newImageContent: string

    // Check if it's an HTML img tag or markdown image
    if (old.fullMatch.startsWith(`<img`)) {
      // Replace src attribute in HTML img tag
      newImageContent = old.fullMatch.replace(/src=["'][^"']+["']/, `src="${newUrl}"`)
    }
    else {
      // Replace markdown image
      newImageContent = `![${old.alt}](${newUrl})`
    }

    newMarkdown
      = newMarkdown.slice(0, old.start)
        + newImageContent
        + newMarkdown.slice(old.end)
  }

  const successCount = replacements.length
  if (successCount > 0) {
    toast.success(`成功替换 ${successCount} 张图片`)
  }

  return newMarkdown
}

/**
 * Convert base64 to Blob
 */
function base64ToBlob(base64: string, mimeType: string = `image/png`): Blob {
  const byteString = atob(base64)
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  return new Blob([ab], { type: mimeType })
}
