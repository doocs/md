<script setup lang="ts">
import {
  MenubarItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from '@/components/ui/menubar'
import type { IConfigOption } from '@/types'

const props = defineProps<{
  title: string
  options: IConfigOption[]
  current: string
  change: <T>(val: T) => void
}>()

function setStyle(title: string, value: string) {
  switch (title) {
    case `字体`:
      return { fontFamily: value }
    case `字号`:
      return { fontSize: value }
    case `主题色`:
      return { color: value }
    default:
      return {}
  }
}
</script>

<template>
  <MenubarSub>
    <MenubarSubTrigger>
      <el-icon class="mr-2 h-4 w-4" />
      <span>{{ props.title }}</span>
    </MenubarSubTrigger>
    <MenubarSubContent class="max-h-56 overflow-auto">
      <MenubarItem
        v-for="{ label, value, desc } in options"
        :key="value"
        :label="label"
        :model-value="value"
        class="w-50"
        @click="change(value)"
      >
        <el-icon class="mr-2 h-4 w-4" :style="{ opacity: +(current === value) }">
          <ElIconCheck />
        </el-icon>
        {{ label }}
        <DropdownMenuShortcut :style="setStyle(title, value)">
          {{ desc }}
        </DropdownMenuShortcut>
      </MenubarItem>
    </MenubarSubContent>
  </MenubarSub>
</template>
