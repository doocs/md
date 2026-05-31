import type { S3ClientConfig } from '@aws-sdk/client-s3'
import type { S3SyncConfig, SyncProvider } from '../types'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * S3-compatible sync provider.
 *
 * Works with AWS S3, Alibaba Cloud OSS, Tencent COS, MinIO, Cloudflare R2,
 * Backblaze B2, and any other S3-API-compatible object storage.
 *
 * Reads use pre-signed GET URLs so that the AWS SDK's browser stream
 * handling quirks are avoided – a plain fetch() is used instead.
 *
 * NOTE: The bucket's CORS policy must allow GET and PUT from the app's
 * origin (the same requirement as for image uploads via file.ts).
 */
export class S3SyncProvider implements SyncProvider {
  readonly id = `s3`
  readonly name = `S3 兼容存储`

  private readonly client: S3Client
  private readonly bucket: string
  private readonly basePath: string

  constructor(config: S3SyncConfig) {
    this.bucket = config.bucket
    this.basePath = config.path ? config.path.replace(/\/$/, ``) : ``

    const clientConfig: S3ClientConfig = {
      region: config.region || `auto`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.accessKeySecret,
      },
      forcePathStyle: config.pathStyle ?? false,
    }
    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint.startsWith(`http`)
        ? config.endpoint
        : `https://${config.endpoint}`
    }
    this.client = new S3Client(clientConfig)
  }

  // ──────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────

  private buildKey(path: string): string {
    const base = this.basePath ? `${this.basePath}/` : ``
    return `${base}${path}`
  }

  private stripBase(key: string): string {
    const base = this.basePath ? `${this.basePath}/` : ``
    return base && key.startsWith(base) ? key.slice(base.length) : key
  }

  // ──────────────────────────────────────────────────
  // SyncProvider implementation
  // ──────────────────────────────────────────────────

  async test(): Promise<void> {
    const key = this.buildKey(`.sync-probe`)
    try {
      await this.client.send(
        new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: `ok`, ContentType: `text/plain` }),
      )
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
    }
    catch (e: any) {
      throw new Error(`S3 连接失败: ${e?.message ?? e}`)
    }
  }

  async read(path: string): Promise<string | null> {
    const key = this.buildKey(path)
    try {
      const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key })
      const presignedUrl = await getSignedUrl(this.client, cmd, { expiresIn: 300 })
      const res = await fetch(presignedUrl)
      // 403 is returned by some providers (e.g. R2) when the key does not exist
      if (res.status === 404 || res.status === 403)
        return null
      if (!res.ok)
        throw new Error(`${res.status} ${res.statusText}`)
      return res.text()
    }
    catch (e: any) {
      if (e?.Code === `NoSuchKey` || e?.name === `NoSuchKey`)
        return null
      throw new Error(`S3 读取失败 (${path}): ${e?.message ?? e}`)
    }
  }

  async write(path: string, content: string, mimeType = `text/plain; charset=utf-8`): Promise<void> {
    const key = this.buildKey(path)
    try {
      await this.client.send(
        new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: content, ContentType: mimeType }),
      )
    }
    catch (e: any) {
      throw new Error(`S3 写入失败 (${path}): ${e?.message ?? e}`)
    }
  }

  async list(prefix = ``): Promise<string[]> {
    const keyPrefix = this.buildKey(prefix)
    try {
      const res = await this.client.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: keyPrefix }),
      )
      return (res.Contents ?? [])
        .map(obj => this.stripBase(obj.Key ?? ``))
        .filter(Boolean)
    }
    catch (e: any) {
      throw new Error(`S3 列举失败: ${e?.message ?? e}`)
    }
  }

  async delete(path: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: this.buildKey(path) }),
      )
    }
    catch (e: any) {
      // Silently ignore "key not found" errors
      if (e?.Code !== `NoSuchKey` && e?.name !== `NoSuchKey`) {
        throw new Error(`S3 删除失败 (${path}): ${e?.message ?? e}`)
      }
    }
  }
}
