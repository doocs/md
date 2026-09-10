<script setup lang="ts">
import type { EmojiAlign } from '@md/core/extensions'
import type { EmojiFile, EmojiPack } from '@md/shared/types/emoji'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  ChevronDown,
  Image,
  LogIn,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Smile,
  Sticker,
  Trash2,
  Type,
  UserRound,
  X,
} from '@lucide/vue'
import { formatEmojiSnippet, GITHUB_EMOJI_LIST, padEmojiBlock } from '@md/core/extensions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { EMOJI_ACCEPT, EMOJI_MAX_BYTES, USER_EMOJI_LIMIT } from '@/services/emoji/client'
import { useAuthStore } from '@/stores/auth'
import { useConfirmStore } from '@/stores/confirm'
import { useEditorStore } from '@/stores/editor'
import { useEmojiPackStore } from '@/stores/emojiPack'
import { useUIStore } from '@/stores/ui'

type InsertMode = 'small' | 'original'
type TabId = 'unicode' | 'default' | 'user'

const INSERT_ALIGNS: EmojiAlign[] = [`left`, `center`, `right`]
const ALIGN_ICONS = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
} as const

const { t } = useI18n()
const authStore = useAuthStore()
const confirmStore = useConfirmStore()
const editorStore = useEditorStore()
const emojiStore = useEmojiPackStore()
const uiStore = useUIStore()

const isMobile = computed(() => uiStore.isMobile)
const isOpen = computed({
  get: () => uiStore.isOpenEmojiManager,
  set: (value) => { uiStore.isOpenEmojiManager = value },
})

const selectedTabId = ref<TabId>(`unicode`)
const search = ref(``)
const fileInput = ref<HTMLInputElement | null>(null)
const insertMode = ref<InsertMode>(`small`)
const insertAlign = ref<EmojiAlign>(`left`)
const widthPercentStr = ref(`20`)
const renaming = ref(false)
const renamePackName = ref(``)
const renameInputRef = ref<HTMLInputElement | null>(null)

const searchQuery = computed(() => search.value.trim().toLowerCase())
const isSearching = computed(() => Boolean(searchQuery.value))
const widthPercent = computed(() => {
  const value = Number.parseInt(widthPercentStr.value, 10)
  return Number.isFinite(value) ? Math.max(1, Math.min(100, value)) : 20
})
const selectedCloudPack = computed(() => {
  if (selectedTabId.value === `default`)
    return emojiStore.defaultPack
  if (selectedTabId.value === `user`)
    return emojiStore.userPack
  return null
})
const filteredBuiltIn = computed(() => {
  const query = searchQuery.value
  if (!query)
    return GITHUB_EMOJI_LIST
  return GITHUB_EMOJI_LIST.filter(item => item.name.includes(query) || item.char.includes(query))
})
const cloudGroups = computed(() => {
  const source = isSearching.value
    ? [emojiStore.defaultPack, emojiStore.userPack]
    : [selectedCloudPack.value]
  return source
    .filter((pack): pack is EmojiPack => Boolean(pack))
    .map(pack => ({
      pack,
      files: searchQuery.value
        ? pack.files.filter(file => file.name.toLowerCase().includes(searchQuery.value))
        : pack.files,
    }))
    .filter(group => group.files.length > 0 || !isSearching.value)
})
const hasSearchHits = computed(() =>
  filteredBuiltIn.value.length > 0 || cloudGroups.value.some(group => group.files.length > 0),
)
const showBuiltIn = computed(() => selectedTabId.value === `unicode` || isSearching.value)
const currentTitle = computed(() => {
  if (isSearching.value)
    return t(`store.emoji.searchResults`)
  if (selectedTabId.value === `unicode`)
    return t(`store.emoji.builtIn.title`)
  if (selectedTabId.value === `default`)
    return t(`store.emoji.defaultPack`)
  return emojiStore.userPack?.name ?? t(`store.emoji.myPack`)
})
const currentCount = computed(() => {
  if (isSearching.value) {
    return filteredBuiltIn.value.length
      + cloudGroups.value.reduce((sum, group) => sum + group.files.length, 0)
  }
  if (selectedTabId.value === `unicode`)
    return GITHUB_EMOJI_LIST.length
  return selectedCloudPack.value?.files.length ?? 0
})
const cloudLoading = computed(() =>
  selectedTabId.value === `default` ? emojiStore.loadingDefault : emojiStore.loadingUser,
)
const cloudError = computed(() =>
  selectedTabId.value === `default` ? emojiStore.defaultError : emojiStore.userError,
)

