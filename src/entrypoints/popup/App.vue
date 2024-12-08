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
        <span><el-link
          type="primary"
          href="https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Getting_Started_Guide.html"
          target="_blank"
        >查看文档</el-link></span>
      </div>
      <div>
        2.配置IP白名单<span><el-link type="primary" href="https://mpmd.pages.dev/tutorial" target="_blank">使用教程</el-link></span>
      </div>
      <div>
        <el-link type="primary" href="#" @click="onOpenOption">
          开始使用
        </el-link>
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
</style>
