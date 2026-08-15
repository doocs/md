<script setup lang="ts">
import type { EmojiFile, EmojiPack } from '@md/shared/types/emoji'
import { FolderOpen, Package, Plus, Smile, Trash2, X } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { importSinglePack, pickEmojiPacks } from '@/services/emoji/filePicker'
import { useConfirmStore } from '@/stores/confirm'
import { useEditorStore } from '@/stores/editor'
import { useEmojiPackStore } from '@/stores/emojiPack'
import { useUIStore } from '@/stores/ui'

type InsertMode = 'small' | 'original'

const { t } = useI18n()
const uiStore = useUIStore()
const emojiStore = useEmojiPackStore()
const editorStore = useEditorStore()
const confirmStore = useConfirmStore()

const isMobile = computed(() => uiStore.isMobile)
const isOpen = computed({
  get: () => uiStore.isOpenEmojiManager,
  set: (v: boolean) => { uiStore.isOpenEmojiManager = v },
})

const search = ref(``)
const singleFileInput = ref<HTMLInputElement | null>(null)
const insertMode = ref<InsertMode>(`small`)

// Width percent for `original` mode; stored as string so empty/invalid input
// can be recovered on blur instead of being coerced to NaN by v-model.number.
const widthPercentStr = ref<string>(`20`)
const widthPercent = computed<number>(() => {
  const n = Number.parseInt(widthPercentStr.value, 10)
  return Number.isFinite(n) ? n : 20
})
function commitWidthPercent(): void {
  const n = Number.parseInt(widthPercentStr.value, 10)
  if (!Number.isFinite(n)) {
    widthPercentStr.value = `20`
    return
  }
  const clamped = Math.max(1, Math.min(100, Math.round(n)))
  widthPercentStr.value = String(clamped)
}

function blurOnEnter(e: KeyboardEvent): void {
  ;(e.target as HTMLInputElement).blur()
}

const filteredPacks = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q)
    return emojiStore.packs
  return emojiStore.packs.filter((p) => {
    if (p.name.toLowerCase().includes(q))
      return true
    return p.files.some(f => f.name.toLowerCase().includes(q))
  })
})

/* Quick-delete: multi-select popover state. */
const isDeletePopoverOpen = ref(false)
const selectedPackIds = ref<Set<string>>(new Set())

const selectedCount = computed(() => selectedPackIds.value.size)
const allFilteredSelected = computed(() =>
  filteredPacks.value.length > 0
  && filteredPacks.value.every(p => selectedPackIds.value.has(p.id)),
)

function togglePackSelected(packId: string): void {
  const next = new Set(selectedPackIds.value)
  if (next.has(packId))
    next.delete(packId)
  else
    next.add(packId)
  selectedPackIds.value = next
}

function toggleSelectAll(): void {
  if (allFilteredSelected.value) {
    selectedPackIds.value = new Set()
  }
  else {
    selectedPackIds.value = new Set(filteredPacks.value.map(p => p.id))
  }
}

// Drop selection entries that no longer correspond to a pack (e.g. after a
// single-pack delete via the per-card trash button).
watch(() => emojiStore.packs.map(p => p.id).join(`|`), (joined) => {
  const live = new Set(joined.split(`|`).filter(Boolean))
  const next = new Set<string>()
  for (const id of selectedPackIds.value) {
    if (live.has(id))
      next.add(id)
  }
  if (next.size !== selectedPackIds.value.size)
    selectedPackIds.value = next
})

function resetDeleteSelection(): void {
  selectedPackIds.value = new Set()
  isDeletePopoverOpen.value = false
}

function confirmDeleteSelected(): void {
  const ids = Array.from(selectedPackIds.value)
  if (!ids.length)
    return
  isDeletePopoverOpen.value = false
  confirmStore.confirm({
    title: t(`store.emoji.deleteSelectedTitle`, { n: ids.length }),
    description: t(`store.emoji.deleteSelectedConfirm`, { n: ids.length }),
    confirmText: t(`store.emoji.deleteSelected`, { n: ids.length }),
    destructive: true,
    onConfirm: () => {
      emojiStore.removePacks(ids)
      resetDeleteSelection()
      toast.success(t(`store.emoji.packsDeleted`, { n: ids.length }))
    },
    onCancel: () => {
      isDeletePopoverOpen.value = true
    },
  })
}