watch(isOpen, (open) => {
  if (!open)
    return
  void emojiStore.loadDefault()
  if (authStore.isLoggedIn)
    void emojiStore.loadMine()
}, { immediate: true })

watch(() => authStore.isLoggedIn, (loggedIn) => {
  if (loggedIn && isOpen.value)
    void emojiStore.loadMine(true)
})

function selectTab(id: TabId): void {
  selectedTabId.value = id
  search.value = ``
  if (id === `default`)
    void emojiStore.loadDefault()
  if (id === `user` && authStore.isLoggedIn)
    void emojiStore.loadMine()
}

function cycleAlign(): void {
  const index = INSERT_ALIGNS.indexOf(insertAlign.value)
  insertAlign.value = INSERT_ALIGNS[(index + 1) % INSERT_ALIGNS.length]
}

function insert(file: EmojiFile): void {
  const snippet = formatEmojiSnippet({
    id: file.id,
    alt: file.name,
    widthPercent: insertMode.value === `original` ? widthPercent.value : undefined,
    align: insertAlign.value,
  })
  const view = editorStore.editor
  if (!view) {
    editorStore.insertAtCursor(`\n\n${snippet}\n\n`)
    return
  }
  const { from, to } = view.state.selection.main
  editorStore.insertAtCursor(padEmojiBlock(
    snippet,
    view.state.doc.sliceString(0, from),
    view.state.doc.sliceString(to),
  ))
}

function insertBuiltIn(name: string): void {
  editorStore.insertAtCursor(`:${name}: `)
}

function commitWidthPercent(): void {
  const value = Number.parseInt(widthPercentStr.value, 10)
  widthPercentStr.value = String(Number.isFinite(value) ? Math.max(1, Math.min(100, value)) : 20)
}

function adjustWidthPercent(delta: number): void {
  widthPercentStr.value = String(Math.max(1, Math.min(100, widthPercent.value + delta)))
}

function blurInput(event: Event): void {
  ;(event.target as HTMLInputElement).blur()
}

function startRename(): void {
  if (!emojiStore.userPack)
    return
  renamePackName.value = emojiStore.userPack.name
  renaming.value = true
  nextTick(() => renameInputRef.value?.select())
}

async function commitRename(): Promise<void> {
  if (!renaming.value)
    return
  renaming.value = false
  if (await emojiStore.renameUserPack(renamePackName.value))
    toast.success(t(`store.emoji.packRenamed`))
  else
    toast.error(t(`store.emoji.requestFailed`))
}

function openUpload(): void {
  if (!authStore.isLoggedIn) {
    uiStore.toggleShowAccountDialog(true)
    return
  }
  if (emojiStore.remainingSlots <= 0) {
    toast.error(t(`store.emoji.quotaReached`, { n: USER_EMOJI_LIMIT }))
    return
  }
  fileInput.value?.click()
}

async function onFileChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ``
  if (!files.length)
    return

  const valid = files.filter(file =>
    [`image/png`, `image/jpeg`, `image/gif`, `image/webp`].includes(file.type)
    && file.size > 0
    && file.size <= EMOJI_MAX_BYTES,
  )
  if (valid.length !== files.length)
    toast.error(t(`store.emoji.invalidFiles`))
  if (!valid.length)
    return

  const uploaded = await emojiStore.uploadFiles(valid)
  if (uploaded)
    toast.success(t(`store.emoji.uploadedCount`, { n: uploaded }))
  if (uploaded < valid.length)
    toast.error(t(`store.emoji.uploadIncomplete`))
}

