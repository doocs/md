<script setup lang="ts">
const props = defineProps<{
  label?: string
  required?: boolean
  error?: string
}>()
</script>

<template>
  <div class="min-h-[64px]">
    <Label class="mb-[24px] flex items-center">
      <span class="mr-4 min-h-[40px] min-h-4 w-[150px] flex flex-shrink-0 items-center justify-end font-bold" :class="{ required: props.required }">
        {{ props.label }}
      </span>
      <div class="flex flex-1 flex-col justify-between">
        <div class="min-h-[40px] flex items-center">
          <slot />
        </div>
        <p v-if="error" class="min-h-[24px] flex items-center text-[12px] text-red-500">
          {{ error }}
        </p>
        <div v-if="error" class="mb-[-24px]" />
      </div>
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
