<script setup lang="ts">
import { browser } from 'wxt/browser'
import logo from '/mpmd/logo.svg'

function onOpenOption() {
  browser.runtime.openOptionsPage()
}
</script>

<template>
  <div class="container popup-body">
    <div
      class="title"
      style="height: 40px; display: inline-flex; padding-left: 60px;"
    >
      <img style="height: 40px" :src="logo">
      <span
        style="
          font-size: 16px;
          line-height: 40px;
          font-weight: bold;
          margin-left: 8px;
        "
      >使用必读</span>
    </div>
    <section style="margin-top: 12px; line-height: 28px">
      <div>如果您希望使用微信公众号素材库作为图床功能，需要进行以下配置：</div>
      <div>
        1.开启公众号开发者模式
        <span><a
          href="https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Getting_Started_Guide.html"
          target="_blank"
        >查看文档</a></span>
      </div>
      <div>
        2.配置IP白名单<span><a href="https://mpmd.pages.dev/tutorial" target="_blank">使用教程</a></span>
      </div>
      <div>
        <button class="button" @click="onOpenOption">
          开始使用
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.popup-body {
  min-width: 300px;
  scroll-behavior: auto;
  margin-top: 20px;
}
.container {
  width: 100%;
  box-sizing: border-box;
  padding-right: 15px;
  padding-left: 15px;
  padding-bottom: 15px;
  margin-right: auto;
  margin-left: auto;
  font-size: 14px;
}
.button {
  padding: 2px 6px;
  background: #07c060;
  color: #fff;
  border-radius: 4px;
}
section a {
  text-decoration: underline;
}
</style>
