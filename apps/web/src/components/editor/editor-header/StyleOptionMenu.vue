<script setup lang="ts">
import type { IConfigOption } from '@md/shared/types'
import type { Component } from 'vue'

const props = defineProps<{
  title: string
  options: IConfigOption[]
  current: string
  change: (val: any) => void
  icon?: Component
}>()

function setStyle(title: string, value: string) {
  switch (title) {
    case `字体`:
      return { fontFamily: value }
    case `字号`:
      return { fontSize: value }
    case `主题色`:
    case `文字颜色`:
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
    <MenubarSubContent class="max-h-56 overflow-auto">
      <MenubarRadioGroup :model-value="current" @update:model-value="change">
        <MenubarRadioItem
          v-for="{ label, value, desc } in options"
          :key="value"
          :value="value"
          class="w-50"
        >
          {{ label }}
          <DropdownMenuShortcut :style="setStyle(title, value)">
            {{ desc }}
          </DropdownMenuShortcut>
        </MenubarRadioItem>
      </MenubarRadioGroup>
    </MenubarSubContent>
  </MenubarSub>
</template>
