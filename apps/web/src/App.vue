<script setup lang="ts">
import CodemirrorEditor from '@/components/editor/CodemirrorEditor.vue'
import CommandPalette from '@/components/editor/dialogs/CommandPalette.vue'
import ConfirmDialog from '@/components/shared/confirm-dialog/ConfirmDialog.vue'
import { Toaster } from '@/components/ui/sonner'
import { useCommandPaletteHotkey } from '@/composables/useCommandPaletteHotkey'
import { usePreferencesHotkey } from '@/composables/usePreferencesHotkey'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const { isDark } = storeToRefs(uiStore)

usePlatformEnv()
useAccountSyncBootstrap()
useDeepLinkImport()
useCommandPaletteHotkey()
usePreferencesHotkey()
</script>

<template>
  <CodemirrorEditor />

  <CommandPalette />

  <ConfirmDialog />

  <Toaster
    rich-colors
    position="top-center"
    class="!z-[200]"
    :duration="1200"
    :visible-toasts="1"
    :theme="isDark ? 'dark' : 'light'"
  />
</template>
