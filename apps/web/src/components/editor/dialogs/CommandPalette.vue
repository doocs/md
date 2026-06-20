<script setup lang="ts">
import type { PaletteCommand } from '@/composables/useCommandPalette'
import { Search } from '@lucide/vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCommandPalette } from '@/composables/useCommandPalette'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const { isShowCommandPalette } = storeToRefs(uiStore)
const { buildCommands } = useCommandPalette()

const query = ref(``)
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

const allCommands = computed(() => buildCommands())

const filteredCommands = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q)
    return allCommands.value

  return allCommands.value.filter((cmd) => {
    if (cmd.label.toLowerCase().includes(q))
      return true
    if (cmd.group.toLowerCase().includes(q))
      return true
    return cmd.keywords.some(k => k.toLowerCase().includes(q))
  })
})

const groupedCommands = computed(() => {
  const groups = new Map<string, PaletteCommand[]>()
  for (const cmd of filteredCommands.value) {
    const list = groups.get(cmd.group) ?? []
    list.push(cmd)
    groups.set(cmd.group, list)
  }
  return [...groups.entries()]
})

watch(isShowCommandPalette, (open) => {
  if (open) {
    query.value = ``
    activeIndex.value = 0
    nextTick(() => inputRef.value?.focus())
  }
})

watch(filteredCommands, () => {
  activeIndex.value = 0
})

function close() {
  uiStore.toggleShowCommandPalette(false)
}

async function runCommand(cmd: PaletteCommand) {
  close()
  await cmd.action()
}

function getFlatIndex(groupIdx: number, cmdIdx: number) {
  let index = 0
  for (let i = 0; i < groupIdx; i++)
    index += groupedCommands.value[i][1].length
  return index + cmdIdx
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === `Escape`) {
    event.stopPropagation()
    close()
    return
  }

  const count = filteredCommands.value.length

  if (event.key === `ArrowDown`) {
    event.preventDefault()
    if (count > 0)
      activeIndex.value = (activeIndex.value + 1) % count
  }
  else if (event.key === `ArrowUp`) {
    event.preventDefault()
    if (count > 0)
      activeIndex.value = (activeIndex.value - 1 + count) % count
  }
  else if (event.key === `Enter`) {
    event.preventDefault()
    const cmd = filteredCommands.value[activeIndex.value]
    if (cmd)
      void runCommand(cmd)
  }
}

function isActive(groupIdx: number, cmdIdx: number) {
  return activeIndex.value === getFlatIndex(groupIdx, cmdIdx)
}
</script>

<template>
  <Dialog :open="isShowCommandPalette" @update:open="(v) => !v && close()">
    <DialogContent
      class="top-[18%] max-h-[min(70vh,32rem)] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
    >
      <DialogHeader class="sr-only">
        <DialogTitle>命令面板</DialogTitle>
        <DialogDescription>搜索并执行编辑器命令</DialogDescription>
      </DialogHeader>

      <div class="flex items-center gap-2 border-b px-3 py-2.5">
        <Search class="size-4 shrink-0 text-muted-foreground" />
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          class="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="搜索命令…"
          @keydown="onKeydown"
        >
      </div>

      <div class="max-h-[min(52vh,24rem)] overflow-y-auto p-1">
        <template v-if="groupedCommands.length">
          <template v-for="([group, items], groupIdx) in groupedCommands" :key="group">
            <p class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {{ group }}
            </p>
            <button
              v-for="(cmd, cmdIdx) in items"
              :key="cmd.id"
              type="button"
              class="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors"
              :class="isActive(groupIdx, cmdIdx) ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60'"
              @mouseenter="activeIndex = getFlatIndex(groupIdx, cmdIdx)"
              @click="runCommand(cmd)"
            >
              <span>{{ cmd.label }}</span>
              <span v-if="cmd.shortcut?.length" class="flex items-center gap-0.5 text-xs text-muted-foreground">
                <kbd
                  v-for="key in cmd.shortcut"
                  :key="key"
                  class="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]"
                >
                  {{ key }}
                </kbd>
              </span>
            </button>
          </template>
        </template>
        <p v-else class="px-3 py-8 text-center text-sm text-muted-foreground">
          无匹配命令
        </p>
      </div>
    </DialogContent>
  </Dialog>
</template>
