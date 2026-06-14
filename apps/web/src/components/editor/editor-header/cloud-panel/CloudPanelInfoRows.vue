<script setup lang="ts">
defineProps<{
  rows: Array<{ label: string, value: string, numeric?: boolean }>
}>()
</script>

<template>
  <div class="grid gap-2 rounded-xl border px-3.5 py-3 text-xs sm:px-4">
    <div
      v-for="row in rows"
      :key="row.label"
      class="flex items-center justify-between gap-3"
    >
      <span class="text-muted-foreground">{{ row.label }}</span>
      <span
        class="text-right font-medium"
        :class="row.numeric ? 'tabular-nums' : ''"
      >{{ row.value }}</span>
    </div>
  </div>
</template>