async function importFolder() {
  try {
    const result = await pickEmojiPacks()
    if (!result.packs.length)
      return
    // Fire the success toast before `ingest()` so the user gets instant
    // feedback the moment the picker closes. `ingest()` writes blobs to IDB
    // and pushes the packs into the reactive store; that work happens in the
    // background and the cards appear shortly after the toast pops up. If
    // IDB persistence fails, the `catch` block surfaces the error below.
    // Count files, not packs — a folder like Bilibili's default emoji pack
    // has 6 subfolders (packs) but hundreds of individual files; reporting
    // `packs.length` reads as "imported 6 emoji images" and is misleading.
    const totalFiles = result.packs.reduce((sum, p) => sum + p.files.length, 0)
    toast.success(t(`store.emoji.importedCount`, { n: totalFiles }))
    await ingest(result)
  }
  catch (err) {
    toast.error((err as Error).message)
  }
}

async function importSingle() {
  singleFileInput.value?.click()
}

async function onSingleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0)
    return
  try {
    const result = await importSinglePack(target.files)
    const totalFiles = result.packs.reduce((sum, p) => sum + p.files.length, 0)
    toast.success(t(`store.emoji.importedCount`, { n: totalFiles }))
    await ingest(result)
  }
  catch (err) {
    toast.error((err as Error).message)
  }
  target.value = ``
}

async function ingest(result: { packs: EmojiPack[], blobs: Map<string, Blob> }) {
  for (const pack of result.packs) {
    await emojiStore.addPack(pack, result.blobs)
  }
}

function deletePack(pack: EmojiPack) {
  confirmStore.confirm({
    title: t(`store.emoji.deletePack`),
    description: t(`store.emoji.deleteConfirm`, { name: pack.name }),
    destructive: true,
    onConfirm: () => {
      emojiStore.removePack(pack.id)
      toast.success(t(`store.emoji.packDeleted`, { name: pack.name }))
    },
  })
}

function insert(file: EmojiFile) {
  if (insertMode.value === `small`) {
    editorStore.insertAtCursor(`{{emoji:${file.id}}} `)
  }
  else {
    editorStore.insertAtCursor(`![${file.name}](asset://${file.id}){${widthPercent.value}%} `)
  }
  toast.success(t(`store.emoji.inserted`))
}

function emojiImgSrc(file: EmojiFile): string {
  return emojiStore.resolveUrl(file.id)
}
</script>

