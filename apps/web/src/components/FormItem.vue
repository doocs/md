<script setup lang="ts">
const props = defineProps<{
  label?: string
  required?: boolean
  error?: string
  width?: number
}>()
</script>

<template>
  <div class="min-h-[auto] md:min-h-[64px]">
    <Label class="mb-4 md:mb-[24px] flex flex-col md:flex-row md:items-center">
      <span class="mb-1 md:mb-0 md:mr-4 min-h-[auto] md:min-h-[40px] w-full md:w-[150px] flex shrink-0 items-center justify-start md:justify-end font-bold text-sm md:text-base" :class="{ required: props.required }">
        {{ props.label }}
      </span>
      <div class="flex flex-1 flex-col justify-between">
        <div class="min-h-[40px] flex items-center w-full">
          <slot />
        </div>
        <p v-if="error" class="mt-1 min-h-[20px] md:min-h-[24px] flex items-center text-[12px] text-red-500">
          {{ error }}
        </p>
        <div v-if="error" class="mb-[-12px] md:mb-[-24px]" />
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
