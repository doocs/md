<script setup>
import { useStore } from '@/stores'

const store = useStore()

const {
  toggleShowInsertFormDialog,
  toggleShowUploadImgDialog,
} = store
</script>

<template>
  <el-dropdown>
    <span class="el-dropdown-link">
      编辑<el-icon class="ml-2">
        <ElIconArrowDown />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item class="leading-8" @click="toggleShowUploadImgDialog()">
          <el-icon>
            <ElIconUpload />
          </el-icon>
          上传图片
        </el-dropdown-item>
        <el-dropdown-item class="leading-8" @click="toggleShowInsertFormDialog()">
          <el-icon>
            <ElIconGrid />
          </el-icon>
          插入表格
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
