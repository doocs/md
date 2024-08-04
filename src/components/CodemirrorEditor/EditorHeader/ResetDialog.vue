<script>
export default {
  props: {
    showResetConfirm: {
      type: Boolean,
      default: false,
    },
  },
  emits: [`close`, `confirm`],
}
</script>

<template>
  <el-dialog
    title="提示"
    class="reset__dialog"
    width="30%"
    :model-value="showResetConfirm"
    center
    @close="$emit('close')"
  >
    <div style="text-align: center">
      此操作将丢失本地自定义样式，是否继续?
    </div>
    <template #footer>
      <el-button plain @click="$emit('close')">
        取 消
      </el-button>
      <el-button plain type="primary" @click="$emit('confirm')">
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
