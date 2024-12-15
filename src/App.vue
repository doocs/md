<script setup lang="ts">
import CodemirrorEditor from '@/views/CodemirrorEditor.vue'
</script>

<template>
  <CodemirrorEditor />
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
  background-color: #ffffff;
}

::-webkit-scrollbar-track {
  border-radius: 6px;
  background-color: rgba(200, 200, 200, 0.3);
}

::-webkit-scrollbar-thumb {
  border-radius: 6px;
  background-color: rgba(144, 146, 152, 0.5);
}

/* CSS-hints */
.CodeMirror-hints {
  position: absolute;
  z-index: 10;
  overflow-y: auto;
  margin: 0;
  padding: 2px;
  border-radius: 4px;
  max-height: 20em;
  min-width: 200px;
  font-size: 12px;
  font-family: monospace;

  color: #333333;
  background-color: #ffffff;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.12),
    0 2px 4px 0 rgba(0, 0, 0, 0.08);
}

.CodeMirror-hint {
  margin-top: 10px;
  padding: 4px 6px;
  border-radius: 2px;
  white-space: pre;
  color: #000000;
  cursor: pointer;

  &:first-of-type {
    margin-top: 0;
  }
  &:hover {
    background: #f0f0f0;
  }
}
</style>
