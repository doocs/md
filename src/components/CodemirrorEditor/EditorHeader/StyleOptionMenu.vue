<script setup>
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  current: {
    type: String,
    required: true,
  },
  change: {
    type: Function,
    required: true,
  },
})

function setStyle(title, value) {
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
  <DropdownMenuSub>
    <DropdownMenuSubTrigger>
      <el-icon class="mr-2 h-4 w-4" />
      <span>{{ props.title }}</span>
    </DropdownMenuSubTrigger>
    <DropdownMenuPortal>
      <DropdownMenuSubContent>
        <DropdownMenuItem
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
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuPortal>
  </DropdownMenuSub>
</template>
