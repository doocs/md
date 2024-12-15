<script setup lang="ts">
import { Label } from '@/components/ui/label'

const props = defineProps<{
  label?: string
  required?: boolean
}>()
</script>

<template>
  <div>
    <Label class="flex items-center">
      <span class="mr-4 w-[150px] text-right font-bold min-h-4 flex-shrink-0" :class="{ required: props.required }">
        {{ props.label }}
      </span>
      <slot />
    </Label>
  </div>
</template>

<style scoped lang='less'>
.required::before {
  content: '*';
  color: #f00;
  margin-right: 0.25em;
}
</style>
