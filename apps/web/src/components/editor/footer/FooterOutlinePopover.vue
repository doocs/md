<script setup lang="ts">
import type { MarkdownHeading } from '@/lib/markdown/headings'
import { ChevronRight, ListTree } from '@lucide/vue'
import {
  Popover,
  PopoverContent,
  PopoverTrigger as PopoverTriggerPrimitive,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  findOutlineFocusIndex,
  moveOutlineFocusIndex,
} from '@/lib/markdown/headingNavigation'

const props = defineProps<{
  breadcrumbs: MarkdownHeading[]
  headings: MarkdownHeading[]
  activeHeadingLine: number
}>()

const emit = defineEmits<{
  jump: [line: number]
  dismiss: []
}>()

const { t } = useI18n()
const isOutlineOpen = ref(false)
const outlineScrollRef = ref<HTMLElement | null>(null)
const outlineFocusIndex = ref(-1)

function getOutlineLevelClass(level: number) {
  if (level === 1)
    return `font-semibold text-foreground`
  if (level === 2)
    return `font-medium text-foreground/90`
  return `text-muted-foreground`
}

function jumpToHeadingAndClose(line: number) {
  emit(`jump`, line)
  isOutlineOpen.value = false
}

function syncOutlineFocusIndex() {
  outlineFocusIndex.value = findOutlineFocusIndex(props.headings, props.activeHeadingLine)
}

function scrollOutlineFocusIntoView() {
  nextTick(() => {
    const container = outlineScrollRef.value
    if (!container || outlineFocusIndex.value < 0)
      return
    const el = container.querySelector(`[data-outline-index="${outlineFocusIndex.value}"]`)
    el?.scrollIntoView({ block: `nearest` })
  })
}

watch(isOutlineOpen, (open) => {
  if (open) {
    syncOutlineFocusIndex()
    nextTick(() => {
      outlineScrollRef.value?.focus()
      const el = outlineScrollRef.value?.querySelector(`[data-outline-index="${outlineFocusIndex.value}"]`)
        ?? outlineScrollRef.value?.querySelector(`[data-active="true"]`)
      el?.scrollIntoView({ block: `nearest` })
    })
  }
})

function handleOutlineKeydown(event: KeyboardEvent) {
  if (props.headings.length === 0)
    return

  const key = event.key
  if (key === `Escape`) {
    isOutlineOpen.value = false
    event.preventDefault()
    emit(`dismiss`)
    return
  }

  if (key === `Enter`) {
    const item = props.headings[outlineFocusIndex.value]
    if (item)
      jumpToHeadingAndClose(item.line)
    event.preventDefault()
    return
  }

  if (key === `ArrowUp` || key === `ArrowDown` || key === `Home` || key === `End`) {
    outlineFocusIndex.value = moveOutlineFocusIndex(
      props.headings,
      outlineFocusIndex.value,
      key,
    )
    scrollOutlineFocusIntoView()
    event.preventDefault()
  }
}
</script>

<template>
  <Popover v-model:open="isOutlineOpen">
    <PopoverTriggerPrimitive as-child>
      <Tooltip>
        <TooltipTrigger as-child>
          <button
            type="button"
            class="ml-1 flex min-w-0 cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:bg-accent hover:text-foreground sm:mx-3 sm:px-1.5"
            :aria-label="t('footer.outline')"
            @click="isOutlineOpen = !isOutlineOpen"
          >
            <ListTree class="size-3.5 shrink-0 opacity-60 sm:size-3" />
            <div v-if="breadcrumbs.length" class="hidden min-w-0 items-center gap-0.5 truncate sm:flex">
              <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.line">
                <ChevronRight v-if="idx > 0" class="size-3 shrink-0 opacity-30" />
                <span class="max-w-24 truncate">{{ crumb.title }}</span>
              </template>
            </div>
            <span v-else class="hidden opacity-50 sm:inline">{{ t('footer.outline') }}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent v-if="!isOutlineOpen" side="top" :side-offset="6" class="text-xs text-muted-foreground">
          <p>{{ t('footer.outlineTooltip') }}</p>
        </TooltipContent>
      </Tooltip>
    </PopoverTriggerPrimitive>
    <PopoverContent
      side="top"
      :side-offset="8"
      align="center"
      class="w-72 p-0"
    >
      <div class="flex items-center justify-between border-b px-3 py-2">
        <span class="text-xs font-medium tracking-wide text-muted-foreground">{{ t('footer.outline') }}</span>
        <span class="text-[10px] tabular-nums text-muted-foreground/50">{{ t('footer.headingCount', { count: headings.length }) }}</span>
      </div>
      <div
        ref="outlineScrollRef"
        tabindex="-1"
        class="max-h-72 overflow-y-auto overflow-x-hidden py-1 outline-none"
        @keydown.stop="handleOutlineKeydown"
      >
        <template v-if="headings.length > 0">
          <button
            v-for="(item, index) in headings"
            :key="item.line"
            :data-outline-index="index"
            :data-active="activeHeadingLine === item.line"
            class="group flex w-full items-start px-2 py-1 text-left text-[13px] transition-colors hover:bg-accent"
            :class="[
              activeHeadingLine === item.line ? 'bg-accent/60' : '',
              outlineFocusIndex === index ? 'bg-accent/40 ring-1 ring-primary/30' : '',
            ]"
            :style="{ paddingLeft: `${8 + (item.level - 1) * 16}px` }"
            @click="jumpToHeadingAndClose(item.line)"
          >
            <span
              class="mr-2 mt-[7px] inline-block size-1 shrink-0 rounded-full bg-current transition-opacity"
              :class="activeHeadingLine === item.line ? 'opacity-80' : item.level <= 2 ? 'opacity-40' : 'opacity-20'"
            />
            <span
              class="line-clamp-1 leading-relaxed"
              :class="getOutlineLevelClass(item.level)"
            >
              {{ item.title }}
            </span>
          </button>
        </template>
        <div v-else class="px-3 py-8 text-center text-xs text-muted-foreground">
          {{ t('footer.noHeadings') }}
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
