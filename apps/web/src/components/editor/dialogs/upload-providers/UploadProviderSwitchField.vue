<script setup lang="ts">
import { Field } from 'vee-validate'

defineProps<{
  name: string
  label: string
}>()
</script>

<template>
  <Field v-slot="{ field, errorMessage }" :name="name" type="boolean">
    <FormItem :label="label" :error="errorMessage">
      <Switch
        :model-value="field.value"
        :name="field.name"
        :aria-invalid="Boolean(errorMessage)"
        @update:model-value="field.onChange"
        @blur="field.onBlur"
      />
    </FormItem>
  </Field>
</template>
