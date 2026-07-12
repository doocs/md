<script setup lang="ts">
import type { PdfMargins, PdfPageNumberFormat, PdfPageNumberPosition } from '@/services/export'
import { FileText, Loader2, Printer } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import PanelDialog from '@/components/shared/panel-dialog/PanelDialog.vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { normalizePdfExportOptions } from '@/services/export'
import { useExportStore } from '@/stores/export'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { t } = useI18n()
const uiStore = useUIStore()
const exportStore = useExportStore()

const { pdfExportOptions } = storeToRefs(uiStore)

const dialogOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit(`update:open`, value),
})

const isExporting = ref(false)

const pageNumberFormatOptions = computed(() => [
  { value: `nOfM` as const, label: t(`pdfExport.pageNumberFormat.nOfM`) },
  { value: `n` as const, label: t(`pdfExport.pageNumberFormat.n`) },
])

const pageNumberPositionOptions = computed(() => [
  { value: `bottomLeft` as const, label: t(`pdfExport.pageNumberPosition.bottomLeft`) },
  { value: `bottomCenter` as const, label: t(`pdfExport.pageNumberPosition.bottomCenter`) },
  { value: `bottomRight` as const, label: t(`pdfExport.pageNumberPosition.bottomRight`) },
])

const marginsOptions = computed(() => [
  { value: `compact` as const, label: t(`pdfExport.margins.compact`) },
  { value: `default` as const, label: t(`pdfExport.margins.default`) },
  { value: `comfortable` as const, label: t(`pdfExport.margins.comfortable`) },
])

function setPageNumberFormat(value: PdfPageNumberFormat) {
  pdfExportOptions.value.pageNumberFormat = value
}

function setPageNumberPosition(value: PdfPageNumberPosition) {
  pdfExportOptions.value.pageNumberPosition = value
}

function setMargins(value: PdfMargins) {
  pdfExportOptions.value.margins = value
}

async function handleExport() {
  if (isExporting.value)
    return

  isExporting.value = true
  try {
    const options = normalizePdfExportOptions(pdfExportOptions.value)
    pdfExportOptions.value = options
    await exportStore.exportEditorContent2PDF(options)
    dialogOpen.value = false
  }
  finally {
    isExporting.value = false
  }
}
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    :title="t('pdfExport.title')"
    :description="t('pdfExport.description')"
    :icon="FileText"
    size="md"
  >
    <div class="space-y-1 px-4 py-4 sm:px-6">
      <div class="flex items-center justify-between gap-4 border-b py-3">
        <div class="min-w-0 space-y-0.5">
          <Label for="pdf-page-numbers">{{ t('pdfExport.pageNumbers.label') }}</Label>
          <p class="text-xs text-muted-foreground">
            {{ t('pdfExport.pageNumbers.hint') }}
          </p>
        </div>
        <Switch
          id="pdf-page-numbers"
          class="shrink-0"
          :model-value="pdfExportOptions.showPageNumbers"
          @update:model-value="pdfExportOptions.showPageNumbers = $event"
        />
      </div>

      <template v-if="pdfExportOptions.showPageNumbers">
        <div class="space-y-2 border-b py-3">
          <Label class="text-sm">{{ t('pdfExport.pageNumberFormat.label') }}</Label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in pageNumberFormatOptions"
              :key="option.value"
              type="button"
              class="rounded-md border px-3 py-1.5 text-sm transition-colors"
              :class="pdfExportOptions.pageNumberFormat === option.value
                ? 'border-primary bg-primary/5 font-medium text-primary ring-1 ring-primary/20'
                : 'text-muted-foreground hover:bg-muted/50'"
              @click="setPageNumberFormat(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="space-y-2 border-b py-3">
          <Label class="text-sm">{{ t('pdfExport.pageNumberPosition.label') }}</Label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in pageNumberPositionOptions"
              :key="option.value"
              type="button"
              class="rounded-md border px-3 py-1.5 text-sm transition-colors"
              :class="pdfExportOptions.pageNumberPosition === option.value
                ? 'border-primary bg-primary/5 font-medium text-primary ring-1 ring-primary/20'
                : 'text-muted-foreground hover:bg-muted/50'"
              @click="setPageNumberPosition(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </template>

      <div class="flex items-center justify-between gap-4 border-b py-3">
        <div class="min-w-0 space-y-0.5">
          <Label for="pdf-title-header">{{ t('pdfExport.titleHeader.label') }}</Label>
          <p class="text-xs text-muted-foreground">
            {{ t('pdfExport.titleHeader.hint') }}
          </p>
        </div>
        <Switch
          id="pdf-title-header"
          class="shrink-0"
          :model-value="pdfExportOptions.showTitleHeader"
          @update:model-value="pdfExportOptions.showTitleHeader = $event"
        />
      </div>

      <div class="flex items-center justify-between gap-4 border-b py-3">
        <div class="min-w-0 space-y-0.5">
          <Label for="pdf-site-footer">{{ t('pdfExport.siteFooter.label') }}</Label>
          <p class="text-xs text-muted-foreground">
            {{ t('pdfExport.siteFooter.hint') }}
          </p>
        </div>
        <Switch
          id="pdf-site-footer"
          class="shrink-0"
          :model-value="pdfExportOptions.showSiteFooter"
          @update:model-value="pdfExportOptions.showSiteFooter = $event"
        />
      </div>

      <div class="space-y-2 py-3">
        <Label class="text-sm">{{ t('pdfExport.margins.label') }}</Label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in marginsOptions"
            :key="option.value"
            type="button"
            class="rounded-md border px-3 py-1.5 text-sm transition-colors"
            :class="pdfExportOptions.margins === option.value
              ? 'border-primary bg-primary/5 font-medium text-primary ring-1 ring-primary/20'
              : 'text-muted-foreground hover:bg-muted/50'"
            @click="setMargins(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        class="h-10 w-full gap-2"
        :disabled="isExporting"
        @click="handleExport"
      >
        <Loader2 v-if="isExporting" class="size-4 animate-spin" />
        <Printer v-else class="size-4" />
        {{ t('pdfExport.export') }}
      </Button>
    </template>
  </PanelDialog>
</template>
