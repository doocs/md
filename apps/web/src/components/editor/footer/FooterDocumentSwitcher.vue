<script setup lang="ts">
import { ChevronsUpDown, FileText, Search } from '@lucide/vue'
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
  buildPostTree,
  filterFlatPosts,
  flattenPostTree,
} from '@/composables/usePostTree'
import { formatRelativeTime } from '@/lib/format/relative-time'
import { useLocaleStore } from '@/stores/locale'
import { usePostStore } from '@/stores/post'

const props = defineProps<{
  currentTitle?: string
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const { t, locale: i18nLocale } = useI18n()
const postStore = usePostStore()
const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)

const isSwitcherOpen = ref(false)
const switcherQuery = ref(``)
const switcherInputRef = ref<HTMLInputElement | null>(null)

const flatPosts = computed(() => flattenPostTree(buildPostTree(postStore.posts)))
const filteredPosts = computed(() => filterFlatPosts(flatPosts.value, switcherQuery.value))

function relativeTime(datetime: string | Date) {
  void locale.value
  void i18nLocale.value
  return formatRelativeTime(datetime)
}

function openSwitcher() {
  isSwitcherOpen.value = true
  switcherQuery.value = ``
  nextTick(() => switcherInputRef.value?.focus())
}

function switchToPost(id: string) {
  emit(`select`, id)
  isSwitcherOpen.value = false
}
</script>

<template>
  <Popover v-model:open="isSwitcherOpen">
    <PopoverTriggerPrimitive as-child>
      <Tooltip>
        <TooltipTrigger as-child>
          <button
            class="ml-1.5 flex max-w-24 shrink-0 cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-accent hover:text-foreground sm:ml-2 sm:max-w-36"
            @click="openSwitcher"
          >
            <FileText class="size-3 shrink-0 opacity-60" />
            <span class="truncate">{{ props.currentTitle || t('common.unnamed') }}</span>
            <ChevronsUpDown class="size-3 shrink-0 opacity-40" />
          </button>
        </TooltipTrigger>
        <TooltipContent v-if="!isSwitcherOpen" side="top" :side-offset="6" class="text-xs text-muted-foreground">
          <p>{{ t('footer.switchDocument') }}</p>
        </TooltipContent>
      </Tooltip>
    </PopoverTriggerPrimitive>
    <PopoverContent side="top" :side-offset="8" align="start" class="w-64 p-0">
      <div class="flex items-center gap-2 border-b px-3 py-2">
        <Search class="size-3.5 shrink-0 opacity-50" />
        <input
          ref="switcherInputRef"
          v-model="switcherQuery"
          type="text"
          class="h-5 w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          :placeholder="t('footer.searchDocuments')"
          @keydown.escape="isSwitcherOpen = false"
        >
      </div>
      <div class="max-h-52 overflow-y-auto py-1">
        <div v-if="filteredPosts.length === 0" class="px-3 py-4 text-center text-xs text-muted-foreground">
          {{ t('footer.noMatchingDocuments') }}
        </div>
        <button
          v-for="post in filteredPosts"
          :key="post.id"
          class="flex w-full cursor-pointer items-center gap-2 py-1.5 pr-3 text-left text-xs transition-colors hover:bg-accent"
          :class="post.id === postStore.currentPostId ? 'bg-accent/50 text-foreground' : 'text-muted-foreground'"
          :style="{ paddingLeft: `${12 + post.depth * 16}px` }"
          @click="switchToPost(post.id)"
        >
          <FileText class="size-3 shrink-0 opacity-50" />
          <span class="min-w-0 flex-1 truncate">{{ post.title }}</span>
          <span class="shrink-0 text-[10px] opacity-50">{{ relativeTime(post.updateDatetime) }}</span>
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>
