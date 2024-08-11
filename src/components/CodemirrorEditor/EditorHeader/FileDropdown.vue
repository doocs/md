<script setup>
import { onMounted, ref } from 'vue'
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
  exportEditorContent,
  downloadEditorContent,
} = store

const fileInput = ref(null)

onMounted(() => {
  fileInput.value.onchange = () => {
    const file = fileInput.value.files[0]
    if (file === null) {
      return
    }
    const read = new FileReader()
    read.readAsText(file)
    read.onload = () => {
      editor.value.setValue(read.result)
      editorRefresh()
    }
  }
})

function refClick() {
  fileInput.value.click()
}
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
        <el-dropdown-item class="leading-8" @click="refClick()">
          <el-icon>
            <ElIconUpload />
          </el-icon>
          导入 .md
          <input ref="fileInput" hidden type="file" accept=".md">
        </el-dropdown-item>
        <el-dropdown-item class="leading-8" @click="downloadEditorContent()">
          <el-icon>
            <ElIconDownload />
          </el-icon>
          导出 .md
        </el-dropdown-item>
        <el-dropdown-item class="leading-8" @click="exportEditorContent()">
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