<template>
  <div
    :class="[
      isMobile
        ? 'fixed inset-0 z-50 bg-background transition-transform duration-300'
        : 'h-full overflow-hidden',
      isMobile && !isOpen ? 'translate-x-full pointer-events-none' : '',
      isMobile && isOpen ? 'translate-x-0' : '',
    ]"
  >
    <div class="h-full flex flex-col">
      <div
        v-if="isMobile"
        class="sticky top-0 z-10 -mx-4 mb-4 border-b bg-background px-4 pb-3 pt-[max(0.5rem,env(safe-safe-area-inset-top,0px))]"
      >
        <div aria-hidden="true" class="mx-auto mb-2 h-1 w-10 rounded-full bg-muted-foreground/25" />
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold flex items-center gap-2">
            <Smile class="h-4 w-4" /> {{ t('store.emoji.title') }}
          </h2>
          <Button variant="ghost" size="sm" @click="isOpen = false">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div v-else class="flex items-center justify-between border-b px-4 py-3">
        <h2 class="font-semibold flex items-center gap-2 text-sm">
          <Smile class="h-4 w-4" /> {{ t('store.emoji.title') }}
        </h2>
        <Button variant="ghost" size="icon" class="h-7 w-7" @click="isOpen = false">
          <X class="h-3.5 w-3.5" />
        </Button>
      </div>

      <div class="flex flex-col gap-2 p-3">
        <Input v-model="search" :placeholder="t('store.emoji.searchPlaceholder')" class="h-8" />
        <div class="flex gap-2">
          <Button variant="outline" size="sm" class="flex-1" @click="importFolder">
            <FolderOpen class="mr-1 h-3.5 w-3.5" /> {{ t('store.emoji.importFolder') }}
          </Button>
          <Button variant="outline" size="sm" class="flex-1" @click="importSingle">
            <Plus class="mr-1 h-3.5 w-3.5" /> {{ t('store.emoji.importPack') }}
          </Button>
        </div>
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 self-start">
            <div class="flex rounded-md border bg-muted/40 p-0.5 text-xs">
              <button
                class="px-2 py-0.5 rounded-sm transition-colors"
                :class="insertMode === 'small' ? 'bg-background shadow-sm' : 'text-muted-foreground'"
                @click="insertMode = 'small'"
              >
                {{ t('store.emoji.mode.small') }}
              </button>
              <button
                class="px-2 py-0.5 rounded-sm transition-colors"
                :class="insertMode === 'original' ? 'bg-background shadow-sm' : 'text-muted-foreground'"
                @click="insertMode = 'original'"
              >
                {{ t('store.emoji.mode.original') }}
              </button>
            </div>
            <div v-if="insertMode === 'original'" class="flex items-center gap-1">
              <Input
                v-model="widthPercentStr"
                type="number"
                min="1"
                max="100"
                step="1"
                class="h-6 w-14 px-2 text-xs"
                :aria-label="t('store.emoji.widthPercentLabel')"
                @blur="commitWidthPercent"
                @keydown.enter.prevent="blurOnEnter"
              />
              <span class="text-xs text-muted-foreground">%</span>
            </div>
          </div>
          <Popover v-model:open="isDeletePopoverOpen">
            <PopoverTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-7 w-7 text-muted-foreground hover:text-destructive"
                :disabled="!emojiStore.packs.length"
                :title="t('store.emoji.quickDelete')"
                :aria-label="t('store.emoji.quickDelete')"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              :side-offset="6"
              class="w-72 p-0"
            >
              <div class="flex items-center justify-between border-b px-3 py-2">
                <span class="text-xs font-medium text-muted-foreground">
                  {{ t('store.emoji.selectToDelete') }}
                </span>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="text-[11px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    :disabled="!filteredPacks.length"
                    @click="toggleSelectAll"
                  >
                    {{ allFilteredSelected ? t('common.deselectAll') : t('common.selectAll') }}
                  </button>
                  <button
                    type="button"
                    class="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm inline-flex items-center justify-center"
                    :title="t('common.close')"
                    :aria-label="t('common.close')"
                    @click="isDeletePopoverOpen = false"
                  >
                    <X class="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div class="max-h-64 overflow-y-auto py-1">
                <label
                  v-for="pack in filteredPacks"
                  :key="pack.id"
                  class="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    :model-value="selectedPackIds.has(pack.id)"
                    @update:model-value="togglePackSelected(pack.id)"
                  />
                  <span class="truncate">{{ pack.name }}</span>
                  <span class="ml-auto text-[10px] tabular-nums text-muted-foreground">
                    {{ pack.files.length }}
                  </span>
                </label>
                <div v-if="!filteredPacks.length" class="px-3 py-6 text-center text-xs text-muted-foreground">
                  {{ t('store.emoji.empty') }}
                </div>
              </div>
              <div v-if="selectedCount > 0" class="border-t px-3 py-2">
                <Button
                  variant="destructive"
                  size="sm"
                  class="w-full"
                  @click="confirmDeleteSelected"
                >
                  <Trash2 class="mr-1 h-3.5 w-3.5" />
                  {{ t('store.emoji.deleteSelected', { n: selectedCount }) }}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <p v-if="insertMode === 'original'" class="text-[11px] text-muted-foreground leading-relaxed">
          {{ t('store.emoji.ratioHint', { n: widthPercent }) }}
        </p>
        <input
          ref="singleFileInput"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          multiple
          class="hidden"
          @change="onSingleFileChange"
        >
      </div>

      <div class="flex-1 overflow-auto px-3 pb-4 space-y-3">
        <div
          v-if="emojiStore.packs.length === 0"
          class="flex flex-col items-center justify-center text-center gap-2 py-12 text-muted-foreground"
        >
          <Package class="size-10 rounded-xl bg-muted/50 p-2" />
          <p class="text-sm">
            {{ t('store.emoji.empty') }}
          </p>
        </div>

        <div
          v-for="pack in filteredPacks"
          :key="pack.id"
          class="rounded-md border bg-card text-card-foreground"
        >
          <div class="flex items-center justify-between px-3 py-2">
            <div class="min-w-0">
              <div class="text-sm font-medium truncate">
                {{ pack.name }}
              </div>
              <div class="text-xs text-muted-foreground">
                {{ t('store.emoji.fileCount', { n: pack.files.length }) }}
              </div>
            </div>
            <Button variant="ghost" size="icon" class="h-7 w-7" @click="deletePack(pack)">
              <Trash2 class="h-3.5 w-3.5" />
            </Button>
          </div>
          <div class="grid grid-cols-6 gap-1 p-2 border-t">
            <button
              v-for="file in pack.files"
              :key="file.id"
              class="aspect-square rounded overflow-hidden bg-muted/30 hover:ring-2 ring-primary/50 focus:outline-hidden"
              :title="file.name"
              @click="insert(file)"
            >
              <img
                :src="emojiImgSrc(file)"
                :alt="file.name"
                class="w-full h-full object-contain"
                loading="lazy"
              >
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
