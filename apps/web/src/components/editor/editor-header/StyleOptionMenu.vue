<script setup lang="ts">
import type { IConfigOption } from '@md/shared/types'
import type { Component } from 'vue'

const props = defineProps<{
  title: string
  styleKey?: `font` | `fontSize` | `color`
  options: IConfigOption[]
  current: string
  change: (val: any) => void
  icon?: Component
}>()

function setStyle(styleKey: typeof props.styleKey, value: string) {
  switch (styleKey) {
    case `font`:
      return { fontFamily: value }
    case `color`:
      return { color: value }
    default:
      return {}
  }
}
</script>

<template>
  <MenubarSub>
    <MenubarSubTrigger>
      <component :is="props.icon" v-if="props.icon" class="mr-2 h-4 w-4" />
      <span v-else class="mr-2 h-4 w-4" />
      <span>{{ props.title }}</span>
    </MenubarSubTrigger>
    <MenubarSubContent class="min-w-44 max-h-56 overflow-y-auto">
      <MenubarRadioGroup :model-value="current" @update:model-value="change">
        <MenubarRadioItem
          v-for="{ label, value, desc } in options"
          :key="value"
          :value="value"
          class="min-w-44"
        >
          {{ label }}
          <DropdownMenuShortcut
            v-if="styleKey === 'font' && desc"
            :style="setStyle(styleKey, value)"
          >
            {{ desc }}
          </DropdownMenuShortcut>
          <DropdownMenuShortcut
            v-else-if="styleKey === 'fontSize' && desc"
          >
            {{ desc }}
          </DropdownMenuShortcut>
        </MenubarRadioItem>
      </MenubarRadioGroup>
    </MenubarSubContent>
  </MenubarSub>
</template>
