<script setup lang="ts">
import type { IConfigOption } from '@md/shared/types'
import type { Component } from 'vue'

type StyleKey = `font` | `fontSize` | `color` | `lineHeight` | `blockSpacing` | `linkColor` | `blockquoteBackground`

const props = defineProps<{
  title: string
  styleKey?: StyleKey
  options: IConfigOption[]
  current: string
  change: (val: any) => void
  icon?: Component
}>()

// Keys whose desc reads as a plain hint beside the label. `font` renders its desc
// in the font itself, and `color` has no useful hint to show.
const DESC_AS_HINT_KEYS: StyleKey[] = [`fontSize`, `lineHeight`, `blockSpacing`, `linkColor`, `blockquoteBackground`]

const showDescHint = computed(() => !!props.styleKey && DESC_AS_HINT_KEYS.includes(props.styleKey))

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
            v-else-if="showDescHint && desc"
          >
            {{ desc }}
          </DropdownMenuShortcut>
        </MenubarRadioItem>
      </MenubarRadioGroup>
    </MenubarSubContent>
  </MenubarSub>
</template>
