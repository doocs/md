import type { Env } from './types'
import { buildDatedObjectKey } from './upload-filename'

function getDir(): string {
  const date = new Date()
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, `0`)
  const day = String(date.getUTCDate()).padStart(2, `0`)
  return `${year}/${month}/${day}`
}

export async function uploadToR2(env: Env, file: File): Promise<string> {
  const bucket = env.UPLOAD_IMAGES
  const publicUrl = env.UPLOAD_R2_PUBLIC_URL?.trim().replace(/\/$/, ``)
  if (!bucket || !publicUrl)
    throw new Error(`R2 upload is not configured`)

  const key = `${getDir()}/${buildDatedObjectKey(file.name, file.type)}`
  await bucket.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || `application/octet-stream` },
  })

  return `${publicUrl}/${key}`
}
