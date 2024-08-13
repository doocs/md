<script setup>
import { storeToRefs } from 'pinia'

import { useStore } from '@/stores'

const store = useStore()

const {
  isDark,
  isEditOnLeft,
} = storeToRefs(store)

const {
  toggleDark,
  toggleEditOnLeft,
  exportEditorContent2HTML,
  exportEditorContent2MD,
  importMarkdownContent,
} = store
</script>

<template>
  <el-dropdown>
    <span class="el-dropdown-link">
      文件<el-icon class="ml-2">
        <ElIconArrowDown />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item class="leading-8" @click="importMarkdownContent()">
          <el-icon>
            <ElIconUpload />
          </el-icon>
          导入 .md
        </el-dropdown-item>
        <el-dropdown-item class="leading-8" @click="exportEditorContent2MD()">
          <el-icon>
            <ElIconDownload />
          </el-icon>
          导出 .md
        </el-dropdown-item>
        <el-dropdown-item class="leading-8" @click="exportEditorContent2HTML()">
          <el-icon>
            <ElIconDocument />
          </el-icon>
          导出 .html
        </el-dropdown-item>
        <el-dropdown-item divided class="leading-8" @click="toggleDark()">
          <el-icon :class="{ 'opacity-0': !isDark }">
            <ElIconCheck />
          </el-icon>
          深色模式
        </el-dropdown-item>
        <el-dropdown-item divided class="leading-8" @click="toggleEditOnLeft()">
          <el-icon :class="{ 'opacity-0': !isEditOnLeft }">
            <ElIconCheck />
          </el-icon>
          左侧编辑
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="less" scoped>
.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
