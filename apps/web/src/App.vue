<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import MonacoEditor from '@/views/MonacoEditor.vue'

const store = useStore()
</script>

<template>
  <AppSplash />
  <MonacoEditor />
  <Toaster
    rich-colors
    position="top-center"
    :theme="store.isDark ? 'dark' : 'light'"
  />
</template>

<style lang="less">
html,
body,
#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}

// 抵消下拉菜单开启时带来的样式
body {
  pointer-events: initial !important;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: rgba(243, 244, 247, 0.5);
}

::-webkit-scrollbar-track {
  border-radius: 6px;
  background-color: rgba(200, 200, 200, 0.3);
}

::-webkit-scrollbar-thumb {
  border-radius: 6px;
  background-color: rgba(144, 146, 152, 0.5);
}
</style>
