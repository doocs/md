import type { IConfigOption } from '@md/shared/types'
import type { UploadProviderId } from '@/services/upload/provider-registry'
import { UPLOAD_PROVIDERS } from '@/services/upload/provider-registry'

type Translate = (key: string) => string

export const UPLOAD_HOST_VALUES = UPLOAD_PROVIDERS.map(provider => provider.id)

export type UploadHostValue = UploadProviderId

export function getUploadHostLabel(t: Translate, value: string): string {
  const key = `upload.hosts.${value}`
  const translated = t(key)
  return translated !== key ? translated : value
}

export function createLocalizedUploadHostOptions(t: Translate): IConfigOption<UploadHostValue>[] {
  return UPLOAD_HOST_VALUES.map(value => ({
    value,
    label: getUploadHostLabel(t, value),
    desc: ``,
  }))
}

export function useLocalizedUploadHostOptions() {
  const { t, locale } = useI18n()

  return computed(() => {
    void locale.value
    return createLocalizedUploadHostOptions(t)
  })
}
