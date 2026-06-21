<script setup lang="ts">
import { Keyboard } from '@lucide/vue'
import { computed } from 'vue'
import PanelDialog from '@/components/shared/panel-dialog/PanelDialog.vue'
import { useCommandPalette } from '@/composables/useCommandPalette'
import { buildKeyboardShortcutCategories } from '@/configs/keyboard-shortcuts'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { t, locale } = useI18n()
const { paletteShortcutLabel } = useCommandPalette()

const shortcutCategories = computed(() => {
  void locale.value
  return buildKeyboardShortcutCategories()
})

const dialogOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit(`update:open`, val),
})
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    :title="t('menu.keyboardShortcuts')"
    :description="t('keyboard.description', { shortcut: paletteShortcutLabel })"
    :icon="Keyboard"
    size="2xl"
  >
    <div class="space-y-5 overflow-y-auto px-4 py-4 sm:px-6">
      <section
        v-for="category in shortcutCategories"
        :key="category.title"
        class="space-y-2"
      >
        <h3 class="text-sm font-medium text-foreground">
          {{ category.title }}
        </h3>
        <div class="divide-y rounded-lg border">
          <div
            v-for="item in category.items"
            :key="item.label"
            class="flex items-center justify-between gap-4 px-3 py-2.5 text-sm"
          >
            <span class="text-muted-foreground">{{ item.label }}</span>
            <span class="flex shrink-0 items-center gap-1">
              <kbd
                v-for="key in item.keys"
                :key="key"
                class="inline-flex min-w-6 items-center justify-center rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground"
              >
                {{ key }}
              </kbd>
            </span>
          </div>
        </div>
      </section>
    </div>
  </PanelDialog>
</template>