function deleteFile(file: EmojiFile): void {
  confirmStore.confirm({
    title: t(`store.emoji.deleteEmoji`),
    description: t(`store.emoji.deleteEmojiConfirm`, { name: file.name }),
    destructive: true,
    onConfirm: async () => {
      if (await emojiStore.removeUserFile(file.id))
        toast.success(t(`store.emoji.emojiDeleted`))
      else
        toast.error(t(`store.emoji.requestFailed`))
    },
  })
}

function clearUserPack(): void {
  const pack = emojiStore.userPack
  if (!pack?.files.length)
    return
  confirmStore.confirm({
    title: t(`store.emoji.clearPack`),
    description: t(`store.emoji.clearPackConfirm`, { name: pack.name }),
    destructive: true,
    onConfirm: async () => {
      if (await emojiStore.clearUserPack())
        toast.success(t(`store.emoji.packCleared`))
      else
        toast.error(t(`store.emoji.requestFailed`))
    },
  })
}

function retryCloud(): void {
  if (selectedTabId.value === `default`)
    void emojiStore.loadDefault(true)
  else if (selectedTabId.value === `user`)
    void emojiStore.loadMine(true)
}

const builtinGridClass = `grid grid-cols-8 gap-0.5`
const stickerGridClass = `grid grid-cols-4 gap-1.5 sm:grid-cols-5`
const builtinCellClass = `flex aspect-square items-center justify-center rounded-lg text-[1.5rem] leading-none transition-[transform,background-color] duration-150 hover:bg-background/80 hover:scale-110 active:scale-95`
const stickerCellClass = `h-full w-full overflow-hidden rounded-xl bg-background/80 p-1.5 shadow-sm ring-1 ring-border/60 transition-[transform,box-shadow] duration-150 hover:scale-[1.04] hover:shadow-md active:scale-95`
</script>

