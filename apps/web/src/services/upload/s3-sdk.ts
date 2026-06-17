import type { S3ClientConfig } from '@aws-sdk/client-s3'

export type { S3ClientConfig }

let s3SdkPromise: Promise<{
  S3Client: typeof import('@aws-sdk/client-s3').S3Client
  PutObjectCommand: typeof import('@aws-sdk/client-s3').PutObjectCommand
  getSignedUrl: typeof import('@aws-sdk/s3-request-presigner').getSignedUrl
}> | null = null

export async function loadS3Sdk() {
  if (!s3SdkPromise) {
    s3SdkPromise = Promise.all([
      import('@aws-sdk/client-s3'),
      import('@aws-sdk/s3-request-presigner'),
    ]).then(([clientS3, presigner]) => ({
      S3Client: clientS3.S3Client,
      PutObjectCommand: clientS3.PutObjectCommand,
      getSignedUrl: presigner.getSignedUrl,
    }))
  }
  return s3SdkPromise
}
