<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import UploadProviderForm from './UploadProviderForm.vue'
import UploadProviderTextField from './UploadProviderTextField.vue'
import { useUploadProviderConfig } from './useUploadProviderConfig'

const { t } = useI18n()
const isWebsite = window.location.protocol.startsWith(`http`)
const isCfWorkers = import.meta.env.CF_WORKERS === `1`
const isProxyRequired = computed(() => isWebsite && !isCfWorkers)
const schema = computed(() => toTypedSchema(yup.object({
  proxyOrigin: isProxyRequired.value
    ? yup.string().required(t(`upload.validation.proxyRequired`))
    : yup.string().optional(),
  appID: yup.string().required(t(`upload.validation.appIdRequired`)),
  appsecret: yup.string().required(t(`upload.validation.appSecretRequired`)),
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
