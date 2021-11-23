<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="less">
// 仿 uniapp 外层全屏
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>

<style lang="less">
/* 每个页面公共css */
@import url("./assets/less/style-mirror.css");
@import url("./assets/less/theme.less");
@import url("./assets/less/code-theme.less");
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: #fff;
}

::-webkit-scrollbar-track {
  border-radius: 6px;
  background-color: rgba(200, 200, 200, 0.3);
}

::-webkit-scrollbar-thumb {
  border-radius: 6px;
  background-color: rgba(144, 146, 152, 0.5);
  transition: background-color 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(144, 146, 152, 0.5);
}
/* CSS-hints */
.CodeMirror-hints {
  position: absolute;
  z-index: 10;
  overflow: hidden;
  list-style: none;

  margin: 0;
  padding: 2px;

  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  min-width: 200px;
  font-size: 12px;
  font-family: monospace;

  max-height: 20em;
  overflow-y: auto;
  color: #333333;
}

.CodeMirror-hint {
  margin: 0;
  margin-top: 10px;
  padding: 4px 6px;
  border-radius: 2px;
  white-space: pre;
  color: black;
  cursor: pointer;
}
.CodeMirror-hint:first-of-type {
  margin-top: 0;
}
.CodeMirror-hint:hover {
  background: #f0f0f0;
}
</style>
