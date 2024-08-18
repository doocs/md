<script setup>
import CodemirrorEditor from '@/views/CodemirrorEditor.vue'
</script>

<template>
  <CodemirrorEditor />
</template>

<style lang="less">
// 仿 uniapp 外层全屏
html,
body,
#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
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

// 修复分栏线负数 margin 导致的轴向滚动条
.el-dropdown-menu__item--divided:before {
  margin: 0;
}

// 修复颜色选择器下拉箭头位置
.el-icon.el-color-picker__icon.is-icon-arrow-down {
  position: absolute;
}

// 参见：https://github.com/element-plus/element-plus/issues/11662
.el-dropdown-link:focus-visible {
  outline: unset;
}
</style>
