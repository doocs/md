<script setup lang="ts">
import type { GenericObject, TypedSchema } from 'vee-validate'
import { Form } from 'vee-validate'

defineProps<{
  validationSchema: TypedSchema
  initialValues: GenericObject
}>()

const emit = defineEmits<{
  submit: [values: GenericObject]
}>()

const { t } = useI18n()
</script>

<template>
  <Form
    :validation-schema="validationSchema"
    :initial-values="initialValues"
    class="flex flex-col flex-1 overflow-hidden"
    @submit="values => emit('submit', values)"
  >
    <div class="flex-1 overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <slot />
    </div>

    <DialogFooter class="p-1">
      <Button type="submit">
        {{ t('upload.saveConfig') }}
      </Button>
    </DialogFooter>
  </Form>
</template>