<template>
  <div
    :class="[
      isMobile ? 'fixed inset-0 z-50 bg-background' : 'h-full overflow-hidden',
      isMobile && !isOpen ? 'translate-x-full pointer-events-none' : '',
    ]"
  >
    <div class="h-full flex flex-col bg-background">
      <div class="shrink-0 border-b px-3 py-2">
        <div class="flex items-center gap-2">
          <h2 class="min-w-0 flex-1 truncate text-sm font-semibold">
            {{ t('store.emoji.title') }}
          </h2>
          <Button variant="ghost" size="icon" class="h-7 w-7" :aria-label="t('common.close')" @click="isOpen = false">
            <X class="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div class="shrink-0 space-y-2 px-3 py-2.5">
        <div class="relative">
          <Search class="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input v-model="search" :placeholder="t('store.emoji.searchPlaceholder')" class="h-8 pl-8" />
        </div>
        <div class="flex items-center gap-2">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1">
              <input
                v-if="selectedTabId === 'user' && renaming"
                ref="renameInputRef"
                v-model="renamePackName"
                class="h-6 min-w-0 flex-1 rounded-md bg-muted/70 px-1.5 text-[13px] font-medium outline-none ring-ring focus:ring-1"
                @blur="commitRename"
                @keydown.enter.prevent="blurInput"
                @keydown.escape.prevent="renaming = false"
              >
              <div v-else class="truncate text-[13px] font-medium">
                {{ currentTitle }}
              </div>
              <button
                v-if="selectedTabId === 'user' && authStore.isLoggedIn && emojiStore.userPack && !renaming && !isSearching"
                type="button"
                class="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                :aria-label="t('store.emoji.renamePack')"
                @click="startRename"
              >
                <Pencil class="size-3" />
              </button>
            </div>
            <div class="text-[11px] tabular-nums text-muted-foreground">
              {{ t('store.emoji.count', { n: currentCount }) }}
              <span v-if="selectedTabId === 'user' && authStore.isLoggedIn"> / {{ USER_EMOJI_LIMIT }}</span>
            </div>
          </div>

          <div v-if="insertMode === 'original' && (selectedTabId !== 'unicode' || isSearching)" class="flex h-7 rounded-md bg-muted/70">
            <button class="flex size-7 items-center justify-center" :disabled="widthPercent <= 1" @click="adjustWidthPercent(-5)">
              <Minus class="size-3" />
            </button>
            <input
              v-model="widthPercentStr"
              type="number"
              min="1"
              max="100"
              class="h-7 w-7 bg-transparent text-right text-[11px] outline-none"
              @blur="commitWidthPercent"
            >
            <span class="self-center px-0.5 text-[10px] text-muted-foreground">%</span>
            <button class="flex size-7 items-center justify-center" :disabled="widthPercent >= 100" @click="adjustWidthPercent(5)">
              <Plus class="size-3" />
            </button>
          </div>
          <DropdownMenu v-if="selectedTabId !== 'unicode' || isSearching">
            <DropdownMenuTrigger as-child>
              <button class="flex h-7 items-center gap-1 rounded-md bg-muted/70 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                <Type v-if="insertMode === 'small'" class="size-3" />
                <Image v-else class="size-3" />
                <span>{{ t(`store.emoji.mode.${insertMode}`) }}</span>
                <ChevronDown class="size-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="z-250 w-36">
              <DropdownMenuItem class="gap-2" @click="insertMode = 'small'">
                <Type class="size-3.5 text-muted-foreground" />
                <span class="flex-1">{{ t('store.emoji.mode.small') }}</span>
                <Check v-if="insertMode === 'small'" class="size-3.5" />
              </DropdownMenuItem>
              <DropdownMenuItem class="gap-2" @click="insertMode = 'original'">
                <Image class="size-3.5 text-muted-foreground" />
                <span class="flex-1">{{ t('store.emoji.mode.original') }}</span>
                <Check v-if="insertMode === 'original'" class="size-3.5" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            v-if="selectedTabId !== 'unicode' || isSearching"
            type="button"
            class="flex h-7 items-center gap-1 rounded-md bg-muted/70 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            :aria-label="t(`store.emoji.align.${insertAlign}`)"
            :title="t('store.emoji.alignCycle')"
            @click="cycleAlign"
          >
            <component :is="ALIGN_ICONS[insertAlign]" class="size-3" />
            <span>{{ t(`store.emoji.align.${insertAlign}`) }}</span>
          </button>
          <Button
            v-if="selectedTabId === 'user' && authStore.isLoggedIn && emojiStore.userPack?.files.length"
            variant="ghost"
            size="icon"
            class="h-7 w-7 text-muted-foreground hover:text-destructive"
            :aria-label="t('store.emoji.clearPack')"
            @click="clearUserPack"
          >
            <Trash2 class="size-3.5" />
          </Button>
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto bg-muted/25 px-2.5 py-2">
        <div
          v-if="selectedTabId === 'user' && !authStore.isLoggedIn && !isSearching"
          class="flex h-full min-h-48 flex-col items-center justify-center gap-3 px-6 text-center"
        >
          <div class="flex size-11 items-center justify-center rounded-full bg-accent">
            <UserRound class="size-5 text-accent-foreground" />
          </div>
          <div>
            <p class="text-sm font-medium">
              {{ t('store.emoji.loginTitle') }}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              {{ t('store.emoji.loginHint') }}
            </p>
          </div>
          <Button size="sm" class="gap-1.5" @click="uiStore.toggleShowAccountDialog(true)">
            <LogIn class="size-3.5" />
            {{ t('store.emoji.loginAction') }}
          </Button>
        </div>

        <div v-else-if="cloudLoading && !isSearching" class="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
          <div v-for="index in 15" :key="index" class="aspect-square animate-pulse rounded-xl bg-muted" />
        </div>

        <div v-else-if="!emojiStore.isConfigured && selectedTabId !== 'unicode' && !isSearching" class="flex h-full min-h-48 items-center justify-center text-center">
          <p class="text-sm text-muted-foreground">
            {{ t('store.emoji.cloudUnavailable') }}
          </p>
        </div>

        <div v-else-if="cloudError && !selectedCloudPack && !isSearching" class="flex h-full min-h-48 flex-col items-center justify-center gap-2 text-center">
          <p class="text-sm text-muted-foreground">
            {{ t('store.emoji.loadFailed') }}
          </p>
          <Button variant="outline" size="sm" class="gap-1.5" @click="retryCloud">
            <RefreshCw class="size-3.5" />
            {{ t('store.emoji.retry') }}
          </Button>
        </div>

        <div v-else-if="isSearching && !hasSearchHits" class="flex h-full min-h-40 items-center justify-center text-sm text-muted-foreground">
          {{ t('store.emoji.noResults') }}
        </div>

        <template v-else>
          <div v-if="showBuiltIn && filteredBuiltIn.length" class="mb-3">
            <div v-if="isSearching" class="mb-1.5 px-1 text-[11px] font-medium text-muted-foreground">
              {{ t('store.emoji.builtIn.title') }}
            </div>
            <div :class="builtinGridClass">
              <button
                v-for="emoji in filteredBuiltIn"
                :key="emoji.name"
                type="button"
                :class="builtinCellClass"
                :title="`:${emoji.name}:`"
                @click="insertBuiltIn(emoji.name)"
              >
                <span aria-hidden="true">{{ emoji.char }}</span>
              </button>
            </div>
          </div>

          <div v-for="group in cloudGroups" :key="group.pack.id" class="mb-3">
            <div v-if="isSearching" class="mb-1.5 truncate px-1 text-[11px] font-medium text-muted-foreground">
              {{ group.pack.source === 'system' ? t('store.emoji.defaultPack') : group.pack.name }}
            </div>
            <div v-if="group.files.length" :class="stickerGridClass">
              <div v-for="file in group.files" :key="file.id" class="group relative aspect-square">
                <button type="button" :class="stickerCellClass" :title="file.name" @click="insert(file)">
                  <img :src="emojiStore.resolveUrl(file.id)" :alt="file.name" class="h-full w-full object-contain" loading="lazy">
                </button>
                <button
                  v-if="group.pack.source === 'user'"
                  type="button"
                  class="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-100 shadow-sm hover:text-destructive md:opacity-0 md:group-hover:opacity-100"
                  :aria-label="t('store.emoji.deleteEmoji')"
                  @click.stop="deleteFile(file)"
                >
                  <X class="size-3" />
                </button>
              </div>
              <button
                v-if="group.pack.source === 'user' && !isSearching"
                type="button"
                class="flex aspect-square items-center justify-center rounded-xl bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                :disabled="emojiStore.uploading || emojiStore.remainingSlots <= 0"
                :aria-label="t('store.emoji.addToPack')"
                @click="openUpload"
              >
                <span v-if="emojiStore.uploading" class="text-center text-[10px] tabular-nums">
                  {{ emojiStore.uploadDone }}/{{ emojiStore.uploadTotal }}
                </span>
                <Plus v-else class="size-5" stroke-width="1.5" />
              </button>
            </div>
            <div v-else class="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
              <p class="text-sm text-muted-foreground">
                {{ group.pack.source === 'user' ? t('store.emoji.userEmpty') : t('store.emoji.defaultEmpty') }}
              </p>
              <Button v-if="group.pack.source === 'user'" variant="outline" size="sm" class="gap-1.5" @click="openUpload">
                <Plus class="size-3.5" />
                {{ t('store.emoji.addEmoji') }}
              </Button>
            </div>
          </div>
        </template>
      </div>

      <div class="shrink-0 border-t bg-background px-2.5 py-1.5">
        <div class="flex items-center gap-1.5">
          <button
            class="flex size-9 items-center justify-center rounded-lg"
            :class="selectedTabId === 'unicode' && !isSearching ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent'"
            :title="t('store.emoji.builtIn.title')"
            @click="selectTab('unicode')"
          >
            <Smile class="size-5" />
          </button>
          <button
            class="flex size-9 items-center justify-center rounded-lg"
            :class="selectedTabId === 'default' && !isSearching ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent'"
            :title="t('store.emoji.defaultPack')"
            @click="selectTab('default')"
          >
            <Sticker class="size-5" />
          </button>
          <button
            class="flex size-9 items-center justify-center rounded-lg"
            :class="selectedTabId === 'user' && !isSearching ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent'"
            :title="t('store.emoji.myPack')"
            @click="selectTab('user')"
          >
            <UserRound class="size-5" />
          </button>
        </div>
      </div>

      <input ref="fileInput" type="file" :accept="EMOJI_ACCEPT" multiple class="hidden" @change="onFileChange">
    </div>
  </div>
</template>
