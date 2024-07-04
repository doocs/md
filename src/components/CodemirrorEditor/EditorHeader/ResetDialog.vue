<script>
import { mapState } from 'pinia'
import { useStore } from '@/stores'

export default {
  props: {
    showResetConfirm: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'confirm'],
  computed: {
    btnType() {
      return this.nightMode ? `default` : `primary`
    },
    ...mapState(useStore, {
      nightMode: state => state.nightMode,
    }),
  },
}
</script>

<template>
  <el-dialog
    title="提示"
    class="reset__dialog"
    :model-value="showResetConfirm"
    center
    @close="$emit('close')"
  >
    <div style="text-align: center">
      此操作将丢失本地自定义样式，是否继续?
    </div>
    <template #footer>
      <el-button :type="btnType" plain @click="$emit('close')">
        取 消
      </el-button>
      <el-button :type="btnType" plain @click="$emit('confirm')">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
:deep(.el-dialog) {
  min-width: 440px;
}
</style>
