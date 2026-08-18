import type { GenericObject } from 'vee-validate'
import { store } from '@/storage'

export function useUploadProviderConfig<T extends GenericObject>(
  storageKey: string,
  defaults: T,
) {
  const { t } = useI18n()
  const config = store.reactive(storageKey, defaults)

  function saveConfig(values: GenericObject) {
    Object.assign(config.value, values)
    toast.success(t(`common.saveSuccess`))
  }

  return {
    config,
    saveConfig,
  }
}
