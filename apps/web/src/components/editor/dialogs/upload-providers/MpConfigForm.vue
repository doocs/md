<script setup lang="ts">
import { z } from 'zod'
import { optionalString, requiredString, toTypedSchema } from '@/lib/form-schema'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const isWebsite = window.location.protocol.startsWith(`http`)
const isCfWorkers = import.meta.env.CF_WORKERS === `1`
const isProxyRequired = computed(() => isWebsite && !isCfWorkers)
const schema = computed(() => toTypedSchema(z.object({
  proxyOrigin: isProxyRequired.value
    ? requiredString(t(`upload.validation.proxyRequired`))
    : optionalString(),
  appID: requiredString(t(`upload.validation.appIdRequired`)),
  appsecret: requiredString(t(`upload.validation.appSecretRequired`)),
})))
const { config, saveConfig } = useUploadProviderConfig(`mpConfig`, {
  proxyOrigin: ``,
  appID: ``,
  appsecret: ``,
})
</script>

<template>
  <UploadProviderForm :validation-schema="schema" :initial-values="config" @submit="saveConfig">
    <UploadProviderTextField
      v-if="isProxyRequired"
      name="proxyOrigin"
      :label="t('upload.labels.proxyDomain')"
      :placeholder="t('upload.placeholders.proxyExample')"
      required
    />
    <UploadProviderTextField name="appID" label="appID" :placeholder="t('upload.placeholders.appId')" required />
    <UploadProviderTextField name="appsecret" label="appsecret" :placeholder="t('upload.placeholders.appSecret')" required />

    <FormItem>
      <div class="flex flex-col items-start">
        <Button variant="link" class="p-0 h-auto text-left whitespace-normal" as="a" href="https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Getting_Started_Guide.html" target="_blank" rel="noopener noreferrer">
          {{ t('upload.help.mpDevMode') }}
        </Button>
        <Button variant="link" class="p-0 h-auto text-left whitespace-normal" as="a" href="https://md-pages.doocs.org/tutorial/" target="_blank" rel="noopener noreferrer">
          {{ t('upload.help.mpExtension') }}
        </Button>
      </div>
    </FormItem>
  </UploadProviderForm>
</template>
