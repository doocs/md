<script setup lang="ts">
import CodemirrorEditor from '@/components/editor/CodemirrorEditor.vue'
import ConfirmDialog from '@/components/shared/confirm-dialog/ConfirmDialog.vue'
import { Toaster } from '@/components/ui/sonner'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const { isDark } = storeToRefs(uiStore)

usePlatformEnv()
useAccountSyncBootstrap()
useCollabBootstrap()
useCollabStyleWatcher()
useDeepLinkImport()
</script>

<template>
  <CodemirrorEditor />

  <ConfirmDialog />

  <Toaster
    rich-colors
    position="top-center"
    :duration="1200"
    :visible-toasts="1"
    :theme="isDark ? 'dark' : 'light'"
  />
</template>
