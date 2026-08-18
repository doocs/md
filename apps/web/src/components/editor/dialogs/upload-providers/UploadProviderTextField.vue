<script setup lang="ts">
import { Field } from 'vee-validate'

withDefaults(defineProps<{
  name: string
  label: string
  placeholder?: string
  type?: `text` | `password` | `number`
  required?: boolean
  inputClass?: string
}>(), {
  type: `text`,
})
</script>

<template>
  <Field v-slot="{ field, errorMessage }" :name="name">
    <FormItem :label="label" :required="required" :error="errorMessage">
      <Input
        v-bind="field"
        v-model="field.value"
        :class="inputClass"
        :type="type"
        :placeholder="placeholder"
        :aria-invalid="Boolean(errorMessage)"
      />
    </FormItem>
  </Field>
</template>
