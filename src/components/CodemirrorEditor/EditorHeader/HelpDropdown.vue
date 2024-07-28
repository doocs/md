<script setup>
import { ref } from 'vue'
import AboutDialog from '@/components/CodemirrorEditor/AboutDialog.vue'

const aboutDialogVisible = ref(false)
</script>

<template>
  <el-dropdown>
    <span class="el-dropdown-link">
      帮助<el-icon class="ml-2"><ElIconArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          class="leading-8"
          @click="aboutDialogVisible = true"
        >
          关于
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <AboutDialog
    :visible="aboutDialogVisible"
    @close="aboutDialogVisible = false"
  />
</template>

<style lang="less" scoped>
.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
