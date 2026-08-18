import { store } from '@/storage'

export interface UploadProviderDefinition {
  id: string
  configKey: string | null
}

export const UPLOAD_PROVIDERS = [
  { id: `default`, configKey: null },
  { id: `github`, configKey: `githubConfig` },
  { id: `aliOSS`, configKey: `aliOSSConfig` },
  { id: `txCOS`, configKey: `txCOSConfig` },
  { id: `qiniu`, configKey: `qiniuConfig` },
  { id: `minio`, configKey: `minioConfig` },
  { id: `s3`, configKey: `s3Config` },
  { id: `mp`, configKey: `mpConfig` },
  { id: `r2`, configKey: `r2Config` },
  { id: `upyun`, configKey: `upyunConfig` },
  { id: `telegram`, configKey: `telegramConfig` },
  { id: `cloudinary`, configKey: `cloudinaryConfig` },
  { id: `formCustom`, configKey: `formCustomConfig` },
] as const satisfies readonly UploadProviderDefinition[]

export type UploadProviderId = typeof UPLOAD_PROVIDERS[number][`id`]
export type ConfigurableUploadProviderId = Exclude<UploadProviderId, `default`>

export function isUploadProviderId(value: unknown): value is UploadProviderId {
  return typeof value === `string` && UPLOAD_PROVIDERS.some(provider => provider.id === value)
}

export function isConfigurableUploadProvider(
  provider: typeof UPLOAD_PROVIDERS[number],
): provider is Exclude<typeof UPLOAD_PROVIDERS[number], { id: `default` }> {
  return provider.id !== `default`
}

export function resolveUploadProvider(value: unknown) {
  const id = isUploadProviderId(value) ? value : `default`
  return UPLOAD_PROVIDERS.find(provider => provider.id === id)!
}

export async function isUploadProviderConfigured(value: unknown): Promise<boolean> {
  const provider = resolveUploadProvider(value)
  if (provider.configKey == null)
    return true
  return Boolean(await store.get(provider.configKey))
}
