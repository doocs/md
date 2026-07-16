<script setup lang="ts">
import type { AppLocale } from '@/i18n/types'
import { Settings } from '@lucide/vue'
import PanelDialog from '@/components/shared/panel-dialog/PanelDialog.vue'
import PanelSelect from '@/components/shared/panel-dialog/PanelSelect.vue'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEditorRefresh } from '@/composables/useEditorRefresh'
import { LOCALE_OPTIONS, SUPPORTED_LOCALES } from '@/i18n/constants'
import { useLocaleStore } from '@/stores/locale'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { t } = useI18n()
const localeStore = useLocaleStore()
const uiStore = useUIStore()
const themeStore = useThemeStore()
const { editorRefresh } = useEditorRefresh()

const dialogOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit(`update:open`, val),
})

const {
  isDark,
  showAIToolbox,
  viewMode,
  previewDevice,
  enableImageReupload,
  enableScrollSync,
} = storeToRefs(uiStore)

const { isCountStatus } = storeToRefs(themeStore)

const activeTab = ref(`general`)

watch(dialogOpen, (open) => {
  if (!open)
    activeTab.value = `general`
})

const viewModeOptions = computed(() => [
  { value: `edit`, label: t(`preferences.viewModeOption.edit`) },
  { value: `split`, label: t(`preferences.viewModeOption.split`) },
  { value: `preview`, label: t(`preferences.viewModeOption.preview`) },
] as const)

const previewDeviceOptions = computed(() => [
  { value: `desktop`, label: t(`preferences.previewDeviceOption.desktop`) },
  { value: `mobile`, label: t(`preferences.previewDeviceOption.mobile`) },
] as const)

const localeOptions = computed(() =>
  LOCALE_OPTIONS.map(option => ({
    value: option.value,
    label: t(option.labelKey),
  })),
)

function setCountStatus(value: boolean) {
  isCountStatus.value = value
  editorRefresh()
}

function onLocaleChange(value: string) {
  if ((SUPPORTED_LOCALES as readonly string[]).includes(value))
    void localeStore.setLocale(value as AppLocale)
}
</script>

<template>
  <PanelDialog
    v-model:open="dialogOpen"
    :title="t('preferences.title')"
    :description="t('preferences.description')"
    :icon="Settings"
    size="lg"
  >
    <Tabs v-model="activeTab" activation-mode="manual" class="px-4 py-4 sm:px-6">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="general">
          {{ t('preferences.tab.general') }}
        </TabsTrigger>
        <TabsTrigger value="editor">
          {{ t('preferences.tab.editor') }}
        </TabsTrigger>
        <TabsTrigger value="preview">
          {{ t('preferences.tab.preview') }}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" class="mt-4 space-y-1">
        <div class="flex items-center justify-between gap-4 border-b py-3">
          <div class="min-w-0 space-y-0.5">
            <Label>{{ t('preferences.language.label') }}</Label>
            <p class="text-xs text-muted-foreground">
              {{ t('preferences.language.hint') }}
            </p>
          </div>
          <PanelSelect
            :model-value="localeStore.locale"
            :options="localeOptions"
            @update:model-value="onLocaleChange"
          />
        </div>

        <div class="flex items-center justify-between gap-4 py-3">
          <div class="min-w-0 space-y-0.5">
            <Label for="pref-dark-mode">{{ t('preferences.darkMode.label') }}</Label>
          </div>
          <Switch
            id="pref-dark-mode"
            class="shrink-0"
            :model-value="isDark"
            @update:model-value="uiStore.toggleDark($event)"
          />
        </div>
      </TabsContent>

      <TabsContent value="editor" class="mt-4 space-y-1">
        <div class="flex items-center justify-between gap-4 border-b py-3">
          <div class="min-w-0 space-y-0.5">
            <Label>{{ t('preferences.viewMode.label') }}</Label>
          </div>
          <PanelSelect
            :model-value="viewMode"
            :options="viewModeOptions"
            @update:model-value="uiStore.setViewMode($event as typeof viewMode)"
          />
        </div>

        <div class="flex items-center justify-between gap-4 border-b py-3">
          <div class="min-w-0 space-y-0.5">
            <Label for="pref-scroll-sync">{{ t('preferences.scrollSync.label') }}</Label>
            <p class="text-xs text-muted-foreground">
              {{ t('preferences.scrollSync.hint') }}
            </p>
          </div>
          <Switch
            id="pref-scroll-sync"
            class="shrink-0"
            :model-value="enableScrollSync"
            @update:model-value="enableScrollSync = $event"
          />
        </div>

        <div class="flex items-center justify-between gap-4 border-b py-3">
          <div class="min-w-0 space-y-0.5">
            <Label for="pref-ai-toolbox">{{ t('preferences.showAIToolbox.label') }}</Label>
            <p class="text-xs text-muted-foreground">
              {{ t('preferences.showAIToolbox.hint') }}
            </p>
          </div>
          <Switch
            id="pref-ai-toolbox"
            class="shrink-0"
            :model-value="showAIToolbox"
            @update:model-value="showAIToolbox = $event"
          />
        </div>

        <div class="flex items-center justify-between gap-4 py-3">
          <div class="min-w-0 space-y-0.5">
            <Label for="pref-image-reupload">{{ t('preferences.imageReupload.label') }}</Label>
            <p class="text-xs text-muted-foreground">
              {{ t('preferences.imageReupload.hint') }}
            </p>
          </div>
          <Switch
            id="pref-image-reupload"
            class="shrink-0"
            :model-value="enableImageReupload"
            @update:model-value="enableImageReupload = $event"
          />
        </div>
      </TabsContent>

      <TabsContent value="preview" class="mt-4 space-y-1">
        <div class="flex items-center justify-between gap-4 border-b py-3">
          <div class="min-w-0 space-y-0.5">
            <Label>{{ t('preferences.previewDevice.label') }}</Label>
          </div>
          <PanelSelect
            :model-value="previewDevice"
            :options="previewDeviceOptions"
            @update:model-value="uiStore.setPreviewDevice($event as typeof previewDevice)"
          />
        </div>

        <div class="flex items-center justify-between gap-4 py-3">
          <div class="min-w-0 space-y-0.5">
            <Label for="pref-word-count">{{ t('preferences.wordCount.label') }}</Label>
            <p class="text-xs text-muted-foreground">
              {{ t('preferences.wordCount.hint') }}
            </p>
          </div>
          <Switch
            id="pref-word-count"
            class="shrink-0"
            :model-value="isCountStatus"
            @update:model-value="setCountStatus($event)"
          />
        </div>
      </TabsContent>
    </Tabs>
  </PanelDialog>
</template>
